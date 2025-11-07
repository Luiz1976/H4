import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import path from 'path';

// Criar banco SQLite local para desenvolvimento
const sqlite = new Database('humaniq-dev.db');

// Configurar WAL mode para melhor performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Função para executar migrações
export async function runMigrations() {
  try {
    console.log('🔄 Executando migrações SQLite...');
    
    // Criar tabelas básicas se não existirem
    await createTables();
    
    console.log('✅ Migrações SQLite concluídas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Função para criar tabelas básicas
async function createTables() {
  // Criar tabela admins
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      senha TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela empresas
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      nome_empresa TEXT NOT NULL,
      email_contato TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cnpj TEXT,
      endereco TEXT,
      setor TEXT,
      numero_colaboradores INTEGER,
      dias_acesso INTEGER,
      data_expiracao TEXT,
      admin_id TEXT REFERENCES admins(id),
      ativo BOOLEAN DEFAULT true,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela colaboradores
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS colaboradores (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cargo TEXT,
      departamento TEXT,
      empresa_id TEXT REFERENCES empresas(id),
      ativo BOOLEAN DEFAULT true,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela testes
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS testes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT,
      tempo_estimado INTEGER,
      ativo BOOLEAN DEFAULT true,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('📊 Tabelas SQLite criadas com sucesso!');
}

export { sqlite };