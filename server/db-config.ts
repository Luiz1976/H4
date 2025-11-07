import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';

// Escolher banco baseado no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = !!process.env.DATABASE_URL;

let db: any;
let dbType: string;

if (isProduction && hasDatabaseUrl) {
  // Usar PostgreSQL em produção (postgres-js)
  console.log('🔗 Conectando ao PostgreSQL (postgres-js)...');

  const client = postgres(process.env.DATABASE_URL!, {
    max: 20,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  db = drizzlePostgres(client, { schema });
  dbType = 'PostgreSQL (postgres-js)';
} else {
  // Usar SQLite em desenvolvimento
  console.log('🔗 Conectando ao SQLite (desenvolvimento)...');

  const sqlite = new Database('humaniq-dev.db');
  sqlite.pragma('journal_mode = WAL');

  db = drizzle(sqlite, { schema });
  dbType = 'SQLite (desenvolvimento)';
}

// Função para executar migrações
export async function runMigrations() {
  try {
    console.log(`🔄 Executando migrações ${dbType}...`);

    if (dbType.includes('SQLite')) {
      // Executar migrações SQLite
      const { runMigrations: runSQLiteMigrations } = await import('./db-sqlite');
      await runSQLiteMigrations();
    } else {
      // Para PostgreSQL, assumir que as tabelas já existem
      console.log('✅ PostgreSQL: assumindo que as tabelas já existem');
    }

    console.log(`✅ Migrações ${dbType} concluídas com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao executar migrações ${dbType}:`, error);
    throw error;
  }
}

export { db, dbType };