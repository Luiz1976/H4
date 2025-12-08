import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema';
import path from 'path';

const dbPath = path.resolve('humaniq-dev.db');
const sqlite = new Database(dbPath);

console.log(`--- DB Slugs (DB: ${dbPath}) ---`);
const rows = sqlite.prepare('SELECT DISTINCT curso_id FROM curso_disponibilidade').all();

console.log('Unique curso_ids in DB:');
rows.forEach((row: any) => {
    console.log(`- "${row.curso_id}"`);
});
