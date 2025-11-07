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

let dbUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);

if (!dbUrl) {
  console.warn('⚠️  DATABASE_URL inválida ou não definida. Operações de banco podem falhar.');
  // Para desenvolvimento, usar um mock local; em produção, falhar cedo via logs
  if (process.env.NODE_ENV !== 'production') {
    dbUrl = 'postgresql://localhost:5432/mock_db';
  } else {
    throw new Error('DATABASE_URL inválida. Remova prefixo "psql" e aspas, ex: postgresql://user:pass@host/db?sslmode=require');
  }
}

export const client = postgres(dbUrl, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
