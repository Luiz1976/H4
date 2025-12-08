import express from 'express';
import { db } from '../db-config';
import { empresas, colaboradores, resultados } from '../../shared/schema';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { parseDateSeguro } from '../utils/dateUtils';
import logger from '../utils/logger';

import { gte } from 'drizzle-orm';

const router = express.Router();

// Data de corte para "zerar" as métricas (08/12/2025)
const DATA_INICIO_METRICAS = new Date('2025-12-08T00:00:00.000Z');

// Admin: Dashboard executivo com métricas agregadas de todas as empresas
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    logger.info('📊 [ADMIN DASHBOARD] Carregando métricas executivas...');

    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    // Buscar todas as empresas (com fallback seguro se DB indisponível)
    let todasEmpresas: any[] = [];
    const empresasQueryStart = Date.now();
    try {
      todasEmpresas = await db.select().from(empresas).where(gte(empresas.createdAt, DATA_INICIO_METRICAS));
    } catch (err) {
      logger.warn('⚠️ [ADMIN DASHBOARD] Falha ao buscar empresas', { error: (err as any)?.message });
      todasEmpresas = [];
    } finally {
      const durationMs = Date.now() - empresasQueryStart;
      logger.info('⏱️ [ADMIN DASHBOARD] Tempo consulta empresas', { durationMs, count: todasEmpresas.length });
    }
    const empresasAtivas = todasEmpresas.filter(e => e?.ativa);
    const empresasInativas = todasEmpresas.filter(e => !e?.ativa);
    const empresasNovasEsteMes = todasEmpresas.filter(e => {
      const dt = parseDateSeguro(e?.createdAt as any);
      return dt ? dt >= inicioMes : false;
    });

    // Buscar todos os colaboradores (com fallback seguro)
    let todosColaboradores: any[] = [];
    const colaboradoresQueryStart = Date.now();
    try {
      todosColaboradores = await db.select().from(colaboradores).where(gte(colaboradores.createdAt, DATA_INICIO_METRICAS));
    } catch (err) {
      logger.warn('⚠️ [ADMIN DASHBOARD] Falha ao buscar colaboradores', { error: (err as any)?.message });
      todosColaboradores = [];
    } finally {
      const durationMs = Date.now() - colaboradoresQueryStart;
      logger.info('⏱️ [ADMIN DASHBOARD] Tempo consulta colaboradores', { durationMs, count: todosColaboradores.length });
    }
    const colaboradoresAtivos = todosColaboradores.filter(c => c?.ativo);

    // Buscar todos os resultados de testes (com fallback seguro)
    let todosResultados: any[] = [];
    const resultadosQueryStart = Date.now();
    try {
      todosResultados = await db
        .select({
          id: resultados.id,
          empresaId: resultados.empresaId,
          colaboradorId: resultados.colaboradorId,
          pontuacaoTotal: resultados.pontuacaoTotal,
          dataRealizacao: resultados.dataRealizacao,
          metadados: resultados.metadados,
        })
        .from(resultados)
        .where(gte(resultados.dataRealizacao, DATA_INICIO_METRICAS));
    } catch (err) {
      logger.warn('⚠️ [ADMIN DASHBOARD] Falha ao buscar resultados', { error: (err as any)?.message });
      todosResultados = [];
    } finally {
      const durationMs = Date.now() - resultadosQueryStart;
      logger.info('⏱️ [ADMIN DASHBOARD] Tempo consulta resultados', { durationMs, count: todosResultados.length });
    }

    // Observabilidade de datas
    const validEmpDates: Date[] = [];
    let invalidEmpDates = 0;
    for (const e of todasEmpresas) {
      const dt = parseDateSeguro((e as any)?.createdAt);
      if (dt) validEmpDates.push(dt); else invalidEmpDates++;
    }
    const minEmpDate = validEmpDates.length ? new Date(Math.min(...validEmpDates.map(d => d.getTime()))) : null;
    const maxEmpDate = validEmpDates.length ? new Date(Math.max(...validEmpDates.map(d => d.getTime()))) : null;
    logger.info('📆 [ADMIN DASHBOARD] Datas empresas', {
      total: todasEmpresas.length,
      invalid: invalidEmpDates,
      minCreatedAt: minEmpDate ? minEmpDate.toISOString() : null,
      maxCreatedAt: maxEmpDate ? maxEmpDate.toISOString() : null,
    });

    const validColabDates: Date[] = [];
    let invalidColabDates = 0;
    for (const c of todosColaboradores) {
      const dt = parseDateSeguro((c as any)?.createdAt);
      if (dt) validColabDates.push(dt); else invalidColabDates++;
    }
    const minColabDate = validColabDates.length ? new Date(Math.min(...validColabDates.map(d => d.getTime()))) : null;
    const maxColabDate = validColabDates.length ? new Date(Math.max(...validColabDates.map(d => d.getTime()))) : null;
    logger.info('📆 [ADMIN DASHBOARD] Datas colaboradores', {
      total: todosColaboradores.length,
      invalid: invalidColabDates,
      minCreatedAt: minColabDate ? minColabDate.toISOString() : null,
      maxCreatedAt: maxColabDate ? maxColabDate.toISOString() : null,
    });

    // 💰 FINANCEIRO
    const planoTiers = {
      essencial: { limite: 50, valor: 15 },
      profissional: { limite: 200, valor: 25 },
      enterprise: { limite: Infinity, valor: 35 }
    };

    let receitaTotal = 0;
    let distribuicaoPlanos: { Essencial: number; Profissional: number; Enterprise: number } = { Essencial: 0, Profissional: 0, Enterprise: 0 };
    let empresasComReceita: { empresaId: any; receita: number; plano: string; colaboradores: number }[] = [];
    try {
      empresasComReceita = empresasAtivas.map(empresa => {
        const colabsEmpresa = todosColaboradores.filter(c => c.empresaId === empresa.id).length;

        let plano = 'Essencial';
        let valor = 15;

        if (colabsEmpresa > 50 && colabsEmpresa <= 200) {
          plano = 'Profissional';
          valor = 25;
        } else if (colabsEmpresa > 200) {
          plano = 'Enterprise';
          valor = 35;
        }

        const receitaEmpresa = colabsEmpresa * valor;
        receitaTotal += receitaEmpresa;
        distribuicaoPlanos[plano as keyof typeof distribuicaoPlanos]++;

        return { empresaId: empresa.id, receita: receitaEmpresa, plano, colaboradores: colabsEmpresa };
      });
    } catch (err) {
      logger.warn('💰 [ADMIN DASHBOARD] Erro ao calcular empresasComReceita', { error: (err as any)?.message });
      empresasComReceita = [];
      receitaTotal = 0;
      distribuicaoPlanos = { Essencial: 0, Profissional: 0, Enterprise: 0 };
    }

    const mrr = receitaTotal;
    const arr = mrr * 12;
    const ticketMedio = empresasAtivas.length > 0 ? Math.round(receitaTotal / empresasAtivas.length) : 0;

    // Crescimento MRR (simulado baseado em empresas novas)
    const crescimentoMRR = empresasNovasEsteMes.length > 0
      ? Number(((empresasNovasEsteMes.length / Math.max(empresasAtivas.length, 1)) * 100).toFixed(1))
      : 0;

    // 📈 CONVERSÃO (estimado)
    let visitantesLanding = 0;
    let testesDemonstracao = 0;
    let checkoutsIniciados = 0;
    let comprasFinalizadas = 0;
    try {
      // Remover simulações de piso (ex: 200) para zerar se não houver dados novos
      visitantesLanding = Math.max(todosColaboradores.length * 5, empresasAtivas.length * 50, 0);
      testesDemonstracao = Math.floor(visitantesLanding * 0.15); // Taxa estimada
      checkoutsIniciados = Math.floor(testesDemonstracao * 0.4); // Taxa estimada
      comprasFinalizadas = empresasAtivas.length; // Real
    } catch (err) {
      logger.warn('📈 [ADMIN DASHBOARD] Erro ao calcular métricas de conversão', { error: (err as any)?.message });
      visitantesLanding = 0;
      testesDemonstracao = 0;
      checkoutsIniciados = 0;
      comprasFinalizadas = 0;
    }

    // Remover qualquer simulação de taxas; indicadores devem vir de dados reais
    const taxaLandingParaDemo = 0;
    const taxaDemoParaCheckout = 0;
    const taxaCheckoutParaCompra = 0;
    const taxaConversaoGeral = 0;

    // 👥 EMPRESAS E COLABORADORES
    const crescimentoMensal = empresasAtivas.length > 0
      ? Number(((empresasNovasEsteMes.length / empresasAtivas.length) * 100).toFixed(1))
      : 0;

    const churnRate = todasEmpresas.length > 0
      ? Number(((empresasInativas.length / todasEmpresas.length) * 100).toFixed(1))
      : 0;

    const mediaPorEmpresa = empresasAtivas.length > 0
      ? Number((todosColaboradores.length / empresasAtivas.length).toFixed(1))
      : 0;

    const crescimentoColaboradores = todosColaboradores.filter(c => {
      const dt = parseDateSeguro(c?.createdAt as any);
      return dt ? dt >= inicioMes : false;
    }).length;

    const crescimentoColabPercentual = todosColaboradores.length > 0
      ? Number(((crescimentoColaboradores / todosColaboradores.length) * 100).toFixed(1))
      : 0;

    // 📊 TENDÊNCIAS (últimos 6 meses)
    const receitaMensal: { mes: string; receita: number; empresas: number }[] = [];
    try {
      for (let i = 5; i >= 0; i--) {
        const mesData = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
        const mesFim = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);

        const empresasMes = todasEmpresas.filter(e => {
          const dt = parseDateSeguro(e?.createdAt as any);
          return dt ? dt < mesFim && e.ativa : false;
        });

        let receitaMes = 0;
        empresasMes.forEach(empresa => {
          const colabs = todosColaboradores.filter(c => c.empresaId === empresa.id).length;
          let valor = 15;
          if (colabs > 50 && colabs <= 200) valor = 25;
          else if (colabs > 200) valor = 35;
          receitaMes += colabs * valor;
        });

        receitaMensal.push({
          mes: mesData.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          receita: receitaMes,
          empresas: empresasMes.length,
        });
      }
    } catch (err) {
      logger.warn('📊 [ADMIN DASHBOARD] Erro ao calcular tendência de receita mensal', { error: (err as any)?.message });
    }

    // 💎 KPIs ESTRATÉGICOS
    const ltv = ticketMedio * 12; // Assumindo 12 meses de retenção média
    const cac = 500; // Custo estimado de aquisição
    const ltvCacRatio = cac > 0 ? Number((ltv / cac).toFixed(1)) : 0;
    const paybackPeriod = ticketMedio > 0 ? Math.round(cac / ticketMedio) : 0;

    // 🔮 PROJEÇÕES
    const projecaoProximoMes = Math.round(mrr * (1 + (crescimentoMRR / 100)));
    const projecaoTrimestre = Math.round(projecaoProximoMes * 3);

    const dashboard = {
      financeiro: {
        mrr,
        arr,
        receitaMensal: receitaTotal,
        receitaTotal: receitaTotal * Math.max(todasEmpresas.length, 1),
        ticketMedio,
        crescimentoMRR,
        projecaoProximoMes,
        projecaoTrimestre,
      },
      empresas: {
        total: todasEmpresas.length,
        ativas: empresasAtivas.length,
        inativas: empresasInativas.length,
        novasEsteMes: empresasNovasEsteMes.length,
        crescimentoMensal,
        churnRate,
      },
      colaboradores: {
        total: todosColaboradores.length,
        ativos: colaboradoresAtivos.length,
        mediaPorEmpresa,
        crescimentoMensal: crescimentoColabPercentual,
      },
      conversao: {
        visitantesLanding,
        testesDemonstracao,
        checkoutsIniciados,
        comprasFinalizadas,
        taxaLandingParaDemo,
        taxaDemoParaCheckout,
        taxaCheckoutParaCompra,
        taxaConversaoGeral,
      },
      planos: {
        distribuicao: [
          { plano: 'Essencial', quantidade: distribuicaoPlanos.Essencial, receita: distribuicaoPlanos.Essencial * 15 },
          { plano: 'Profissional', quantidade: distribuicaoPlanos.Profissional, receita: distribuicaoPlanos.Profissional * 25 },
          { plano: 'Enterprise', quantidade: distribuicaoPlanos.Enterprise, receita: distribuicaoPlanos.Enterprise * 35 },
        ],
        essencial: distribuicaoPlanos.Essencial,
        profissional: distribuicaoPlanos.Profissional,
        enterprise: distribuicaoPlanos.Enterprise,
      },
      tendencias: {
        receitaMensal,
        crescimentoEmpresa: [], // Pode ser expandido depois
      },
      kpis: {
        ltv,
        cac,
        ltvCacRatio,
        paybackPeriod,
      },
    };

    logger.info('✅ [ADMIN DASHBOARD] Métricas calculadas com sucesso');
    logger.info('📈 [ADMIN DASHBOARD] Métricas principais', {
      financeiro: { mrr, arr, receitaMensalTotal: receitaTotal, ticketMedio, crescimentoMRR },
      empresas: { total: todasEmpresas.length, ativas: empresasAtivas.length, inativas: empresasInativas.length, novasEsteMes: empresasNovasEsteMes.length },
      conversao: { visitantesLanding, testesDemonstracao, checkoutsIniciados, comprasFinalizadas },
    });
    res.json(dashboard);
  } catch (error) {
    logger.warn('❌ [ADMIN DASHBOARD] Erro ao calcular métricas', { error: (error as any)?.message });
    res.status(500).json({ error: 'Erro ao carregar dashboard executivo' });
  }
});

