import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'cursosData.ts');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('--- Slugs found ---');
lines.forEach((line, index) => {
    if (line.includes('slug:')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
