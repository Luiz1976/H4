import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { cursoDisponibilidade } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import path from 'path';

const dbPath = path.resolve('humaniq-dev.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema: { cursoDisponibilidade } });

const MAPPINGS = {
    "comunicação-não-violenta": "comunicacao-nao-violenta",
    "diversidade-inclusão-respeito": "diversidade-inclusao-respeito",
    "gestão-estresse-qualidade-vida": "gestao-estresse-qualidade-vida",
    "gestão-riscos-psicossociais-saúde-mental": "gestao-riscos-psicossociais-saude-mental",
    "inteligência-emocional-liderança": "inteligencia-emocional-lideranca",
    "liderança-humanizada-clima-organizacional": "lideranca-humanizada-clima-organizacional",
    "prevenção-assedio-moral-sexual": "prevencao-assedio-moral-sexual"
};

async function migrate() {
    console.log('--- Migrating Accented Slugs ---');
    let migratedCount = 0;
    let deletedCount = 0;

    for (const [accented, normalized] of Object.entries(MAPPINGS)) {
        console.log(`Processing: ${accented} -> ${normalized}`);

        // Find all records with accented slug
        const records = await db.select().from(cursoDisponibilidade).where(eq(cursoDisponibilidade.cursoId, accented));

        if (records.length === 0) {
            console.log(`  No records found for ${accented}.`);
            continue;
        }

        console.log(`  Found ${records.length} records to migrate.`);

        for (const record of records) {
            // Check if normalized version already exists for this collaborator
            const [existing] = await db.select()
                .from(cursoDisponibilidade)
                .where(and(
                    eq(cursoDisponibilidade.cursoId, normalized),
                    eq(cursoDisponibilidade.colaboradorId, record.colaboradorId)
                ))
                .limit(1);

            if (existing) {
                console.log(`  Duplicate found for collaborator ${record.colaboradorId}. Deleting accented record ${record.id}...`);
                await db.delete(cursoDisponibilidade).where(eq(cursoDisponibilidade.id, record.id));
                deletedCount++;
            } else {
                console.log(`  Migrating record ${record.id} to normalized slug...`);
                await db.update(cursoDisponibilidade)
                    .set({ cursoId: normalized })
                    .where(eq(cursoDisponibilidade.id, record.id));
                migratedCount++;
            }
        }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Deleted (Duplicates): ${deletedCount}`);
}

migrate().catch(console.error);
