import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import { cursos } from '../src/data/cursosData';

// Assuming running from root or scripts dir, database is likely in root 'humaniq-dev.db'
const dbPath = path.resolve('humaniq-dev.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function check() {
    console.log(`--- Verifying Fix (DB: ${dbPath}) ---`);

    const dbRecords = await db.select().from(schema.cursoDisponibilidade);
    console.log(`DB Availability Records: ${dbRecords.length}`);

    const codeSlugs = new Set(cursos.map(c => c.slug));
    const dbSlugs = new Set(dbRecords.map(r => r.cursoId));

    console.log('\n--- Checking Compatibility ---');
    let mismatchCount = 0;

    dbRecords.forEach(record => {
        if (!codeSlugs.has(record.cursoId)) {
            console.error(`❌ Mismatch: DB has release for '${record.cursoId}' but course NOT FOUND in code.`);
            mismatchCount++;
        } else {
            //   console.log(`✅ Match: '${record.cursoId}' found in code.`);
        }
    });

    if (mismatchCount === 0) {
        console.log('✅ All database availability records match a course in the code!');
        console.log('Sample matching slugs:');
        Array.from(dbSlugs).slice(0, 3).forEach(s => console.log(` - ${s}`));
    } else {
        console.error(`❌ Found ${mismatchCount} mismatches.`);
    }

    process.exit(mismatchCount > 0 ? 1 : 0);
}

check().catch(console.error);
