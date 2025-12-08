import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema';
import { like, eq, or } from 'drizzle-orm';
import path from 'path';

const dbPath = path.resolve('humaniq-dev.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function debug() {
    console.log('--- Finding Company and Collaborators ---');

    // Search for company by name OR email
    const companies = await db.select().from(schema.empresas)
        .where(or(
            like(schema.empresas.nomeEmpresa, '%Teste%'),
            like(schema.empresas.emailContato, '%teste%'),
            like(schema.empresas.emailContato, '%humaniq%')
        ))
        .limit(20);

    console.log(`Found ${companies.length} companies matching criteria:`);

    for (const comp of companies) {
        console.log(`\n[${comp.nomeEmpresa}] (ID: ${comp.id}) Email: ${comp.emailContato}`);

        const collabs = await db.select().from(schema.colaboradores)
            .where(eq(schema.colaboradores.empresaId, comp.id));

        console.log(`  Collaborators (${collabs.length}):`);
        collabs.forEach(c => console.log(`  - ${c.nome} (${c.email})`));
    }
}

debug().catch(console.error);
