
import { db } from '../server/db-config';
import { colaboradores, cursoDisponibilidade, cursoAvaliacoes, certificados } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('🔍 Investigating course visibility (simplified)...');

    const emailColaborador = 'aline@humaniq.com.br';

    // 1. Find Collaborator
    const [colaborador] = await db.select().from(colaboradores).where(eq(colaboradores.email, emailColaborador)).limit(1);

    if (!colaborador) {
        console.error(`❌ Collaborator not found: ${emailColaborador}`);
        process.exit(1);
    }

    console.log(`✅ Collaborator found: ${colaborador.nome} (ID: ${colaborador.id})`);

    // 2. Check Course Availability (Release)
    console.log('\n--- Course Availability (Releases) ---');
    const disponibilidades = await db.select().from(cursoDisponibilidade).where(eq(cursoDisponibilidade.colaboradorId, colaborador.id));

    if (disponibilidades.length === 0) {
        console.log('⚠️ No courses released for this collaborator.');
    } else {
        for (const disp of disponibilidades) {
            console.log(`- CourseID (Slug): ${disp.cursoId}, Available: ${disp.disponivel}`);
        }
    }

    // 3. Check Course Completions (Evaluations)
    console.log('\n--- Course Completions (Evaluations) ---');
    const avaliacoes = await db.select().from(cursoAvaliacoes).where(eq(cursoAvaliacoes.colaboradorId, colaborador.id));

    if (avaliacoes.length === 0) {
        console.log('ℹ️ No course evaluations found.');
    } else {
        for (const av of avaliacoes) {
            console.log(`- CourseID: ${av.cursoId}, Score: ${av.pontuacao}, Approved: ${av.aprovado}`);
        }
    }

    // 4. Check Certificates
    console.log('\n--- Certificates ---');
    const userCertificats = await db.select().from(certificados).where(eq(certificados.colaboradorId, colaborador.id));

    if (userCertificats.length === 0) {
        console.log('ℹ️ No certificates found.');
    } else {
        for (const cert of userCertificats) {
            console.log(`- CourseSlug: ${cert.cursoSlug}, Code: ${cert.codigoAutenticacao}`);
        }
    }

    process.exit(0);
}

main().catch(console.error);
