import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Sanitização da DATABASE_URL para evitar crashes em produção
function sanitizeDatabaseUrl(raw?: string): string | null {
  if (!raw) return null;
  // Remover possível prefixo "psql " e aspas simples/duplas ao redor
  const trimmed = raw.trim().replace(/^psql\s+/, '').replace(/^['"]|['"]$/g, '');
  try {
    // Validar formato com URL
    const u = new URL(trimmed);
    if (!u.protocol.startsWith('postgres')) return null;
    return trimmed;
  } catch {
    return null;
  }
}

const isProduction = process.env.NODE_ENV === 'production';
let dbUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);

if (!dbUrl && isProduction) {
  throw new Error('DATABASE_URL inválida. Remova prefixo "psql" e aspas, ex: postgresql://user:pass@host/db?sslmode=require');
}

let client: any;
let db: any;

// Em desenvolvimento, quando DATABASE_URL estiver ausente/inválida, usar SQLite local
if (!dbUrl && !isProduction) {
  console.warn('⚠️  DATABASE_URL ausente/invalidada em dev. Usando SQLite local.');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sqliteModule = require('../server/db-sqlite');
  db = sqliteModule.db;
  client = null;
} else {
  client = postgres(dbUrl!, {
    max: 20,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzle(client, { schema });
}

export { db, client };
