import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';

const dbPath = path.resolve('humaniq-dev.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function debug() {
    console.log('--- Debugging User Courses (Direct SQL) ---');

    const email = 'aline@humaniq.com.br';
    console.log(`Looking up collaborator: ${email}`);

    const [collaborator] = await db.select().from(schema.colaboradores)
        .where(eq(schema.colaboradores.email, email))
        .limit(1);

    if (!collaborator) {
        console.error('❌ Collaborator not found!');
        return;
    }

    console.log(`✅ Found collaborator: ${collaborator.nome} (ID: ${collaborator.id})`);
    console.log(`   Company ID: ${collaborator.empresaId}`);

    // Fetch Company
    if (collaborator.empresaId) {
        const [company] = await db.select().from(schema.empresas)
            .where(eq(schema.empresas.id, collaborator.empresaId))
            .limit(1);
        console.log(`   Company Name: ${company?.nomeEmpresa}`);
        console.log(`   Company Email: ${company?.emailContato}`);
    }

    // Fetch Availability
    const availabilities = await db.select().from(schema.cursoDisponibilidade)
        .where(eq(schema.cursoDisponibilidade.colaboradorId, collaborator.id));

    console.log(`\n--- Availability Records (${availabilities.length}) ---`);
    availabilities.forEach(a => {
        console.log(`- Course: "${a.cursoId}" | Available: ${a.disponivel} | Locked: ${a.bloqueado}`);
    });
}

debug().catch(console.error);
