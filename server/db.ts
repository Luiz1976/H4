import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Configuração do banco baseada no ambiente
let db: any;

if (process.env.NODE_ENV === 'production') {
  // PostgreSQL (Neon) para produção (usando postgres-js)
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Conexão persistente robusta para Render usando postgres-js
  const client = postgres(process.env.DATABASE_URL, {
    max: 20,           // Máximo de conexões no pool
    idle_timeout: 20,  // Segundos para encerrar conexões ociosas
    connect_timeout: 10, // Segundos para tentar conectar
  });

  db = drizzle(client, { schema });
} else {
  // SQLite para desenvolvimento (importação condicional para evitar bindings nativos em prod)
  const Database = require('better-sqlite3');
  const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
  const sqlite = new Database('humaniq-dev.db');
  sqlite.pragma('journal_mode = WAL');

  db = drizzleSqlite(sqlite, { schema });
}

export { db };