// Maintenance: Fix Slugs in Production
router.post('/maintenance/fix-slugs', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    logger.info('🔧 [ADMIN MAINTENANCE] Starting slug normalization...');
    const result = { migrated: 0, deleted: 0, details: [] as string[] };

    // Mappings of accented -> normalized
    const MAPPINGS = {
      "comunicação-não-violenta": "comunicacao-nao-violenta",
      "diversidade-inclusão-respeito": "diversidade-inclusao-respeito",
      "gestão-estresse-qualidade-vida": "gestao-estresse-qualidade-vida",
      "gestão-riscos-psicossociais-saúde-mental": "gestao-riscos-psicossociais-saude-mental",
      "inteligência-emocional-liderança": "inteligencia-emocional-lideranca",
      "liderança-humanizada-clima-organizacional": "lideranca-humanizada-clima-organizacional",
      "prevenção-assedio-moral-sexual": "prevencao-assedio-moral-sexual"
    };

    // Need to import cursoDisponibilidade schema here if not imported, or use string refs if raw SQL
    // Using import from schema
    const { cursoDisponibilidade } = await import('../../shared/schema');
    const { eq, and } = await import('drizzle-orm');

    for (const [accented, normalized] of Object.entries(MAPPINGS)) {
      const records = await db.select().from(cursoDisponibilidade).where(eq(cursoDisponibilidade.cursoId, accented));

      if (records.length > 0) {
        for (const record of records) {
          // Check duplicate
          const [existing] = await db.select()
            .from(cursoDisponibilidade)
            .where(and(
              eq(cursoDisponibilidade.cursoId, normalized),
              eq(cursoDisponibilidade.colaboradorId, record.colaboradorId)
            ))
            .limit(1);

          if (existing) {
            await db.delete(cursoDisponibilidade).where(eq(cursoDisponibilidade.id, record.id));
            result.deleted++;
            result.details.push(`Deleted duplicate for ${record.colaboradorId} (${accented})`);
          } else {
            await db.update(cursoDisponibilidade)
              .set({ cursoId: normalized })
              .where(eq(cursoDisponibilidade.id, record.id));
            result.migrated++;
            result.details.push(`Migrated ${record.colaboradorId} (${accented} -> ${normalized})`);
          }
        }
      }
    }

    logger.info('✅ [ADMIN MAINTENANCE] Slug normalization complete', result);
    res.json(result);
  } catch (error) {
    logger.error('❌ [ADMIN MAINTENANCE] Error normalizing slugs', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
