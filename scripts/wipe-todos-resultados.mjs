import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Utilidades de log
const log = {
  info: (...args) => console.log('ℹ️', ...args),
  ok: (...args) => console.log('✅', ...args),
  warn: (...args) => console.log('⚠️', ...args),
  err: (...args) => console.error('❌', ...args),
};

// Ler variáveis de ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  log.err('Variáveis de ambiente ausentes. Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function countTable(table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) {
    log.err(`Erro ao contar na tabela ${table}:`, error.message);
    return null;
  }
  return count ?? 0;
}

async function listIds(table, idColumn = 'id', limit = 1000) {
  const { data, error } = await supabase
    .from(table)
    .select(idColumn)
    .limit(limit);
  if (error) {
    throw new Error(`Falha ao listar IDs em ${table}: ${error.message}`);
  }
  return (data || []).map((row) => row[idColumn]).filter(Boolean);
}

async function deleteChunk(table, ids) {
  if (!ids.length) return { data: [], error: null };
  return await supabase.from(table).delete().in('id', ids);
}

async function deleteAllFromTable(table) {
  let totalDeleted = 0;
  while (true) {
    const ids = await listIds(table, 'id', 1000);
    if (!ids.length) break;
    const { error } = await deleteChunk(table, ids);
    if (error) {
      throw new Error(`Erro ao deletar em ${table}: ${error.message}`);
    }
    totalDeleted += ids.length;
    log.info(`Tabela ${table}: deletados ${ids.length} registros (total até agora: ${totalDeleted})`);
    // Evitar sobrecarga
    await new Promise((r) => setTimeout(r, 200));
  }
  return totalDeleted;
}

async function main() {
  const confirm = process.argv.includes('--yes');
  log.info('Projeto:', SUPABASE_URL);

  // Contagens antes
  const before = {
    resultados: await countTable('resultados'),
    respostas: await countTable('respostas'),
    resultados_qvt: await countTable('resultados_qvt'),
    respostas_individuais_qvt: await countTable('respostas_individuais_qvt'),
  };

  log.info('Contagens atuais:');
  console.table(before);

  if (!confirm) {
    log.warn('Execução em modo somente leitura. Adicione --yes para executar a exclusão definitiva.');
    return;
  }

  log.warn('ATENÇÃO: Exclusão definitiva de TODOS os resultados e respostas (inclui QVT).');
  log.warn('Prosseguindo em 1 segundo...');
  await new Promise((r) => setTimeout(r, 1000));

  // Ordem: apagar QVT (resultados e respostas individuais), depois resultados genéricos (cascateia respostas)
  const deleted = {
    resultados_qvt: 0,
    respostas_individuais_qvt: 0,
    resultados: 0,
  };

  // Apagar QVT - resultados
  deleted.resultados_qvt = await deleteAllFromTable('resultados_qvt');
  // Apagar QVT - respostas individuais
  deleted.respostas_individuais_qvt = await deleteAllFromTable('respostas_individuais_qvt');
  // Apagar resultados genéricos (cascateia para respostas)
  deleted.resultados = await deleteAllFromTable('resultados');

  log.ok('Exclusões concluídas:', deleted);

  // Contagens depois
  const after = {
    resultados: await countTable('resultados'),
    respostas: await countTable('respostas'),
    resultados_qvt: await countTable('resultados_qvt'),
    respostas_individuais_qvt: await countTable('respostas_individuais_qvt'),
  };

  log.ok('Contagens após exclusão:');
  console.table(after);

  // Avaliação simples
  const allZero = Object.values(after).every((n) => (typeof n === 'number' ? n === 0 : false));
  if (allZero) {
    log.ok('Todos os dados de resultados foram excluídos definitivamente.');
    process.exit(0);
  } else {
    log.warn('Nem todas as tabelas ficaram vazias. Verifique RLS/Policies e tente novamente.');
    process.exit(2);
  }
}

main().catch((err) => {
  log.err('Erro inesperado na execução:', err?.message || err);
  process.exit(1);
});