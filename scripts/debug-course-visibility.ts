
import { db } from '../server/db-config';
import { colaboradores, cursoDisponibilidade, cursoAvaliacoes, certificados } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { cursos } from '../src/data/cursosData';

async function main() {
    console.log('🔍 Investigating course visibility...');

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
            console.log(`- CourseID (Slug): ${disp.cursoId}, Available: ${disp.disponivel}, Last Released: ${disp.ultimaLiberacao}`);
        }
    }

    // 3. Check Course Completions (Evaluations)
    console.log('\n--- Course Completions (Evaluations) ---');
    const avaliacoes = await db.select().from(cursoAvaliacoes).where(eq(cursoAvaliacoes.colaboradorId, colaborador.id));

    if (avaliacoes.length === 0) {
        console.log('ℹ️ No course evaluations found.');
    } else {
        for (const av of avaliacoes) {
            console.log(`- CourseID: ${av.cursoId}, Score: ${av.pontuacao}, Approved: ${av.aprovado}, Date: ${av.dataRealizacao}`);
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

    // 5. Cross-Reference with Static Data
    console.log('\n--- Analysis ---');
    for (const disp of disponibilidades) {
        const cursoStatic = cursos.find(c => c.slug === disp.cursoId);
        if (!cursoStatic) {
            console.warn(`⚠️ ALERT: Released course slug "${disp.cursoId}" does NOT match any course in cursosData.ts!`);
        } else {
            console.log(`✅ Slug "${disp.cursoId}" matches course "${cursoStatic.título}"`);
        }

        const isCompleted = avaliacoes.some(a => a.cursoId === disp.cursoId && (a.aprovado === true || a.aprovado === 1));
        const hasCertificate = userCertificats.some(c => c.cursoSlug === disp.cursoId);

        if (isCompleted && !hasCertificate) {
            console.error(`🚨 LIMBO DETECTED for "${disp.cursoId}": Completed but NO certificate. This course is likely hidden.`);
        }
    }

    process.exit(0);
}

main().catch(console.error);
