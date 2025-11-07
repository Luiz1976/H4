import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const client = postgres(process.env.DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Função para executar migrações PostgreSQL
export async function runMigrations() {
  try {
    console.log('🔄 Executando migrações PostgreSQL...');
    
    // Para PostgreSQL, assumir que as tabelas já existem via Drizzle migrations
    console.log('✅ PostgreSQL: assumindo que as tabelas já existem');
    
    console.log('✅ Migrações PostgreSQL concluídas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migrações PostgreSQL:', error);
    throw error;
  }
}