
import Database from 'better-sqlite3';
import path from 'path';

async function debugPsychosocialCalculation() {
    console.log('🔍 Iniciando debug do cálculo psicossocial (Raw SQLite + Fixes)...');

    try {
        const dbPath = path.join(process.cwd(), 'humaniq-dev.db');
        console.log(`📂 Abrindo banco de dados: ${dbPath}`);
        const sqlite = new Database(dbPath);
        sqlite.pragma('journal_mode = WAL');

        const query = `
        SELECT id, empresa_id, colaborador_id, metadados, data_realizacao 
        FROM resultados 
        ORDER BY data_realizacao DESC 
        LIMIT 20
    `;

        const ultimosResultados = sqlite.prepare(query).all().map((r: any) => ({
            ...r,
            metadados: typeof r.metadados === 'string' ? JSON.parse(r.metadados) : r.metadados,
            empresaId: r.empresa_id,
            colaboradorId: r.colaborador_id,
            dataRealizacao: r.data_realizacao
        }));

        if (ultimosResultados.length === 0) {
            console.log('❌ Nenhum resultado encontrado no banco.');
            return;
        }

        const resultadosPorEmpresa: Record<string, typeof ultimosResultados> = {};
        for (const r of ultimosResultados) {
            if (!r.empresaId) continue;
            if (!resultadosPorEmpresa[r.empresaId]) resultadosPorEmpresa[r.empresaId] = [];
            resultadosPorEmpresa[r.empresaId].push(r);
        }

        for (const [empresaId, resultadosEmpresa] of Object.entries(resultadosPorEmpresa)) {
            console.log(`\n🏢 Analisando Empresa ID: ${empresaId} (${resultadosEmpresa.length} testes)`);

            const dimensoesNegativas = new Set([
                'demanda-psicologica',
                'esforco-exigido',
                'hipercomprometimento',
                'conflito_trabalho_familia',
                'assedio_violencia',
                'esgotamento_profissional',
                'demandas_trabalho',
                'estresse',
                'burnout'
            ]);

            const dimensoesAgregadas: Record<string, { total: number; soma: number; rawValues: number[], invertedValues: number[] }> = {};

            for (const resultado of resultadosEmpresa) {
                const metadados = resultado.metadados || {};
                const analiseCompleta = metadados.analise_completa || {};

                console.log(`   📝 Teste ID: ${resultado.id} - Colaborador: ${resultado.colaboradorId} - Data: ${resultado.dataRealizacao}`);

                if (analiseCompleta.dimensoes) {
                    Object.entries(analiseCompleta.dimensoes).forEach(([dimensaoId, dados]: [string, any]) => {
                        if (!dimensoesAgregadas[dimensaoId]) {
                            dimensoesAgregadas[dimensaoId] = { total: 0, soma: 0, rawValues: [], invertedValues: [] };
                        }

                        let valor = dados.percentual || dados.media || dados.pontuacao || 0;
                        const originalValor = valor;

                        // 1. Normalização GLOBAL (para todos os campos)
                        // Se valor <= 5 e não tem flag explicita de percentual
                        if (valor <= 5 && !dados.percentual) {
                            valor = (valor / 5) * 100;
                        }

                        const valorNormalizado = valor;
                        let foiInvertido = false;

                        // 2. Lógica de inversão para dimensões negativas
                        if (dimensoesNegativas.has(dimensaoId)) {
                            valor = Math.max(0, 100 - valor);
                            foiInvertido = true;
                        }

                        console.log(`      - Dimensão: ${dimensaoId.padEnd(30)} | Original: ${String(originalValor).padEnd(5)} | Norm: ${String(valorNormalizado).padEnd(5)} | Final: ${String(valor).padEnd(5)} | Inv? ${foiInvertido ? 'S' : 'N'}`);

                        dimensoesAgregadas[dimensaoId].total++;
                        dimensoesAgregadas[dimensaoId].soma += valor;
                        dimensoesAgregadas[dimensaoId].rawValues.push(originalValor);
                        dimensoesAgregadas[dimensaoId].invertedValues.push(valor);
                    });
                } else {
                    console.log(`      ⚠️ Sem 'analise_completa.dimensoes' nos metadados.`);
                }
            }

            // Calcular médias finais
            const dimensoesAnalise = Object.entries(dimensoesAgregadas).map(([dimensaoId, dados]) => {
                const media = dados.total > 0 ? dados.soma / dados.total : 0;
                return {
                    dimensaoId,
                    percentual: Math.round(media),
                    total: dados.total
                };
            });

            // Calcular índice geral
            const indiceGeralBemEstar = dimensoesAnalise.length > 0
                ? Math.round(dimensoesAnalise.reduce((acc, d) => acc + d.percentual, 0) / dimensoesAnalise.length)
                : 0;

            console.log(`   ❤️  ÍNDICE GERAL CALCULADO: ${indiceGeralBemEstar}%`);

            console.log('   📊 Detalhe das Médias por Dimensão:');
            dimensoesAnalise.forEach(d => {
                console.log(`      - ${d.dimensaoId.padEnd(30)}: ${d.percentual}%`);
            });
        }

    } catch (error) {
        console.error('❌ Erro no debug:', error);
    } finally {
        process.exit(0);
    }
}

debugPsychosocialCalculation();
