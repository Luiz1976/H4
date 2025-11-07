import dotenv from 'dotenv';
import postgres from 'postgres';

// Carregar env de forma robusta: priorizar process.env.DATABASE_URL válido
let databaseUrl: string | undefined =
  process.env.DATABASE_URL && /^postgres(ql)?:\/\//.test(process.env.DATABASE_URL)
    ? process.env.DATABASE_URL
    : undefined;

if (!databaseUrl) {
  const envPaths = ['.env', '.env.production', '.env.render'];
  for (const p of envPaths) {
    const res = dotenv.config({ path: p });
    const candidate = res.parsed?.DATABASE_URL;
    if (candidate && /^postgres(ql)?:\/\//.test(candidate)) {
      databaseUrl = candidate;
      break;
    }
  }
}

async function main() {
  const email = 'admin@humaniq.com';
  const hash = '$2b$10$bP2k6ojdNdEp2aQ7vmn5kuSBq/zrod73aduwyy7xWMqzmPFlqQeVS'; // bcrypt de Luiz@1976

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL ausente. Configure no .env.production');
    process.exit(1);
  }

  // Conexão postgres-js (Robusta para Neon/Render)
  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    ssl: 'require',
  });

  try {
    // 0) Garantir coluna 'senha' existe e é NOT NULL
    const colCheck = await sql`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'admins' AND column_name = 'senha'
    `;
    if (!Array.isArray(colCheck) || colCheck.length === 0) {
      await sql`ALTER TABLE admins ADD COLUMN senha VARCHAR(255)`;
      await sql`ALTER TABLE admins ALTER COLUMN senha SET DEFAULT ${hash}`;
      await sql`UPDATE admins SET senha = COALESCE(senha, ${hash})`;
      await sql`ALTER TABLE admins ALTER COLUMN senha SET NOT NULL`;
      await sql`ALTER TABLE admins ALTER COLUMN senha DROP DEFAULT`;
    }

    // 1) Tentar UPDATE direto
    const updateRes = await sql`
      UPDATE admins
      SET senha = ${hash}, updated_at = NOW()
      WHERE email = ${email}
    `;

    if ((updateRes as any).count && (updateRes as any).count > 0) {
      console.log('RESET_STATUS=UPDATE');
      await sql.end();
      process.exit(0);
    }

    // 2) Se não atualizou, tentar INSERT
    const insertRes = await sql`
      INSERT INTO admins (email, nome, senha)
      VALUES (${email}, ${'Admin'}, ${hash})
      RETURNING id, email
    `;

    if (Array.isArray(insertRes) && insertRes.length > 0) {
      console.log('RESET_STATUS=INSERT');
      await sql.end();
      process.exit(0);
    }

    // Se chegou aqui, algo inesperado ocorreu
    console.error('❌ Nenhuma linha afetada e INSERT não retornou linha.');
    await sql.end();
    process.exit(2);
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error('❌ Erro ao resetar senha do admin:', msg);

    // Dica se for RLS
    if (msg.includes('violates row-level security policy') || msg.toLowerCase().includes('row level security')) {
      console.error('💡 Possível bloqueio por RLS. Verifique políticas INSERT/UPDATE em admins ou execute via papel com permissão adequada.');
    }

    try { await sql.end(); } catch {}
    process.exit(1);
  }
}

main();