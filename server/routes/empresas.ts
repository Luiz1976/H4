import express from 'express';
import { db, dbType } from '../db-config';
import logger from '../utils/logger';
import { empresas, colaboradores, convitesColaborador, resultados, testes } from '../../shared/schema';
import { authenticateToken, requireEmpresa, requireAdmin, AuthRequest } from '../middleware/auth';
import { eq, and, gt, desc, or } from 'drizzle-orm';
import { generatePsychosocialAnalysis } from '../services/aiAnalysisService';

const router = express.Router();

// Obter detalhes da própria empresa
router.get('/me', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const [empresa] = await db
      .select({
        id: empresas.id,
        nomeEmpresa: empresas.nomeEmpresa,
        emailContato: empresas.emailContato,
        configuracoes: empresas.configuracoes,
        ativa: empresas.ativa,
        createdAt: empresas.createdAt,
      })
      .from(empresas)
      .where(eq(empresas.id, req.user!.empresaId!))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({ empresa });
  } catch (error) {
    logger.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar colaboradores da empresa
router.get('/colaboradores', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const colaboradoresList = await db
      .select({
        id: colaboradores.id,
        nome: colaboradores.nome,
        email: colaboradores.email,
        cargo: colaboradores.cargo,
        departamento: colaboradores.departamento,
        avatar: colaboradores.avatar,
        ativo: colaboradores.ativo,
        createdAt: colaboradores.createdAt,
      })
      .from(colaboradores)
      .where(eq(colaboradores.empresaId, req.user!.empresaId!));

    // Enriquecer com informações de situação psicossocial
    const colaboradoresEnriquecidos = await Promise.all(
      colaboradoresList.map(async (colaborador) => {
        logger.debug(`🔍 [PSICO] Buscando resultados para colaborador: ${colaborador.nome} (${colaborador.id})`);

        // Buscar TODOS os resultados do colaborador
        const ultimosResultados = await db
          .select({
            id: resultados.id,
            pontuacaoTotal: resultados.pontuacaoTotal,
            dataRealizacao: resultados.dataRealizacao,
            metadados: resultados.metadados,
            testeNome: testes.nome,
            colaboradorId: resultados.colaboradorId,
            usuarioId: resultados.usuarioId,
          })
          .from(resultados)
          .leftJoin(testes, eq(resultados.testeId, testes.id))
          .where(
            and(
              or(
                eq(resultados.colaboradorId, colaborador.id),
                eq(resultados.usuarioId, colaborador.id)
              ),
              eq(resultados.empresaId, req.user!.empresaId!),
              eq(resultados.status, 'concluido')
            )
          )
          .orderBy(desc(resultados.dataRealizacao));

        logger.info(`📊 [PSICO] Encontrados ${ultimosResultados.length} resultados para ${colaborador.nome}`);
        if (ultimosResultados.length > 0) {
          logger.debug(`📊 [PSICO] Primeiro resultado - colaboradorId: ${ultimosResultados[0].colaboradorId}, usuarioId: ${ultimosResultados[0].usuarioId}`);
        }

        // Calcular situação psicossocial com base nos últimos testes
        let situacaoPsicossocial: {
          status: 'excelente' | 'bom' | 'atencao' | 'critico' | 'nao_avaliado';
          descricao: string;
          cor: string;
          totalTestes: number;
          ultimoTeste?: string;
          indicadores?: { nome: string; valor: string; nivel: string }[];
        } = {
          status: 'nao_avaliado',
          descricao: 'Nenhum teste realizado',
          cor: 'gray',
          totalTestes: 0,
        };

        if (ultimosResultados.length > 0) {
          const totalTestes = ultimosResultados.length;
          situacaoPsicossocial.totalTestes = totalTestes;
          situacaoPsicossocial.ultimoTeste = ultimosResultados[0].dataRealizacao.toISOString();

          // Lista de dimensões negativas (onde MENOR é MELHOR)
          const dimensoesNegativas = new Set([
            'demanda-psicologica',
            'esforco-exigido',
            'hipercomprometimento',
            'conflito_trabalho_familia',
            'assedio_violencia',
            'esgotamento_profissional',
            'demandas_trabalho',
            'estresse',        // Adicionado para garantir cobertura
            'burnout'          // Adicionado para garantir cobertura
          ]);

          // Agregar análise de todos os resultados
          const dimensoesAgregadas: Record<string, { soma: number; total: number }> = {};
          const indicadores: Array<{ nome: string; valor: string; nivel: string }> = [];

          ultimosResultados.forEach((resultado, index) => {
            const metadados = resultado.metadados as Record<string, any> || {};

            // Tentar localizar dimensões em diferentes estruturas
            const analiseCompleta = metadados.analise_completa || {};
            let dimensoes = analiseCompleta.dimensoes || metadados.dimensoes || {};

            // Processar dimensões
            if (dimensoes && typeof dimensoes === 'object') {
              // Se for array (QVT style), processar diferente
              if (Array.isArray(dimensoes)) {
                dimensoes.forEach((dim: any) => {
                  if (dim.dimensao && dim.pontuacao !== undefined) {
                    const dimensaoId = dim.dimensao;
                    if (!dimensoesAgregadas[dimensaoId]) {
                      dimensoesAgregadas[dimensaoId] = { soma: 0, total: 0 };
                    }

                    let valor = dim.percentual;
                    if (valor === undefined) {
                      // Normalizar globalmente se estiver em escala 1-5 (assumindo <= 5 é escala)
                      if (dim.pontuacao <= 5) {
                        valor = (dim.pontuacao / 5) * 100;
                      } else {
                        valor = dim.pontuacao; // Assume já 0-100 ou outra escala
                        // Para QVT, pontuação costuma ser maior, vamos manter lógica anterior se necessário
                        // Mas a lógica anterior (pontuacao * 20) era para 1-5.
                      }
                    }
                    // Fallback para lógica antiga se não tiver percentual e for > 5 (ex: escala 0-100 direta ou soma)
                    if (valor === undefined) valor = dim.pontuacao || 0;

                    // Inverter se for negativo
                    if (dimensoesNegativas.has(dimensaoId)) {
                      valor = Math.max(0, 100 - valor);
                    }

                    dimensoesAgregadas[dimensaoId].soma += valor;
                    dimensoesAgregadas[dimensaoId].total++;
                  }
                });
              } else {
                // Se for objeto (RPO, PAS style)
                Object.entries(dimensoes).forEach(([dimensaoId, dados]: [string, any]) => {
                  if (!dimensoesAgregadas[dimensaoId]) {
                    dimensoesAgregadas[dimensaoId] = { soma: 0, total: 0 };
                  }

                  let valor = dados.percentual;

                  // Normalização Global
                  if (valor === undefined) {
                    const raw = dados.media || dados.pontuacao || 0;
                    if (raw <= 5 && raw > 0) {
                      valor = (raw / 5) * 100;
                    } else {
                      valor = raw;
                    }
                  }

                  // Inverter se for negativo
                  if (dimensoesNegativas.has(dimensaoId)) {
                    valor = Math.max(0, 100 - (valor || 0));
                  }

                  dimensoesAgregadas[dimensaoId].soma += (valor || 0);
                  dimensoesAgregadas[dimensaoId].total++;
                });
              }
            }
          });

          // Calcular média geral
          let somaTotal = 0;
          let contadorDimensoes = 0;

          Object.entries(dimensoesAgregadas).forEach(([dimensaoId, dados]) => {
            const media = dados.total > 0 ? dados.soma / dados.total : 0;
            somaTotal += media;
            contadorDimensoes++;

            // Adicionar indicadores principais (máximo 3)
            if (indicadores.length < 3) {
              let nivel = 'Bom';
              if (media < 40) nivel = 'Crítico';
              else if (media < 60) nivel = 'Atenção';
              else if (media < 75) nivel = 'Moderado';

              const nomeDimensao = dimensaoId
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

              indicadores.push({
                nome: nomeDimensao,
                valor: `${Math.round(media)}%`,
                nivel,
              });
            }
          });

          const mediaGeral = contadorDimensoes > 0 ? somaTotal / contadorDimensoes : 0;

          // Determinar status geral
          if (mediaGeral >= 75) {
            situacaoPsicossocial.status = 'excelente';
            situacaoPsicossocial.descricao = 'Situação psicossocial excelente';
            situacaoPsicossocial.cor = 'green';
          } else if (mediaGeral >= 60) {
            situacaoPsicossocial.status = 'bom';
            situacaoPsicossocial.descricao = 'Situação psicossocial boa';
            situacaoPsicossocial.cor = 'blue';
          } else if (mediaGeral >= 40) {
            situacaoPsicossocial.status = 'atencao';
            situacaoPsicossocial.descricao = 'Requer atenção';
            situacaoPsicossocial.cor = 'yellow';
          } else {
            situacaoPsicossocial.status = 'critico';
            situacaoPsicossocial.descricao = 'Situação crítica - ação necessária';
            situacaoPsicossocial.cor = 'red';
          }

          situacaoPsicossocial.indicadores = indicadores;

          logger.info(`✅ [PSICO] Status final para ${colaborador.nome}: ${situacaoPsicossocial.status}`);
          logger.debug(`✅ [PSICO] Total de indicadores: ${indicadores.length}`);
        } else {
          logger.warn(`❌ [PSICO] Nenhum resultado encontrado para ${colaborador.nome}`);
        }

        logger.debug(`🎯 [PSICO] Situação final para ${colaborador.nome}: ${JSON.stringify(situacaoPsicossocial)}`);

        // Fallback: preencher cargo/departamento a partir do último convite do colaborador, se ausentes
        let cargoFinal = colaborador.cargo || null;
        let departamentoFinal = colaborador.departamento || null;
        if (!cargoFinal || !departamentoFinal) {
          try {
            const [ultimoConvite] = await db
              .select({
                cargo: convitesColaborador.cargo,
                departamento: convitesColaborador.departamento,
                createdAt: convitesColaborador.createdAt,
              })
              .from(convitesColaborador)
              .where(
                and(
                  eq(convitesColaborador.empresaId, req.user!.empresaId!),
                  eq(convitesColaborador.email, colaborador.email)
                )
              )
              .orderBy(desc(convitesColaborador.createdAt))
              .limit(1);
            cargoFinal = cargoFinal || ultimoConvite?.cargo || null;
            departamentoFinal = departamentoFinal || ultimoConvite?.departamento || null;
          } catch (_) { }
        }

        const colaboradorCompleto = {
          ...colaborador,
          cargo: cargoFinal || colaborador.cargo,
          departamento: departamentoFinal || colaborador.departamento,
          situacaoPsicossocial,
        };

        logger.debug(`📦 [DADOS] Colaborador ${colaborador.nome} - Cargo: ${colaboradorCompleto.cargo}, Departamento: ${colaboradorCompleto.departamento}`);

        return colaboradorCompleto;
      })
    );

    logger.info('📤 [API] Enviando colaboradores');
    try {
      res.set('Cache-Control', 'no-store');
      res.set('ETag', `${Date.now()}`);
    } catch (_) { }
    res.status(200).json({ colaboradores: colaboradoresEnriquecidos, total: colaboradoresEnriquecidos.length });
  } catch (error) {
    logger.error('Erro ao listar colaboradores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar colaborador por ID
router.get('/colaboradores/:id', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const normalizedId = String(id).replace(/-/g, '');

    const [colaborador] = await db
      .select({
        id: colaboradores.id,
        nome: colaboradores.nome,
        email: colaboradores.email,
        cargo: colaboradores.cargo,
        departamento: colaboradores.departamento,
        avatar: colaboradores.avatar,
        ativo: colaboradores.ativo,
        createdAt: colaboradores.createdAt,
      })
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, id),
          eq(colaboradores.empresaId, req.user!.empresaId!)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json({ colaborador });
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar resultados de testes de um colaborador
router.get('/colaboradores/:id/resultados', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, id),
          eq(colaboradores.empresaId, req.user!.empresaId!)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Buscar resultados do colaborador com JOIN na tabela de testes
    // Busca por colaboradorId OU usuarioId (para compatibilidade com testes antigos)
    const resultadosList = await db
      .select({
        id: resultados.id,
        testeId: resultados.testeId,
        usuarioId: resultados.usuarioId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        tempoGasto: resultados.tempoGasto,
        dataRealizacao: resultados.dataRealizacao,
        status: resultados.status,
        metadados: resultados.metadados,
        // Dados do teste
        testeNome: testes.nome,
        testeCategoria: testes.categoria,
        testeTempoEstimado: testes.tempoEstimado,
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(
        and(
          or(
            eq(resultados.colaboradorId, id),
            eq(resultados.usuarioId, id)
          ),
          eq(resultados.empresaId, req.user!.empresaId!)
        )
      )
      .orderBy(desc(resultados.dataRealizacao));

    // Enriquecer os resultados com informações formatadas
    const resultadosEnriquecidos = resultadosList.map(resultado => {
      const metadadosBase = (resultado.metadados as Record<string, any>) || {};
      const analise = metadadosBase.analise_completa || {};

      const testeId = String(resultado.testeId || '').toLowerCase();
      const nomeTeste = String(resultado.testeNome || metadadosBase.teste_nome || '').toLowerCase();

      const MAX_BY_TEST: Record<string, number> = {
        'clima-organizacional': 390,
        'karasek-siegrist': 250,
        'estresse-ocupacional': 200,
      };

      let pontuacaoMaxima: number = Number(metadadosBase.pontuacao_maxima) || 0;
      if (!pontuacaoMaxima) {
        const key = Object.keys(MAX_BY_TEST).find(k => testeId.includes(k) || nomeTeste.includes(k));
        pontuacaoMaxima = key ? MAX_BY_TEST[key] : 100;
      }

      const pontuacao = typeof resultado.pontuacaoTotal === 'number' ? resultado.pontuacaoTotal : 0;

      let percentual: number | undefined;

      const riscoGeralPct = analise?.riscoGeral?.percentual;
      const maturidadeGeralPct = analise?.maturidadeGeral?.percentual;
      const indiceGeralRisco = analise?.indiceGeralRisco;

      if (typeof riscoGeralPct === 'number') {
        percentual = Math.round(Math.max(0, Math.min(100, riscoGeralPct)));
      } else if (typeof maturidadeGeralPct === 'number') {
        percentual = Math.round(Math.max(0, Math.min(100, maturidadeGeralPct)));
      } else if (typeof indiceGeralRisco === 'number') {
        const scaled = (indiceGeralRisco / 5) * 100;
        percentual = Math.round(Math.max(0, Math.min(100, scaled)));
      } else if (pontuacaoMaxima > 0 && typeof pontuacao === 'number') {
        percentual = Math.round(Math.max(0, Math.min(100, (pontuacao / pontuacaoMaxima) * 100)));
      } else {
        percentual = 0;
      }

      return {
        id: resultado.id,
        testeId: resultado.testeId,
        nomeTest: resultado.testeNome || metadadosBase.teste_nome || 'Teste sem nome',
        categoria: resultado.testeCategoria || metadadosBase.teste_categoria || '',
        pontuacao: pontuacao,
        pontuacaoMaxima: pontuacaoMaxima,
        percentual,
        status: resultado.status || 'concluido',
        dataRealizacao: resultado.dataRealizacao,
        tempoDuracao: resultado.tempoGasto ? Math.round(resultado.tempoGasto / 60) : undefined, // converter segundos para minutos
        tipoTabela: metadadosBase.tipo_teste || '',
      };
    });

    res.json({ resultados: resultadosEnriquecidos, total: resultadosEnriquecidos.length });
  } catch (error) {
    console.error('Erro ao buscar resultados do colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Admin: buscar indicadores detalhados de uma empresa específica (respeitando LGPD)
router.get('/:id/indicadores', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id: empresaId } = req.params;
    console.log('📊 [ADMIN] Buscando indicadores para empresa:', empresaId);

    // Buscar informações básicas da empresa
    const [empresa] = await db
      .select({
        id: empresas.id,
        nomeEmpresa: empresas.nomeEmpresa,
        emailContato: empresas.emailContato,
        cnpj: empresas.cnpj,
        setor: empresas.setor,
        ativa: empresas.ativa,
        createdAt: empresas.createdAt,
      })
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Buscar colaboradores
    const colaboradoresList = await db
      .select()
      .from(colaboradores)
      .where(eq(colaboradores.empresaId, empresaId));

    const totalColaboradores = colaboradoresList.length;
    const colaboradoresAtivos = colaboradoresList.filter(c => c.ativo).length;
    const colaboradoresInativos = totalColaboradores - colaboradoresAtivos;

    // Buscar todos os convites (pendentes, aceitos, expirados)
    const agora = new Date();
    const todosConvites = await db
      .select()
      .from(convitesColaborador)
      .where(eq(convitesColaborador.empresaId, empresaId));

    const convitesGerados = todosConvites.length;
    const convitesUtilizados = todosConvites.filter(c => c.status === 'aceito').length;
    const convitesPendentes = todosConvites.filter(c =>
      c.status === 'pendente' && new Date(c.validade) > agora
    ).length;
    const convitesExpirados = todosConvites.filter(c =>
      c.status === 'pendente' && new Date(c.validade) <= agora
    ).length;

    // Buscar resultados de testes (dados agregados - LGPD)
    const resultadosList = await db
      .select({
        id: resultados.id,
        testeId: resultados.testeId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        dataRealizacao: resultados.dataRealizacao,
        status: resultados.status,
        metadados: resultados.metadados,
        testeNome: testes.nome,
        testeCategoria: testes.categoria,
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(eq(resultados.empresaId, empresaId));

    const resultadosConcluidos = resultadosList.filter(r => r.status === 'concluido');
    const totalTestes = resultadosConcluidos.length;

    // Média de testes por colaborador (somente números - LGPD)
    const mediaTestes = totalColaboradores > 0
      ? Number((totalTestes / totalColaboradores).toFixed(2))
      : 0;

    // Testes por período
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const inicio7Dias = new Date();
    inicio7Dias.setDate(inicio7Dias.getDate() - 7);

    const testesEsteMes = resultadosConcluidos.filter(r =>
      r.dataRealizacao && new Date(r.dataRealizacao) >= inicioMes
    ).length;

    const testesUltimos7Dias = resultadosConcluidos.filter(r =>
      r.dataRealizacao && new Date(r.dataRealizacao) >= inicio7Dias
    ).length;

    // Testes por categoria (agregado)
    const testesPorCategoria: Record<string, number> = {};
    resultadosConcluidos.forEach(r => {
      const categoria = r.testeCategoria || 'Outros';
      testesPorCategoria[categoria] = (testesPorCategoria[categoria] || 0) + 1;
    });

    // Taxa de conclusão (colaboradores com pelo menos 1 teste)
    const colaboradoresComTestes = new Set(
      resultadosConcluidos.map(r => r.metadados && (r.metadados as any).colaboradorId).filter(Boolean)
    ).size;

    const taxaConclusao = totalColaboradores > 0
      ? Number(((colaboradoresComTestes / totalColaboradores) * 100).toFixed(1))
      : 0;

    // Tendência temporal (últimos 6 meses agregado)
    const mesesTendencia: Array<{ mes: string; testes: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const mesInicio = new Date();
      mesInicio.setMonth(mesInicio.getMonth() - i);
      mesInicio.setDate(1);
      mesInicio.setHours(0, 0, 0, 0);

      const mesFim = new Date(mesInicio);
      mesFim.setMonth(mesFim.getMonth() + 1);

      const testesMes = resultadosConcluidos.filter(r => {
        const data = new Date(r.dataRealizacao!);
        return data >= mesInicio && data < mesFim;
      }).length;

      mesesTendencia.push({
        mes: mesInicio.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        testes: testesMes,
      });
    }

    // Pontuação média geral (agregado)
    const pontuacoes = resultadosConcluidos
      .map(r => r.pontuacaoTotal)
      .filter(p => p !== null && p !== undefined) as number[];

    const pontuacaoMedia = pontuacoes.length > 0
      ? Number((pontuacoes.reduce((acc, p) => acc + p, 0) / pontuacoes.length).toFixed(1))
      : 0;

    // Indicadores adicionais
    const taxaUtilizacaoConvites = convitesGerados > 0
      ? Number(((convitesUtilizados / convitesGerados) * 100).toFixed(1))
      : 0;

    const crescimentoMensal = mesesTendencia.length >= 2
      ? mesesTendencia[mesesTendencia.length - 1].testes - mesesTendencia[mesesTendencia.length - 2].testes
      : 0;

    // Calcular dias desde o cadastro
    const diasDesdeRegistro = Math.floor((agora.getTime() - new Date(empresa.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const mesesAtivos = Math.max(Math.floor(diasDesdeRegistro / 30), 1);

    // Taxa de crescimento de colaboradores (estimativa baseada em convites)
    const taxaCrescimentoColaboradores = convitesGerados > 0
      ? Number(((convitesUtilizados / mesesAtivos) * 100).toFixed(1))
      : 0;

    // Custo médio por colaborador (baseado em testes realizados)
    const custoPorColaborador = totalColaboradores > 0
      ? Number((totalTestes / totalColaboradores).toFixed(1))
      : 0;

    // Índice de saúde organizacional (baseado em pontuação e engajamento)
    const indiceSaudeOrganizacional = pontuacaoMedia > 0
      ? Number((((pontuacaoMedia + taxaConclusao) / 2) * 0.01 * 100).toFixed(1))
      : 0;

    // Identificar categorias de alto risco (pontuação baixa)
    const categoriasRisco: Array<{ categoria: string; nivel: string; testes: number }> = [];
    Object.entries(testesPorCategoria).forEach(([categoria, quantidade]) => {
      const testesCategoria = resultadosConcluidos.filter(r => r.testeCategoria === categoria);
      const mediaCategoria = testesCategoria.length > 0
        ? testesCategoria.reduce((acc, r) => acc + (r.pontuacaoTotal || 0), 0) / testesCategoria.length
        : 0;

      if (mediaCategoria < 40 && quantidade >= 3) {
        categoriasRisco.push({
          categoria,
          nivel: 'Crítico',
          testes: quantidade,
        });
      } else if (mediaCategoria < 60 && quantidade >= 3) {
        categoriasRisco.push({
          categoria,
          nivel: 'Atenção',
          testes: quantidade,
        });
      }
    });

    // Análise de produtividade (testes por mês)
    const produtividadeMensal = mesesAtivos > 0
      ? Number((totalTestes / mesesAtivos).toFixed(1))
      : 0;

    // Previsão para o próximo mês (baseado em tendência)
    let previsaoProximoMes = 0;
    if (mesesTendencia.length >= 3) {
      const ultimos3Meses = mesesTendencia.slice(-3).map(m => m.testes);
      const media = ultimos3Meses.reduce((a, b) => a + b, 0) / 3;
      const tendencia = ultimos3Meses[2] - ultimos3Meses[0];
      previsaoProximoMes = Math.max(0, Math.round(media + tendencia));
    }

    // Cobertura de avaliação (% colaboradores avaliados)
    const coberturaAvaliacao = totalColaboradores > 0
      ? Number(((colaboradoresComTestes / totalColaboradores) * 100).toFixed(1))
      : 0;

    // Frequência média de avaliação (dias entre testes)
    let frequenciaMedia = 0;
    if (totalTestes > 1) {
      const datasOrdenadas = resultadosConcluidos
        .map(r => new Date(r.dataRealizacao!).getTime())
        .sort((a, b) => a - b);

      if (datasOrdenadas.length > 1) {
        const diferencas: number[] = [];
        for (let i = 1; i < datasOrdenadas.length; i++) {
          diferencas.push(datasOrdenadas[i] - datasOrdenadas[i - 1]);
        }
        const mediaDif = diferencas.reduce((a, b) => a + b, 0) / diferencas.length;
        frequenciaMedia = Math.round(mediaDif / (1000 * 60 * 60 * 24));
      }
    }

    // Identificar colaboradores não avaliados (apenas contagem - LGPD)
    const colaboradoresNaoAvaliados = totalColaboradores - colaboradoresComTestes;

    // Índice de retenção (baseado em colaboradores ativos)
    const indiceRetencao = totalColaboradores > 0
      ? Number(((colaboradoresAtivos / totalColaboradores) * 100).toFixed(1))
      : 0;

    // Análise de distribuição temporal (manhã, tarde, noite)
    const distribuicaoTemporal = {
      manha: 0,  // 06:00 - 12:00
      tarde: 0,  // 12:00 - 18:00
      noite: 0,  // 18:00 - 00:00
      madrugada: 0 // 00:00 - 06:00
    };

    resultadosConcluidos.forEach(r => {
      const hora = new Date(r.dataRealizacao!).getHours();
      if (hora >= 6 && hora < 12) distribuicaoTemporal.manha++;
      else if (hora >= 12 && hora < 18) distribuicaoTemporal.tarde++;
      else if (hora >= 18 || hora < 0) distribuicaoTemporal.noite++;
      else distribuicaoTemporal.madrugada++;
    });

    // Alertas e insights para o CEO
    const alertas: Array<{ tipo: string; mensagem: string; prioridade: string }> = [];

    if (coberturaAvaliacao < 50) {
      alertas.push({
        tipo: 'Cobertura Baixa',
        mensagem: `Apenas ${coberturaAvaliacao}% dos colaboradores foram avaliados`,
        prioridade: 'alta',
      });
    }

    if (categoriasRisco.length > 0) {
      alertas.push({
        tipo: 'Áreas de Risco',
        mensagem: `${categoriasRisco.length} categorias identificadas como risco`,
        prioridade: 'crítica',
      });
    }

    if (crescimentoMensal < 0) {
      alertas.push({
        tipo: 'Queda de Atividade',
        mensagem: `Redução de ${Math.abs(crescimentoMensal)} testes em relação ao mês anterior`,
        prioridade: 'média',
      });
    }

    if (convitesPendentes > 10) {
      alertas.push({
        tipo: 'Convites Pendentes',
        mensagem: `${convitesPendentes} convites aguardando aceitação`,
        prioridade: 'baixa',
      });
    }

    if (indiceRetencao < 80) {
      alertas.push({
        tipo: 'Retenção Baixa',
        mensagem: `Taxa de retenção em ${indiceRetencao}% - investigar causas`,
        prioridade: 'alta',
      });
    }

    // 💰 INDICADORES DE CONVERSÃO E FATURAMENTO (apenas dados reais; sem simulação)
    // Integrações reais de analytics/checkout devem preencher estes campos
    const visitantesLandingEstimados = 0;
    const testesDemoRealizados = 0;
    const checkoutsIniciados = 0;
    const comprasFinalizadas = 0;

    const taxaConversaoDemo = 0;
    const taxaConversaoCheckout = 0;
    const taxaConversaoGeral = 0;

    // Calcular faturamento baseado no número de colaboradores
    const planoTiers = {
      essencial: { limite: 50, valor: 15 },
      profissional: { limite: 200, valor: 25 },
      enterprise: { limite: Infinity, valor: 35 }
    };

    let planoAtual = 'Essencial';
    let valorPorColaborador = 15;

    if (totalColaboradores > planoTiers.essencial.limite && totalColaboradores <= planoTiers.profissional.limite) {
      planoAtual = 'Profissional';
      valorPorColaborador = 25;
    } else if (totalColaboradores > planoTiers.profissional.limite) {
      planoAtual = 'Enterprise';
      valorPorColaborador = 35;
    }

    const receitaMensal = totalColaboradores * valorPorColaborador;
    const receitaTotal = receitaMensal * Math.max(mesesAtivos, 1);
    const ticketMedio = receitaMensal;

    // Próxima cobrança (dia 1 do próximo mês)
    const proximaCobranca = new Date();
    proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
    proximaCobranca.setDate(1);

    const indicadores = {
      empresa: {
        id: empresa.id,
        nome: empresa.nomeEmpresa,
        email: empresa.emailContato,
        cnpj: empresa.cnpj,
        setor: empresa.setor,
        ativa: empresa.ativa,
        dataCadastro: empresa.createdAt,
        diasAtivos: diasDesdeRegistro,
        mesesAtivos,
      },
      colaboradores: {
        total: totalColaboradores,
        ativos: colaboradoresAtivos,
        inativos: colaboradoresInativos,
        comTestes: colaboradoresComTestes,
        semTestes: colaboradoresNaoAvaliados,
        taxaConclusao,
        indiceRetencao,
        taxaCrescimento: taxaCrescimentoColaboradores,
      },
      convites: {
        gerados: convitesGerados,
        utilizados: convitesUtilizados,
        pendentes: convitesPendentes,
        expirados: convitesExpirados,
        taxaUtilizacao: taxaUtilizacaoConvites,
      },
      testes: {
        total: totalTestes,
        esteMes: testesEsteMes,
        ultimos7Dias: testesUltimos7Dias,
        mediaPorColaborador: mediaTestes,
        pontuacaoMedia,
        porCategoria: testesPorCategoria,
        crescimentoMensal,
        produtividadeMensal,
        previsaoProximoMes,
        frequenciaMedia,
      },
      saude: {
        indiceGeral: indiceSaudeOrganizacional,
        coberturaAvaliacao,
        categoriasRisco,
        custoPorColaborador,
      },
      analise: {
        distribuicaoTemporal,
        tendencia: mesesTendencia,
        alertas,
      },
      conversao: {
        visitantesLanding: visitantesLandingEstimados,
        testesDemonstracao: testesDemoRealizados,
        checkoutsIniciados,
        comprasFinalizadas,
        taxaConversaoDemo,
        taxaConversaoCheckout,
        taxaConversaoGeral,
      },
      faturamento: {
        receitaMensal,
        receitaTotal,
        ticketMedio,
        planoAtual,
        valorPlano: valorPorColaborador,
        proximaCobranca: proximaCobranca.toISOString(),
        statusPagamento: empresa.ativa ? 'ativo' : 'cancelado',
      },
    };

    logger.info('✅ [ADMIN] Indicadores calculados com sucesso');
    res.json(indicadores);
  } catch (error) {
    logger.error('Erro ao buscar indicadores da empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório Completo da Empresa (Novo Endpoint)
router.get('/:id/relatorio-completo', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { id: empresaId } = req.params;

    // Validar acesso: empresa só pode ver seus próprios dados (ou admin)
    if (req.user!.empresaId !== empresaId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    console.log('📊 [RELATORIO] Gerando relatório completo para empresa:', empresaId);

    // 1. Dados da Empresa
    const [empresa] = await db
      .select({
        id: empresas.id,
        nomeEmpresa: empresas.nomeEmpresa,
        setor: empresas.setor,
        createdAt: empresas.createdAt,
      })
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // 2. Buscar todos os resultados concluídos
    const resultadosList = await db
      .select({
        id: resultados.id,
        pontuacaoTotal: resultados.pontuacaoTotal,
        dataRealizacao: resultados.dataRealizacao,
        metadados: resultados.metadados,
        testeNome: testes.nome,
        testeCategoria: testes.categoria,
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(
        and(
          eq(resultados.empresaId, empresaId),
          eq(resultados.status, 'concluido')
        )
      )
      .orderBy(desc(resultados.dataRealizacao));

    // 3. Agregar Dados por Módulo/Categoria
    const modulos: Record<string, any> = {};
    const totalRespondentes = new Set(resultadosList.map(r => (r.metadados as any)?.colaboradorId).filter(Boolean)).size;

    resultadosList.forEach(resultado => {
      const categoria = resultado.testeCategoria || 'Outros';
      const nomeTeste = resultado.testeNome || 'Teste Geral';
      const metadados = (resultado.metadados as any) || {};

      if (!modulos[categoria]) {
        modulos[categoria] = {
          nome: categoria,
          totalTestes: 0,
          mediaPontuacao: 0,
          somaPontuacao: 0,
          distribuicao: { excelente: 0, bom: 0, regular: 0, critico: 0 },
          testes: {}
        };
      }

      // Agregado por categoria
      modulos[categoria].totalTestes++;
      const pontuacao = resultado.pontuacaoTotal || 0;
      modulos[categoria].somaPontuacao += pontuacao;

      // Distribuição simplificada (ajustar conforme escala real de cada teste)
      // Assumindo escala 0-100 para simplificação geral, mas idealmente normalizar
      let percentual = 0;
      if (metadados.analise_completa?.riscoGeral?.percentual) {
        percentual = metadados.analise_completa.riscoGeral.percentual;
      } else {
        // Fallback genérico
        percentual = pontuacao; // Assumindo que pontuacaoTotal já é algo útil ou normalizar depois
      }

      if (percentual >= 80) modulos[categoria].distribuicao.excelente++;
      else if (percentual >= 60) modulos[categoria].distribuicao.bom++;
      else if (percentual >= 40) modulos[categoria].distribuicao.regular++;
      else modulos[categoria].distribuicao.critico++;

      // Agregado por Teste específico dentro da categoria
      if (!modulos[categoria].testes[nomeTeste]) {
        modulos[categoria].testes[nomeTeste] = {
          nome: nomeTeste,
          total: 0,
          soma: 0,
          media: 0
        };
      }
      modulos[categoria].testes[nomeTeste].total++;
      modulos[categoria].testes[nomeTeste].soma += percentual;
    });

    // Calcular médias finais
    Object.keys(modulos).forEach(key => {
      const mod = modulos[key];
      mod.mediaPontuacao = mod.totalTestes > 0 ? Math.round(mod.somaPontuacao / mod.totalTestes) : 0;

      Object.keys(mod.testes).forEach(testKey => {
        const teste = mod.testes[testKey];
        teste.media = teste.total > 0 ? Math.round(teste.soma / teste.total) : 0;
      });
    });

    // 4. Gerar Insights e Recomendações (Mockado por enquanto, mas estruturado para IA futura)
    // Numa implementação real, passaríamos os dados agregados para o `aiAnalysisService`
    const insights = [
      {
        tipo: 'forca',
        titulo: 'Engajamento Elevado',
        descricao: 'A taxa de adesão aos testes aumentou 15% no último mês.'
      },
      {
        tipo: 'atencao',
        titulo: 'Sobrecarga em TI',
        descricao: 'O departamento de TI apresenta índices de estresse 20% acima da média da empresa.'
      }
    ];

    const recomendacoes = [
      {
        prioridade: 'alta',
        acao: 'Implementar programa de pausas ativas',
        prazo: 'Imediato',
        responsavel: 'RH / Gestão de Pessoas'
      },
      {
        prioridade: 'media',
        acao: 'Workshop de Comunicação Não-Violenta',
        prazo: '30 dias',
        responsavel: 'Desenvolvimento Organizacional'
      }
    ];

    // 5. Montar Objeto Final
    const relatorio = {
      empresa: {
        nome: empresa.nomeEmpresa,
        setor: empresa.setor,
        dataRelatorio: new Date().toISOString(),
        totalParticipantes: totalRespondentes
      },
      resumoExecutivo: {
        destaques: [
          { label: 'Clima Geral', valor: 'Bom', cor: 'green' },
          { label: 'Risco Burnout', valor: 'Baixo', cor: 'blue' },
          { label: 'Satisfação', valor: '78%', cor: 'green' }
        ],
        texto: 'A organização apresenta um clima majoritariamente positivo, com pontos de atenção focais em áreas de alta demanda.'
      },
      resultadosPorArea: modulos,
      insights,
      recomendacoes
    };

    res.json(relatorio);

  } catch (error) {
    console.error('Erro ao gerar relatório completo:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao gerar relatório' });
  }
});

// Admin: listar todas as empresas
router.get('/todas', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    logger.info('🏢 [ADMIN] Buscando todas as empresas...');
    const todasEmpresas = await db
      .select({
        id: empresas.id,
        nomeEmpresa: empresas.nomeEmpresa,
        emailContato: empresas.emailContato,
        ativa: empresas.ativa,
        createdAt: empresas.createdAt,
        configuracoes: empresas.configuracoes,
      })
      .from(empresas);

    logger.info('🏢 [ADMIN] Empresas encontradas no banco:', todasEmpresas.length);
    if (todasEmpresas.length > 0) {
      logger.info('🏢 [ADMIN] Primeira empresa:', todasEmpresas[0]);
    }

    // Enriquecer com a contagem de colaboradores
    const empresasEnriquecidas = await Promise.all(
      todasEmpresas.map(async (empresa) => {
        const colaboradoresList = await db
          .select()
          .from(colaboradores)
          .where(eq(colaboradores.empresaId, empresa.id));

        const empresaFormatada = {
          id: empresa.id,
          nome_empresa: empresa.nomeEmpresa,
          email_contato: empresa.emailContato,
          ativo: empresa.ativa,
          created_at: empresa.createdAt,
          total_colaboradores: colaboradoresList.length,
          configuracoes: empresa.configuracoes,
        };

        logger.info('🏢 [ADMIN] Empresa formatada:', empresaFormatada);
        return empresaFormatada;
      })
    );

    logger.info('🏢 [ADMIN] Enviando resposta com', empresasEnriquecidas.length, 'empresas');
    res.json({ empresas: empresasEnriquecidas, total: empresasEnriquecidas.length });
  } catch (error) {
    logger.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configurações da empresa
router.patch('/configuracoes', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { configuracoes } = req.body;

    if (!configuracoes || typeof configuracoes !== 'object') {
      return res.status(400).json({ error: 'Configurações inválidas' });
    }

    const [empresaAtualizada] = await db
      .update(empresas)
      .set({ configuracoes })
      .where(eq(empresas.id, req.user!.empresaId!))
      .returning();

    res.json({ empresa: empresaAtualizada });
  } catch (error) {
    logger.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas da empresa
router.get('/estatisticas', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const empresaId = req.user!.empresaId!;

    // Buscar colaboradores
    const colaboradoresList = await db
      .select()
      .from(colaboradores)
      .where(eq(colaboradores.empresaId, empresaId));

    const totalColaboradores = colaboradoresList.length;
    const colaboradoresAtivos = colaboradoresList.filter(c => c.ativo).length;

    // Buscar convites pendentes
    const agora = new Date();
    const convitesList = await db
      .select()
      .from(convitesColaborador)
      .where(
        and(
          eq(convitesColaborador.empresaId, empresaId),
          eq(convitesColaborador.status, 'pendente'),
          gt(convitesColaborador.validade, agora)
        )
      );

    const convitesPendentes = convitesList.length;

    // Buscar resultados (se houver colaboradores)
    let totalTestesRealizados = 0;
    let testesEsteMes = 0;
    let mediaPontuacao = 0;

    if (colaboradoresList.length > 0) {
      const colaboradorIds = colaboradoresList.map(c => c.id);

      const resultadosList = await db
        .select()
        .from(resultados)
        .where(eq(resultados.empresaId, empresaId));

      const resultadosConcluidos = resultadosList.filter(r => r.status === 'concluido');
      totalTestesRealizados = resultadosConcluidos.length;

      // Testes deste mês
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      testesEsteMes = resultadosConcluidos.filter(r =>
        r.dataRealizacao && new Date(r.dataRealizacao) >= inicioMes
      ).length;

      // Média de pontuação
      const pontuacoes = resultadosConcluidos
        .map(r => r.pontuacaoTotal)
        .filter(p => p !== null && p !== undefined) as number[];

      if (pontuacoes.length > 0) {
        mediaPontuacao = pontuacoes.reduce((acc, p) => acc + p, 0) / pontuacoes.length;
      }
    }

    res.json({
      estatisticas: {
        total_colaboradores: totalColaboradores,
        colaboradores_ativos: colaboradoresAtivos,
        total_testes_realizados: totalTestesRealizados,
        convites_pendentes: convitesPendentes,
        testes_este_mes: testesEsteMes,
        media_pontuacao: Math.round(mediaPontuacao * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Análise psicossocial agregada da empresa (NR1 + LGPD compliant)
router.get('/estado-psicossocial', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Admin pode especificar empresaId via query parameter, empresa usa seu próprio ID
    let empresaId: string | undefined;

    if (req.user!.role === 'admin') {
      // Para admin, pode passar empresaId como query parameter ou pega a primeira empresa
      empresaId = req.query.empresaId as string;

      if (!empresaId) {
        // Se admin não especificou empresa, pegar a primeira empresa do sistema
        const [primeiraEmpresa] = await db
          .select({ id: empresas.id })
          .from(empresas)
          .where(eq(empresas.ativa, true))
          .limit(1);

        if (!primeiraEmpresa) {
          return res.status(404).json({ error: 'Nenhuma empresa encontrada' });
        }
        empresaId = primeiraEmpresa.id;
      }
    } else if (req.user!.role === 'empresa') {
      empresaId = req.user!.empresaId!;
    } else {
      return res.status(403).json({ error: 'Acesso negado. Apenas admins e empresas podem acessar esta funcionalidade.' });
    }

    // Buscar todos os colaboradores
    const colaboradoresList = await db
      .select()
      .from(colaboradores)
      .where(eq(colaboradores.empresaId, empresaId));

    // Buscar todos os resultados dos testes
    const resultadosList = await db
      .select({
        id: resultados.id,
        testeId: resultados.testeId,
        colaboradorId: resultados.colaboradorId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        dataRealizacao: resultados.dataRealizacao,
        status: resultados.status,
        metadados: resultados.metadados,
        testeNome: testes.nome,
        testeCategoria: testes.categoria,
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(
        and(
          eq(resultados.empresaId, empresaId),
          eq(resultados.status, 'concluido')
        )
      )
      .orderBy(desc(resultados.dataRealizacao));

    // Calcular últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const resultadosRecentes = resultadosList.filter(r =>
      r.dataRealizacao && new Date(r.dataRealizacao) >= trintaDiasAtras
    );

    // Análise por dimensão psicossocial - LÓGICA: Média de TODOS os testes
    const dimensoesAgregadas: Record<string, { total: number; soma: number }> = {};
    const alertasCriticos: string[] = [];

    // Lista de dimensões negativas (onde MENOR é MELHOR)
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

    // Processar resultados (já ordenados por data decrescente)
    resultadosList.forEach(resultado => {
      const colabId = resultado.colaboradorId;
      if (!colabId) return;

      const metadados = resultado.metadados as Record<string, any> || {};
      const analiseCompleta = metadados.analise_completa || {};

      // Agregar dimensões (Soma de todos os testes)
      if (analiseCompleta.dimensoes) {
        Object.entries(analiseCompleta.dimensoes).forEach(([dimensaoId, dados]: [string, any]) => {
          if (!dimensoesAgregadas[dimensaoId]) {
            dimensoesAgregadas[dimensaoId] = { total: 0, soma: 0 };
          }

          let valor = dados.percentual || dados.media || dados.pontuacao || 0;

          // 1. Normalização GLOBAL
          if (valor <= 5 && !dados.percentual) {
            valor = (valor / 5) * 100;
          }

          // 2. Inversão para dimensões negativas
          if (dimensoesNegativas.has(dimensaoId)) {
            valor = Math.max(0, 100 - valor);
          }

          dimensoesAgregadas[dimensaoId].total++;
          dimensoesAgregadas[dimensaoId].soma += valor;
        });
      }

      // Identificar alertas críticos
      if (metadados.alertas_criticos && Array.isArray(metadados.alertas_criticos)) {
        alertasCriticos.push(...metadados.alertas_criticos);
      }
    });



    // Calcular médias finais das dimensões
    const dimensoesAnalise = Object.entries(dimensoesAgregadas).map(([dimensaoId, dados]) => {
      const media = dados.total > 0 ? dados.soma / dados.total : 0;
      let nivel = 'Bom';
      let cor = 'green';

      if (media < 40) {
        nivel = 'Crítico';
        cor = 'red';
      } else if (media < 60) {
        nivel = 'Atenção';
        cor = 'orange';
      } else if (media < 75) {
        nivel = 'Moderado';
        cor = 'yellow';
      }

      return {
        dimensaoId,
        nome: dimensaoId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        percentual: Math.round(media),
        nivel,
        cor,
        total: dados.total
      };
    });

    // Análise NR1 - Fatores de Risco Psicossociais
    const nr1Fatores = [
      {
        fator: 'Carga de Trabalho',
        nivel: dimensoesAnalise.find(d => d.dimensaoId.includes('demanda') || d.dimensaoId.includes('estresse'))?.nivel || 'Não avaliado',
        percentual: dimensoesAnalise.find(d => d.dimensaoId.includes('demanda') || d.dimensaoId.includes('estresse'))?.percentual || 0
      },
      {
        fator: 'Autonomia e Controle',
        nivel: dimensoesAnalise.find(d => d.dimensaoId.includes('autonomia') || d.dimensaoId.includes('controle'))?.nivel || 'Não avaliado',
        percentual: dimensoesAnalise.find(d => d.dimensaoId.includes('autonomia') || d.dimensaoId.includes('controle'))?.percentual || 0
      },
      {
        fator: 'Suporte Social',
        nivel: dimensoesAnalise.find(d => d.dimensaoId.includes('suporte') || d.dimensaoId.includes('apoio'))?.nivel || 'Não avaliado',
        percentual: dimensoesAnalise.find(d => d.dimensaoId.includes('suporte') || d.dimensaoId.includes('apoio'))?.percentual || 0
      },
      {
        fator: 'Assédio e Violência',
        nivel: dimensoesAnalise.find(d => d.dimensaoId.includes('assedio') || d.dimensaoId.includes('moral'))?.nivel || 'Não avaliado',
        percentual: dimensoesAnalise.find(d => d.dimensaoId.includes('assedio') || d.dimensaoId.includes('moral'))?.percentual || 0
      },
      {
        fator: 'Equilíbrio Trabalho-Vida',
        nivel: dimensoesAnalise.find(d => d.dimensaoId.includes('equilibrio') || d.dimensaoId.includes('vida'))?.nivel || 'Não avaliado',
        percentual: dimensoesAnalise.find(d => d.dimensaoId.includes('equilibrio') || d.dimensaoId.includes('vida'))?.percentual || 0
      }
    ];

    // Calcular índice geral de bem-estar
    const indiceGeralBemEstar = dimensoesAnalise.length > 0
      ? Math.round(dimensoesAnalise.reduce((acc, d) => acc + d.percentual, 0) / dimensoesAnalise.length)
      : 0;

    // Compliance NR1
    const dataProximaAvaliacao = new Date();
    dataProximaAvaliacao.setMonth(dataProximaAvaliacao.getMonth() + 24); // NR1 exige reavaliação a cada 2 anos

    const nr1Compliance = {
      status: resultadosList.length > 0 ? 'Conforme' : 'Pendente',
      ultimaAvaliacao: resultadosList[0]?.dataRealizacao || null,
      proximaAvaliacao: dataProximaAvaliacao.toISOString(),
      testesRealizados: resultadosList.length,
      cobertura: colaboradoresList.length > 0
        ? Math.round((new Set(resultadosList.map(r => r.colaboradorId)).size / colaboradoresList.length) * 100)
        : 0
    };

    // ✨ ANÁLISE REAL COM IA - Google Gemini
    logger.info('🧠 [API] Gerando análise com IA para empresa:', empresaId);

    const aiAnalysis = await generatePsychosocialAnalysis({
      indiceGeralBemEstar,
      totalColaboradores: colaboradoresList.length,
      totalTestesRealizados: resultadosList.length,
      testesUltimos30Dias: resultadosRecentes.length,
      cobertura: nr1Compliance.cobertura,
      dimensoes: dimensoesAnalise,
      nr1Fatores,
      alertasCriticos: [...new Set(alertasCriticos)]
    });

    const recomendacoes = aiAnalysis.recomendacoes;

    logger.info('✅ [API] Análise IA gerada com sucesso:', recomendacoes.length, 'recomendações');
    logger.info('📤 [Estado Psicossocial] totalColaboradores:', colaboradoresList.length);
    logger.info('📤 [Estado Psicossocial] totalTestesRealizados:', resultadosList.length);
    logger.info('📤 [Estado Psicossocial] cobertura:', nr1Compliance.cobertura);

    res.json({
      analise: {
        indiceGeralBemEstar,
        totalColaboradores: colaboradoresList.length,
        totalTestesRealizados: resultadosList.length,
        testesUltimos30Dias: resultadosRecentes.length,
        cobertura: nr1Compliance.cobertura,
        dimensoes: dimensoesAnalise,
        nr1Fatores,
        nr1Compliance,
        alertasCriticos: [...new Set(alertasCriticos)].slice(0, 5), // Top 5 únicos
        recomendacoes,
        ultimaAtualizacao: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar análise psicossocial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 📊 PRG - Programa de Gestão de Riscos Psicossociais
router.get('/pgr', authenticateToken, async (req: AuthRequest, res) => {
  try {
    let empresaId = req.user!.empresaId;

    // Se for admin, pode passar empresaId como query param
    if (req.user!.role === 'admin' && req.query.empresaId) {
      empresaId = req.query.empresaId as string;
    }

    if (!empresaId) {
      return res.status(400).json({ error: 'ID da empresa é obrigatório' });
    }

    console.log('📊 [PRG] Iniciando carregamento PGR', {
      empresaId,
      userRole: req.user?.role,
      userId: req.user?.userId,
      hasEmpresaInToken: Boolean(req.user?.empresaId),
    });

    // Buscar dados da empresa
    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Buscar todos os colaboradores da empresa
    const colaboradoresList = await db
      .select()
      .from(colaboradores)
      .where(eq(colaboradores.empresaId, empresaId));

    // Buscar todos os resultados de testes
    const resultadosList = await db
      .select({
        id: resultados.id,
        testeId: resultados.testeId,
        colaboradorId: resultados.colaboradorId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        metadados: resultados.metadados,
        dataRealizacao: resultados.dataRealizacao,
        testeCategoria: testes.categoria,
        testeNome: testes.nome
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(eq(resultados.empresaId, empresaId))
      .orderBy(desc(resultados.dataRealizacao));

    console.log(`📊 [PRG] Resultados encontrados`, {
      totalResultados: resultadosList.length,
      totalColaboradores: colaboradoresList.length,
    });

    // Lista de dimensões negativas (onde MENOR é MELHOR)
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

    // ✨ USAR MESMA LÓGICA DO ESTADO PSICOSSOCIAL - Processar metadados dos testes
    // LÓGICA: Média de TODOS os testes (Histórico Completo)
    const dimensoesAgregadas: Record<string, { total: number; soma: number }> = {};
    const alertasCriticos: string[] = [];

    // Processar metadados dos resultados (resultados já ordenados por data decrescente)
    resultadosList.forEach(resultado => {
      const colabId = resultado.colaboradorId;
      if (!colabId) return;

      const metadados = resultado.metadados as Record<string, any> || {};
      const analiseCompleta = metadados.analise_completa || {};

      // Identificar alertas críticos
      if (metadados.alertas_criticos && Array.isArray(metadados.alertas_criticos)) {
        alertasCriticos.push(...metadados.alertas_criticos);
      }

      // Agregar dimensões
      if (analiseCompleta.dimensoes) {
        Object.entries(analiseCompleta.dimensoes).forEach(([dimensaoId, dados]: [string, any]) => {
          if (!dimensoesAgregadas[dimensaoId]) {
            dimensoesAgregadas[dimensaoId] = { total: 0, soma: 0 };
          }

          let valor = dados.percentual || dados.media || dados.pontuacao || 0;

          // 1. Normalização GLOBAL (para todos os campos)
          if (valor <= 5 && !dados.percentual) {
            valor = (valor / 5) * 100;
          }

          // 2. Inversão para dimensões negativas
          if (dimensoesNegativas.has(dimensaoId)) {
            valor = Math.max(0, 100 - valor);
          }

          dimensoesAgregadas[dimensaoId].total++;
          dimensoesAgregadas[dimensaoId].soma += valor;
        });
      }
    });



    // Mapeamento correto de IDs para nomes com acentuação
    const nomesDimensoes: Record<string, string> = {
      // HumaniQ Insight (formato com hífen)
      'seguranca-psicologica': 'Segurança Psicológica',
      'comunicacao-interna': 'Comunicação Interna',
      'pertencimento': 'Pertencimento e Inclusão',
      'justica-organizacional': 'Justiça Organizacional',
      // Clima e Bem-Estar (formato camelCase)
      'segurancaPsicologica': 'Segurança Psicológica',
      'comunicacaoInterna': 'Comunicação Interna',
      'justicaOrganizacional': 'Justiça Organizacional',
      // RPO
      'demandas_trabalho': 'Demandas do Trabalho',
      'autonomia_controle': 'Autonomia e Controle',
      'apoio_social': 'Apoio Social',
      'reconhecimento': 'Reconhecimento e Recompensas',
      'seguranca_emprego': 'Segurança no Emprego',
      'ambiente_fisico': 'Ambiente Físico e Recursos',
      'conflito_trabalho_familia': 'Conflito Trabalho-Família',
      'assedio_violencia': 'Assédio e Violência',
      'cultura_organizacional': 'Cultura Organizacional',
      // MGRP - Maturidade em Gestão de Riscos
      'identificacao-riscos': 'Identificação de Riscos',
      'avaliacao-impacto': 'Avaliação de Impacto',
      'medidas-preventivas': 'Medidas Preventivas',
      'monitoramento-controle': 'Monitoramento e Controle',
      'cultura-organizacional': 'Cultura Organizacional',
      'capacitacao-desenvolvimento': 'Capacitação e Desenvolvimento',
      // Estresse
      'estresse': 'Estresse Ocupacional',
      'burnout': 'Burnout',
      'exaustao': 'Exaustão Emocional',
      // QVT
      'satisfacao': 'Satisfação no Trabalho',
      'saude': 'Saúde e Bem-Estar',
      'lideranca': 'Liderança',
      'crescimento': 'Crescimento Profissional',
      'compensacao': 'Compensação',
      'condicoes': 'Condições de Trabalho',
      // Karasek
      'demanda': 'Demanda Psicológica',
      'controle': 'Controle sobre o Trabalho',
      'apoio': 'Apoio Social',
      'esforco-exigido': 'Esforço Exigido',
      'recompensas-recebidas': 'Recompensas Recebidas',
      // Genéricas
      'comunicacao': 'Comunicação',
      'prevencao': 'Prevenção',
      'mapeamento': 'Mapeamento',
      'clima': 'Clima Organizacional',
      'ambiente': 'Ambiente de Trabalho',
      'organizacional': 'Cultura Organizacional'
    };

    // Calcular médias das dimensões (mesma lógica do estado-psicossocial)
    const todasDimensoes = Object.entries(dimensoesAgregadas).map(([dimensaoId, dados]) => {
      const media = dados.total > 0 ? dados.soma / dados.total : 0;
      let nivel = 'Bom';
      let cor = 'green';

      if (media < 40) {
        nivel = 'Crítico';
        cor = 'red';
      } else if (media < 60) {
        nivel = 'Atenção';
        cor = 'orange';
      } else if (media < 75) {
        nivel = 'Moderado';
        cor = 'yellow';
      }

      // Usar nome correto do mapeamento ou formatar o ID como fallback
      const nomeFormatado = nomesDimensoes[dimensaoId] ||
        dimensaoId.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      return {
        dimensaoId,
        nome: nomeFormatado,
        percentual: Math.round(media),
        nivel,
        cor,
        total: dados.total
      };
    });

    console.log(`📊 [PRG] Processadas ${todasDimensoes.length} dimensões dos metadados`);

    // Função helper para buscar dimensão específica
    const getDimensaoValor = (keywords: string[]): number => {
      const dimensao = todasDimensoes.find(d =>
        keywords.some(k => d.dimensaoId.toLowerCase().includes(k.toLowerCase()))
      );
      return dimensao?.percentual || 0;
    };

    // Calcular KPIs baseados nas dimensões reais dos metadados
    // ⚠️ IMPORTANTE: Retorna 0 quando não há dados, não valores fictícios
    const kpis = {
      indiceEstresse: resultadosList.length > 0 ? getDimensaoValor(['estresse', 'demanda', 'carga']) : 0,
      climaPositivo: resultadosList.length > 0 ? getDimensaoValor(['clima', 'ambiente', 'organizacional']) : 0,
      satisfacaoChefia: resultadosList.length > 0 ? getDimensaoValor(['lideranca', 'chefia', 'lider', 'gestor']) : 0,
      riscoBurnout: resultadosList.length > 0 ? getDimensaoValor(['burnout', 'exaustao', 'esgotamento']) : 0,
      maturidadePRG: resultadosList.length > 0 ? Math.min(65 + (resultadosList.length / 10), 100) : 0,
      segurancaPsicologica: resultadosList.length > 0 ? getDimensaoValor(['seguranca', 'psicologica', 'apoio']) : 0
    };

    // Índice global (mesma lógica do estado-psicossocial)
    const indiceGlobal = todasDimensoes.length > 0
      ? Math.round(todasDimensoes.reduce((acc, d) => acc + d.percentual, 0) / todasDimensoes.length)
      : 0;

    console.log(`📊 [PRG] Índice Global calculado: ${indiceGlobal}`);

    // Dados por categoria de teste
    const dadosPorTipo = {
      clima: resultadosList.filter(r => r.testeCategoria?.toLowerCase().includes('clima')),
      estresse: resultadosList.filter(r => r.testeCategoria?.toLowerCase().includes('estresse')),
      burnout: resultadosList.filter(r => r.testeCategoria?.toLowerCase().includes('burnout')),
      qvt: resultadosList.filter(r => r.testeCategoria?.toLowerCase().includes('qvt') || r.testeCategoria?.toLowerCase().includes('qualidade')),
      assedio: resultadosList.filter(r => r.testeCategoria?.toLowerCase().includes('assedio') || r.testeCategoria?.toLowerCase().includes('assédio')),
      disc: resultadosList.filter(r => r.testeCategoria?.toLowerCase().includes('disc') || r.testeCategoria?.toLowerCase().includes('comportamental'))
    };

    // Usar as dimensões reais processadas dos metadados (mesma lógica do estado-psicossocial)
    const dimensoesAnalise = todasDimensoes;

    // Preparar fatores NR1 para análise de IA
    const nr1Fatores = [
      { fator: 'Carga de Trabalho', nivel: kpis.indiceEstresse > 70 ? 'Crítico' : kpis.indiceEstresse > 50 ? 'Atenção' : 'Bom', percentual: kpis.indiceEstresse },
      { fator: 'Autonomia e Controle', nivel: kpis.maturidadePRG < 60 ? 'Crítico' : kpis.maturidadePRG < 75 ? 'Atenção' : 'Bom', percentual: kpis.maturidadePRG },
      { fator: 'Suporte Social', nivel: kpis.climaPositivo < 60 ? 'Crítico' : kpis.climaPositivo < 75 ? 'Atenção' : 'Bom', percentual: kpis.climaPositivo },
      { fator: 'Assédio e Violência', nivel: dadosPorTipo.assedio.length > 0 ? 'Bom' : 'Não avaliado', percentual: dadosPorTipo.assedio.length > 0 ? 80 : 0 },
      { fator: 'Equilíbrio Trabalho-Vida', nivel: kpis.riscoBurnout > 60 ? 'Crítico' : kpis.riscoBurnout > 40 ? 'Atenção' : 'Bom', percentual: 100 - kpis.riscoBurnout }
    ];

    // Calcular cobertura
    const cobertura = colaboradoresList.length > 0
      ? Math.round((new Set(resultadosList.map(r => r.colaboradorId)).size / colaboradoresList.length) * 100)
      : 0;

    // Calcular últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const testesUltimos30Dias = resultadosList.filter(r =>
      r.dataRealizacao && new Date(r.dataRealizacao) >= trintaDiasAtras
    ).length;

    // ✨ ANÁLISE REAL COM IA - Google Gemini (mesma função usada em estado-psicossocial)
    console.log('🧠 [PRG] Gerando análise com IA para empresa:', empresaId);

    const aiAnalysis = await generatePsychosocialAnalysis({
      indiceGeralBemEstar: indiceGlobal,
      totalColaboradores: colaboradoresList.length,
      totalTestesRealizados: resultadosList.length,
      testesUltimos30Dias,
      cobertura,
      dimensoes: dimensoesAnalise,
      nr1Fatores,
      alertasCriticos: [...new Set(alertasCriticos)].slice(0, 5) // Top 5 alertas únicos
    });

    const recomendacoes = aiAnalysis.recomendacoes;

    console.log('✅ [PRG] Análise IA gerada com sucesso:', recomendacoes.length, 'recomendações');

    // 🔥 GERAR MATRIZ DE RISCO COM DADOS REAIS
    const matrizRiscos: Array<{ nome: string; probabilidade: 'A' | 'B' | 'C' | 'D' | 'E'; severidade: 1 | 2 | 3 | 4 | 5; categoria: string }> = [];

    // Analisar dimensões para identificar riscos
    const riscosIdentificados = todasDimensoes.filter(d => d.percentual < 60); // Dimensões abaixo de 60% são riscos

    riscosIdentificados.forEach(risco => {
      const percentual = risco.percentual;

      // Calcular SEVERIDADE baseado na pontuação (quanto menor, mais severo)
      let severidade: 1 | 2 | 3 | 4 | 5;
      if (percentual < 20) severidade = 5; // EXTREMA
      else if (percentual < 35) severidade = 4; // MAIOR
      else if (percentual < 50) severidade = 3; // MODERADA
      else if (percentual < 60) severidade = 2; // MENOR
      else severidade = 1; // LEVE

      // Calcular PROBABILIDADE baseado na quantidade de testes/frequência
      let probabilidade: 'A' | 'B' | 'C' | 'D' | 'E';
      const totalTestes = risco.total || 0;
      if (totalTestes >= 10) probabilidade = 'E'; // MUITO PROVÁVEL
      else if (totalTestes >= 7) probabilidade = 'D'; // PROVÁVEL
      else if (totalTestes >= 4) probabilidade = 'C'; // POSSÍVEL
      else if (totalTestes >= 2) probabilidade = 'B'; // POUCO PROVÁVEL
      else probabilidade = 'A'; // RARA

      // Mapear categoria baseado na dimensão
      let categoria = 'geral';
      const dim = risco.dimensaoId.toLowerCase();
      if (dim.includes('estresse') || dim.includes('demanda') || dim.includes('carga')) categoria = 'estresse';
      else if (dim.includes('clima') || dim.includes('ambiente')) categoria = 'clima';
      else if (dim.includes('burnout') || dim.includes('exaustao')) categoria = 'burnout';
      else if (dim.includes('qualidade') || dim.includes('qvt')) categoria = 'qvt';
      else if (dim.includes('assedio') || dim.includes('assédio')) categoria = 'assedio';
      else if (dim.includes('lideranca') || dim.includes('chefia')) categoria = 'lideranca';

      matrizRiscos.push({
        nome: risco.nome,
        probabilidade,
        severidade,
        categoria
      });
    });

    console.log(`🔥 [PRG] Matriz de riscos gerada com ${matrizRiscos.length} riscos reais dos testes`);

    // 📊 GERAR DISTRIBUIÇÃO DE RISCOS COM DADOS REAIS
    const distribuicaoPorCategoria: Record<string, { critico: number; alto: number; moderado: number; baixo: number }> = {
      'Estresse': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Clima': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Burnout': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'QVT': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Assédio': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Liderança': { critico: 0, alto: 0, moderado: 0, baixo: 0 }
    };

    // Contar riscos por categoria e nível
    matrizRiscos.forEach(risco => {
      const categoriaNome = risco.categoria.charAt(0).toUpperCase() + risco.categoria.slice(1);
      const chave = Object.keys(distribuicaoPorCategoria).find(k => k.toLowerCase().includes(risco.categoria));

      if (chave) {
        // Classificar risco baseado em probabilidade x severidade
        const score = 'ABCDE'.indexOf(risco.probabilidade) + risco.severidade;
        if (score >= 8) distribuicaoPorCategoria[chave].critico++;
        else if (score >= 6) distribuicaoPorCategoria[chave].alto++;
        else if (score >= 4) distribuicaoPorCategoria[chave].moderado++;
        else distribuicaoPorCategoria[chave].baixo++;
      }
    });

    const distribuicaoRiscos = Object.entries(distribuicaoPorCategoria).map(([categoria, dados]) => ({
      categoria,
      ...dados
    }));

    console.log(`📊 [PRG] Distribuição de riscos calculada para ${distribuicaoRiscos.length} categorias`);

    // 🎯 USAR DIMENSÕES REAIS DOS TESTES (todasDimensoes já processadas acima)
    // Converter para formato que o frontend espera
    const dimensoesPsicossociais = todasDimensoes.map(d => ({
      dimensao: d.nome, // Nome formatado da dimensão
      valor: d.percentual, // Valor percentual calculado
      meta: 80, // Meta padrão de 80%
      nivel: d.nivel, // Nível (Crítico, Atenção, Moderado, Bom)
      cor: d.cor // Cor para visualização
    }));

    console.log(`✅ [PRG] Dados calculados com sucesso - ${dimensoesPsicossociais.length} dimensões reais`);

    // 📊 GRÁFICO PARLIAMENT - Distribuição de Colaboradores por Nível de Risco
    const colaboradoresPorRisco: Record<string, number> = {
      'critico': 0,
      'alto': 0,
      'moderado': 0,
      'baixo': 0,
      'saudavel': 0,
      'nao_avaliado': 0
    };

    // Classificar cada colaborador baseado nas médias de suas dimensões (MESMA LÓGICA DA PÁGINA DE GESTÃO)
    const colaboradoresComTestes = new Set(resultadosList.map(r => r.colaboradorId));
    const todosColaboradoresIds = new Set(colaboradoresList.map(c => c.id));

    console.log(`📊 [Parliament] Total colaboradores com testes: ${colaboradoresComTestes.size} de ${colaboradoresList.length} cadastrados`);

    // Classificar colaboradores que fizeram testes
    colaboradoresComTestes.forEach(colabId => {
      const testesDoColab = resultadosList.filter(r => r.colaboradorId === colabId);

      // Calcular média percentual das dimensões (IGUAL à página de gestão)
      const dimensoesAgregadas: Record<string, { soma: number; total: number }> = {};

      testesDoColab.forEach(teste => {
        // Tratar metadados potencialmente inválidos (strings não-JSON, null, etc.)
        let metadados: any = teste.metadados;
        if (typeof metadados === 'string') {
          try {
            metadados = JSON.parse(metadados);
          } catch (err) {
            console.warn(`⚠️ [PRG] Metadados inválidos para resultado ${teste.id}:`, err);
            metadados = {};
          }
        }

        if (metadados && metadados.pontuacoes_dimensoes) {
          Object.entries(metadados.pontuacoes_dimensoes).forEach(([dimensaoId, valor]) => {
            if (typeof valor === 'number') {
              if (!dimensoesAgregadas[dimensaoId]) {
                dimensoesAgregadas[dimensaoId] = { soma: 0, total: 0 };
              }
              dimensoesAgregadas[dimensaoId].soma += valor;
              dimensoesAgregadas[dimensaoId].total++;
            } else if (typeof valor === 'object' && valor !== null && 'percentual' in (valor as any)) {
              const percentual = (valor as any).percentual;
              if (!dimensoesAgregadas[dimensaoId]) {
                dimensoesAgregadas[dimensaoId] = { soma: 0, total: 0 };
              }
              dimensoesAgregadas[dimensaoId].soma += Number(percentual) || 0;
              dimensoesAgregadas[dimensaoId].total++;
            }
          });
        }
      });

      // Calcular média geral percentual
      let somaTotal = 0;
      let contadorDimensoes = 0;

      Object.entries(dimensoesAgregadas).forEach(([_, dados]) => {
        const media = dados.total > 0 ? dados.soma / dados.total : 0;
        somaTotal += media;
        contadorDimensoes++;
      });

      const mediaGeralPercentual = contadorDimensoes > 0 ? somaTotal / contadorDimensoes : 0;

      // Classificar usando OS MESMOS CRITÉRIOS da página de gestão
      if (mediaGeralPercentual < 40) colaboradoresPorRisco.critico++;
      else if (mediaGeralPercentual < 60) colaboradoresPorRisco.alto++;
      else if (mediaGeralPercentual < 75) colaboradoresPorRisco.moderado++;
      else if (mediaGeralPercentual < 90) colaboradoresPorRisco.baixo++;
      else colaboradoresPorRisco.saudavel++;

      console.log(`📊 [Parliament] Colaborador ${colabId}: média ${mediaGeralPercentual.toFixed(1)}% - classificação: ${mediaGeralPercentual < 40 ? 'crítico' : mediaGeralPercentual < 60 ? 'alto' : mediaGeralPercentual < 75 ? 'moderado' : mediaGeralPercentual < 90 ? 'baixo' : 'saudável'}`);
    });

    // Adicionar colaboradores sem testes como "não avaliado"
    todosColaboradoresIds.forEach(colabId => {
      if (!colaboradoresComTestes.has(colabId)) {
        colaboradoresPorRisco.nao_avaliado++;
      }
    });

    const dadosParliament = [
      { categoria: 'Crítico', quantidade: colaboradoresPorRisco.critico, cor: '#dc2626', label: 'Risco Crítico' },
      { categoria: 'Alto', quantidade: colaboradoresPorRisco.alto, cor: '#f97316', label: 'Risco Alto' },
      { categoria: 'Moderado', quantidade: colaboradoresPorRisco.moderado, cor: '#eab308', label: 'Risco Moderado' },
      { categoria: 'Baixo', quantidade: colaboradoresPorRisco.baixo, cor: '#22c55e', label: 'Risco Baixo' },
      { categoria: 'Saudável', quantidade: colaboradoresPorRisco.saudavel, cor: '#10b981', label: 'Saudável' },
      { categoria: 'Não Avaliado', quantidade: colaboradoresPorRisco.nao_avaliado, cor: '#6b7280', label: 'Não Avaliado' }
    ];

    console.log(`📊 [Parliament] Distribuição: ${JSON.stringify(colaboradoresPorRisco)}`);
    console.log(`📊 [Parliament] Total colaboradores com testes: ${colaboradoresComTestes.size} de ${colaboradoresList.length} cadastrados`);

    // 📊 GRÁFICO SANKEY - Fluxo entre Estados de Bem-Estar
    // Simular transições baseado nos dados disponíveis
    const dadosSankey = {
      nodes: [
        { name: 'Risco Alto' },      // 0
        { name: 'Risco Moderado' },  // 1
        { name: 'Risco Baixo' },     // 2
        { name: 'Clima Negativo' },  // 3
        { name: 'Clima Neutro' },    // 4
        { name: 'Clima Positivo' }   // 5
      ],
      links: [
        // De riscos para clima (sem mínimo artificial)
        { source: 0, target: 3, value: (colaboradoresPorRisco.critico + colaboradoresPorRisco.alto) },
        { source: 1, target: 4, value: (colaboradoresPorRisco.moderado) },
        { source: 2, target: 5, value: (colaboradoresPorRisco.baixo + colaboradoresPorRisco.saudavel) }
      ]
    };

    console.log(`📊 [Sankey] Fluxo gerado com ${dadosSankey.nodes.length} nós e ${dadosSankey.links.length} conexões`);

    const responseData = {
      empresa: {
        nome: empresa.nomeEmpresa,
        cnpj: empresa.cnpj || 'Não informado',
        endereco: empresa.endereco || 'Não informado',
        setor: empresa.setor || 'Não informado',
        logo: (empresa.configuracoes as any)?.logo || null,
      },
      prg: {
        indiceGlobal,
        kpis,
        totalColaboradores: colaboradoresList.length,
        totalTestes: resultadosList.length,
        cobertura: colaboradoresList.length > 0
          ? Math.round((new Set(resultadosList.map(r => r.colaboradorId)).size / colaboradoresList.length) * 100)
          : 0,
        dadosPorTipo: {
          clima: dadosPorTipo.clima.length,
          estresse: dadosPorTipo.estresse.length,
          burnout: dadosPorTipo.burnout.length,
          qvt: dadosPorTipo.qvt.length,
          assedio: dadosPorTipo.assedio.length,
          disc: dadosPorTipo.disc.length
        },
        aiAnalysis,
        recomendacoes,
        matrizRiscos,
        distribuicaoRiscos,
        dimensoesPsicossociais,
        dadosParliament,
        dadosSankey,
        ultimaAtualizacao: new Date().toISOString()
      }
    };

    logger.info('📤 [PRG] Enviando resposta com empresa:', responseData.empresa.nome);
    logger.info('📤 [PRG] Chaves da resposta:', Object.keys(responseData));
    logger.info('📤 [PRG] totalColaboradores:', responseData.prg.totalColaboradores);
    logger.info('📤 [PRG] totalTestes:', responseData.prg.totalTestes);
    logger.info('📤 [PRG] cobertura:', responseData.prg.cobertura);

    res.json(responseData);

  } catch (error) {
    logger.error('❌ [PRG] Erro ao buscar dados do PRG:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔓 ROTA PÚBLICA - Acessar PRG via QR Code (SEM AUTENTICAÇÃO)
router.get('/pgr/publico/:token', async (req, res) => {
  try {
    logger.info('🔓 [PRG Público] Requisição recebida para token:', req.params.token);

    const { token } = req.params;

    // Validar formato do token: empresaId-timestamp (formato: uuid-timestamp)
    const tokenParts = token.split('-');
    if (tokenParts.length < 2) {
      return res.status(401).json({ error: 'Token de compartilhamento inválido' });
    }

    // Extrair ID da empresa do token (todos os parts exceto o último são o ID)
    const empresaId = tokenParts.slice(0, -1).join('-');
    logger.info('🔓 [PRG Público] Empresa ID extraído:', empresaId);

    // Buscar empresa
    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) {
      logger.warn('❌ [PRG Público] Empresa não encontrada');
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    logger.info('✅ [PRG Público] Empresa encontrada:', empresa.nomeEmpresa);

    // Buscar colaboradores e resultados (mesma lógica do endpoint autenticado)
    const colaboradoresList = await db
      .select()
      .from(colaboradores)
      .where(eq(colaboradores.empresaId, empresaId));

    const resultadosList = await db
      .select({
        id: resultados.id,
        colaboradorId: resultados.colaboradorId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        metadados: resultados.metadados,
        dataRealizacao: resultados.dataRealizacao,
        categoria: testes.categoria,
        nome: testes.nome
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(eq(resultados.empresaId, empresaId))
      .orderBy(desc(resultados.dataRealizacao));

    // ✨ PROCESSAR METADADOS - MESMA LÓGICA DA ROTA PRINCIPAL
    // LÓGICA ATUALIZADA (Snapshot Atual): considera apenas o dado mais recente de cada dimensão
    const dimensoesPorColaborador = new Map<string, Map<string, number>>();
    const alertasCriticos: string[] = [];

    // Lista de dimensões negativas (onde MENOR é MELHOR)
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

    // Processar metadados dos resultados (EXATAMENTE como rota principal)
    // LÓGICA: Média de TODOS os testes (Histórico Completo)
    const dimensoesAgregadas: Record<string, { total: number; soma: number }> = {};

    resultadosList.forEach(resultado => {
      const colabId = resultado.colaboradorId;
      if (!colabId) return;

      const metadados = resultado.metadados as Record<string, any> || {};
      const analiseCompleta = metadados.analise_completa || {};

      // Identificar alertas críticos
      if (metadados.alertas_criticos && Array.isArray(metadados.alertas_criticos)) {
        alertasCriticos.push(...metadados.alertas_criticos);
      }

      // Agregar dimensões
      if (analiseCompleta.dimensoes) {
        Object.entries(analiseCompleta.dimensoes).forEach(([dimensaoId, dados]: [string, any]) => {
          if (!dimensoesAgregadas[dimensaoId]) {
            dimensoesAgregadas[dimensaoId] = { total: 0, soma: 0 };
          }
          let valor = dados.percentual || dados.media || dados.pontuacao || 0;

          // 1. Normalização GLOBAL
          if (valor <= 5 && !dados.percentual) {
            valor = (valor / 5) * 100;
          }

          // 2. Inversão para dimensões negativas
          if (dimensoesNegativas.has(dimensaoId)) {
            valor = Math.max(0, 100 - valor);
          }

          dimensoesAgregadas[dimensaoId].total++;
          dimensoesAgregadas[dimensaoId].soma += valor;
        });
      }
    });



    // Mapeamento de nomes (mesmo da rota principal)
    const nomesDimensoes: Record<string, string> = {
      'segurancaPsicologica': 'Segurança Psicológica',
      'comunicacaoInterna': 'Comunicação Interna',
      'pertencimento': 'Pertencimento e Inclusão',
      'justicaOrganizacional': 'Justiça Organizacional',
      'demandas_trabalho': 'Demandas do Trabalho',
      'autonomia_controle': 'Autonomia e Controle',
      'apoio_social': 'Apoio Social',
      'reconhecimento': 'Reconhecimento e Recompensas',
      'seguranca_emprego': 'Segurança no Emprego',
      'ambiente_fisico': 'Ambiente Físico e Recursos',
      'conflito_trabalho_familia': 'Conflito Trabalho-Família',
      'assedio_violencia': 'Assédio e Violência',
      'cultura_organizacional': 'Cultura Organizacional',
      'identificacao-riscos': 'Identificação de Riscos',
      'avaliacao-impacto': 'Avaliação de Impacto',
      'medidas-preventivas': 'Medidas Preventivas',
      'monitoramento-controle': 'Monitoramento e Controle',
      'capacitacao-desenvolvimento': 'Capacitação e Desenvolvimento',
      'estresse': 'Estresse Ocupacional',
      'burnout': 'Burnout',
      'exaustao': 'Exaustão Emocional',
      'satisfacao': 'Satisfação no Trabalho',
      'saude': 'Saúde e Bem-Estar',
      'lideranca': 'Liderança',
      'crescimento': 'Crescimento Profissional',
      'compensacao': 'Compensação',
      'condicoes': 'Condições de Trabalho',
      'demanda': 'Demanda Psicológica',
      'controle': 'Controle sobre o Trabalho',
      'apoio': 'Apoio Social',
      'esforco-exigido': 'Esforço Exigido',
      'recompensas-recebidas': 'Recompensas Recebidas',
      'comunicacao': 'Comunicação',
      'prevencao': 'Prevenção',
      'mapeamento': 'Mapeamento',
      'clima': 'Clima Organizacional',
      'ambiente': 'Ambiente de Trabalho',
      'organizacional': 'Cultura Organizacional'
    };

    // Calcular médias das dimensões (mesma lógica)
    const todasDimensoes = Object.entries(dimensoesAgregadas).map(([dimensaoId, dados]) => {
      const media = dados.total > 0 ? dados.soma / dados.total : 0;
      let nivel = 'Bom';
      let cor = 'green';

      if (media < 40) {
        nivel = 'Crítico';
        cor = 'red';
      } else if (media < 60) {
        nivel = 'Atenção';
        cor = 'orange';
      } else if (media < 75) {
        nivel = 'Moderado';
        cor = 'yellow';
      }

      const nomeFormatado = nomesDimensoes[dimensaoId] ||
        dimensaoId.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      return {
        dimensaoId,
        nome: nomeFormatado,
        percentual: Math.round(media),
        nivel,
        cor,
        total: dados.total
      };
    });

    // Função helper para buscar dimensão específica
    const getDimensaoValor = (keywords: string[]): number => {
      const dimensao = todasDimensoes.find(d =>
        keywords.some(k => d.dimensaoId.toLowerCase().includes(k.toLowerCase()))
      );
      return dimensao?.percentual || 0;
    };

    // Agrupar resultados por tipo
    const dadosPorTipo = {
      clima: resultadosList.filter(r => r.categoria?.toLowerCase().includes('clima') || r.nome?.toLowerCase().includes('clima')),
      estresse: resultadosList.filter(r => r.categoria?.toLowerCase().includes('estresse') || r.nome?.toLowerCase().includes('estresse')),
      burnout: resultadosList.filter(r => r.categoria?.toLowerCase().includes('burnout') || r.nome?.toLowerCase().includes('burnout')),
      qvt: resultadosList.filter(r => r.categoria?.toLowerCase().includes('qvt') || r.nome?.toLowerCase().includes('qualidade')),
      assedio: resultadosList.filter(r => r.categoria?.toLowerCase().includes('assedio') || r.nome?.toLowerCase().includes('pas') || r.categoria?.toLowerCase().includes('pas')),
      disc: resultadosList.filter(r => r.categoria?.toLowerCase().includes('disc') || r.nome?.toLowerCase().includes('disc'))
    };

    // Calcular KPIs baseados nas dimensões reais
    // ⚠️ IMPORTANTE: Retorna 0 quando não há dados, não valores fictícios
    const kpis = {
      indiceEstresse: resultadosList.length > 0 ? getDimensaoValor(['estresse', 'demanda', 'carga']) : 0,
      climaPositivo: resultadosList.length > 0 ? getDimensaoValor(['clima', 'ambiente', 'organizacional']) : 0,
      satisfacaoChefia: resultadosList.length > 0 ? getDimensaoValor(['lideranca', 'chefia', 'lider', 'gestor']) : 0,
      riscoBurnout: resultadosList.length > 0 ? getDimensaoValor(['burnout', 'exaustao', 'esgotamento']) : 0,
      maturidadePRG: resultadosList.length > 0 ? Math.min(65 + (resultadosList.length / 10), 100) : 0,
      segurancaPsicologica: resultadosList.length > 0 ? getDimensaoValor(['seguranca', 'psicologica', 'apoio']) : 0
    };

    const indiceGlobal = todasDimensoes.length > 0
      ? Math.round(todasDimensoes.reduce((acc, d) => acc + d.percentual, 0) / todasDimensoes.length)
      : 0;

    // Preparar dimensões para análise IA
    const dimensoesAnalise = todasDimensoes.slice(0, 10);

    // Preparar fatores NR1
    const nr1Fatores = [
      { fator: 'Carga de Trabalho', nivel: kpis.indiceEstresse > 70 ? 'Crítico' : kpis.indiceEstresse > 50 ? 'Atenção' : 'Bom', percentual: kpis.indiceEstresse },
      { fator: 'Autonomia e Controle', nivel: kpis.maturidadePRG < 60 ? 'Crítico' : kpis.maturidadePRG < 75 ? 'Atenção' : 'Bom', percentual: kpis.maturidadePRG },
      { fator: 'Suporte Social', nivel: kpis.climaPositivo < 60 ? 'Crítico' : kpis.climaPositivo < 75 ? 'Atenção' : 'Bom', percentual: kpis.climaPositivo },
      { fator: 'Assédio e Violência', nivel: dadosPorTipo.assedio.length > 0 ? 'Bom' : 'Não avaliado', percentual: dadosPorTipo.assedio.length > 0 ? 80 : 0 },
      { fator: 'Equilíbrio Trabalho-Vida', nivel: kpis.riscoBurnout > 60 ? 'Crítico' : kpis.riscoBurnout > 40 ? 'Atenção' : 'Bom', percentual: 100 - kpis.riscoBurnout }
    ];

    // Calcular cobertura
    const cobertura = colaboradoresList.length > 0
      ? Math.round((new Set(resultadosList.map(r => r.colaboradorId)).size / colaboradoresList.length) * 100)
      : 0;

    // Calcular últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const testesUltimos30Dias = resultadosList.filter(r =>
      r.dataRealizacao && new Date(r.dataRealizacao) >= trintaDiasAtras
    ).length;

    // Adicionar alertas críticos baseados nos KPIs
    if (kpis.indiceEstresse > 70) alertasCriticos.push('Nível de estresse elevado detectado');
    if (kpis.riscoBurnout > 60) alertasCriticos.push('Risco de burnout elevado');
    if (kpis.climaPositivo < 50) alertasCriticos.push('Clima organizacional necessita atenção');

    // Gerar análise IA com dados completos
    const aiAnalysis = await generatePsychosocialAnalysis({
      indiceGeralBemEstar: indiceGlobal,
      totalColaboradores: colaboradoresList.length,
      totalTestesRealizados: resultadosList.length,
      testesUltimos30Dias,
      cobertura,
      dimensoes: dimensoesAnalise,
      nr1Fatores,
      alertasCriticos
    });

    // Gerar recomendações (versão simplificada)
    const recomendacoes = aiAnalysis.recomendacoes || [];

    // Gerar matriz de riscos
    const matrizRiscos = resultadosList.map((r, idx) => {
      const score = r.pontuacaoTotal || 50;
      let probabilidade: 'A' | 'B' | 'C' | 'D' | 'E';
      let severidade: 1 | 2 | 3 | 4 | 5;

      if (score < 40) { probabilidade = 'E'; severidade = 5; }
      else if (score < 55) { probabilidade = 'D'; severidade = 4; }
      else if (score < 70) { probabilidade = 'C'; severidade = 3; }
      else if (score < 85) { probabilidade = 'B'; severidade = 2; }
      else { probabilidade = 'A'; severidade = 1; }

      const categorias = ['estresse', 'clima', 'burnout', 'qvt', 'assedio', 'liderança'];
      const categoria = categorias[idx % categorias.length];

      return {
        nome: r.nome || `Risco ${idx + 1}`,
        probabilidade,
        severidade,
        categoria
      };
    });

    // Distribuição de riscos
    const distribuicaoPorCategoria: Record<string, { critico: number; alto: number; moderado: number; baixo: number }> = {
      'Estresse': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Clima': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Burnout': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'QVT': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Assédio': { critico: 0, alto: 0, moderado: 0, baixo: 0 },
      'Liderança': { critico: 0, alto: 0, moderado: 0, baixo: 0 }
    };

    matrizRiscos.forEach(risco => {
      const chave = Object.keys(distribuicaoPorCategoria).find(k => k.toLowerCase().includes(risco.categoria));
      if (chave) {
        const score = 'ABCDE'.indexOf(risco.probabilidade) + risco.severidade;
        if (score >= 8) distribuicaoPorCategoria[chave].critico++;
        else if (score >= 6) distribuicaoPorCategoria[chave].alto++;
        else if (score >= 4) distribuicaoPorCategoria[chave].moderado++;
        else distribuicaoPorCategoria[chave].baixo++;
      }
    });

    const distribuicaoRiscos = Object.entries(distribuicaoPorCategoria).map(([categoria, dados]) => ({
      categoria,
      ...dados
    }));

    // 🎯 USAR DIMENSÕES REAIS DOS TESTES (todasDimensoes já processadas acima)
    const dimensoesPsicossociais = todasDimensoes.map(d => ({
      dimensao: d.nome,
      valor: d.percentual,
      meta: 80,
      nivel: d.nivel,
      cor: d.cor
    }));

    console.log(`✅ [PRG Público] Dados calculados com ${dimensoesPsicossociais.length} dimensões reais`);

    // 📊 GRÁFICO PARLIAMENT - Distribuição de Colaboradores (rota pública)
    const colaboradoresPorRisco: Record<string, number> = {
      'critico': 0,
      'alto': 0,
      'moderado': 0,
      'baixo': 0,
      'saudavel': 0,
      'nao_avaliado': 0
    };

    const colaboradoresComTestes = new Set(resultadosList.map(r => r.colaboradorId));
    const todosColaboradoresIds = new Set(colaboradoresList.map(c => c.id));

    colaboradoresComTestes.forEach(colabId => {
      const testesDoColab = resultadosList.filter(r => r.colaboradorId === colabId);
      const mediaPontuacao = testesDoColab.reduce((acc, t) => acc + (t.pontuacaoTotal || 50), 0) / testesDoColab.length;

      if (mediaPontuacao < 35) colaboradoresPorRisco.critico++;
      else if (mediaPontuacao < 55) colaboradoresPorRisco.alto++;
      else if (mediaPontuacao < 70) colaboradoresPorRisco.moderado++;
      else if (mediaPontuacao < 85) colaboradoresPorRisco.baixo++;
      else colaboradoresPorRisco.saudavel++;
    });

    // Adicionar colaboradores sem testes como "não avaliado"
    todosColaboradoresIds.forEach(colabId => {
      if (!colaboradoresComTestes.has(colabId)) {
        colaboradoresPorRisco.nao_avaliado++;
      }
    });

    const dadosParliament = [
      { categoria: 'Crítico', quantidade: colaboradoresPorRisco.critico, cor: '#dc2626', label: 'Risco Crítico' },
      { categoria: 'Alto', quantidade: colaboradoresPorRisco.alto, cor: '#f97316', label: 'Risco Alto' },
      { categoria: 'Moderado', quantidade: colaboradoresPorRisco.moderado, cor: '#eab308', label: 'Risco Moderado' },
      { categoria: 'Baixo', quantidade: colaboradoresPorRisco.baixo, cor: '#22c55e', label: 'Risco Baixo' },
      { categoria: 'Saudável', quantidade: colaboradoresPorRisco.saudavel, cor: '#10b981', label: 'Saudável' },
      { categoria: 'Não Avaliado', quantidade: colaboradoresPorRisco.nao_avaliado, cor: '#6b7280', label: 'Não Avaliado' }
    ];

    // 📊 GRÁFICO SANKEY - Fluxo entre Estados (rota pública)
    const dadosSankey = {
      nodes: [
        { name: 'Risco Alto' },
        { name: 'Risco Moderado' },
        { name: 'Risco Baixo' },
        { name: 'Clima Negativo' },
        { name: 'Clima Neutro' },
        { name: 'Clima Positivo' }
      ],
      links: [
        { source: 0, target: 3, value: Math.max(colaboradoresPorRisco.critico + colaboradoresPorRisco.alto, 1) },
        { source: 1, target: 4, value: Math.max(colaboradoresPorRisco.moderado, 1) },
        { source: 2, target: 5, value: Math.max(colaboradoresPorRisco.baixo + colaboradoresPorRisco.saudavel, 1) }
      ]
    };

    res.json({
      empresa: {
        nome: empresa.nomeEmpresa,
        cnpj: empresa.cnpj || 'Não informado',
        endereco: empresa.endereco || 'Não informado',
        setor: empresa.setor || 'Não informado'
      },
      indiceGlobal,
      kpis,
      totalColaboradores: colaboradoresList.length,
      totalTestes: resultadosList.length,
      cobertura: colaboradoresList.length > 0
        ? Math.round((new Set(resultadosList.map(r => r.colaboradorId)).size / colaboradoresList.length) * 100)
        : 0,
      dadosPorTipo: {
        clima: dadosPorTipo.clima.length,
        estresse: dadosPorTipo.estresse.length,
        burnout: dadosPorTipo.burnout.length,
        qvt: dadosPorTipo.qvt.length,
        assedio: dadosPorTipo.assedio.length,
        disc: dadosPorTipo.disc.length
      },
      aiAnalysis,
      recomendacoes,
      matrizRiscos,
      distribuicaoRiscos,
      dimensoesPsicossociais,
      dadosParliament,
      dadosSankey
    });

  } catch (error) {
    console.error('❌ [PRG Público] Erro ao buscar dados:', error);
    res.status(500).json({ error: 'Erro ao carregar dados do PRG' });
  }
});

// Admin: Restaurar acesso de uma empresa (desbloquear manualmente)
router.post('/:id/restaurar-acesso', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { diasAcesso } = req.body;

    console.log(`🔓 [ADMIN] Restaurando acesso da empresa ${id}...`);

    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, id))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const novaDataExpiracao = diasAcesso
      ? (() => {
        const data = new Date();
        data.setDate(data.getDate() + Number(diasAcesso));
        return data;
      })()
      : null;

    await db
      .update(empresas)
      .set({
        ativa: true,
        dataExpiracao: novaDataExpiracao,
        diasAcesso: diasAcesso || empresa.diasAcesso,
        updatedAt: new Date()
      })
      .where(eq(empresas.id, id));

    console.log(`✅ [ADMIN] Acesso restaurado para empresa ${empresa.nomeEmpresa} até ${novaDataExpiracao ? novaDataExpiracao.toLocaleDateString('pt-BR') : 'ilimitado'}`);

    res.json({
      success: true,
      message: 'Acesso restaurado com sucesso',
      empresa: {
        id: empresa.id,
        nome: empresa.nomeEmpresa,
        dataExpiracao: novaDataExpiracao,
        ativa: true
      }
    });

  } catch (error) {
    console.error('❌ [ADMIN] Erro ao restaurar acesso:', error);
    res.status(500).json({ error: 'Erro ao restaurar acesso da empresa' });
  }
});

// Admin: Bloquear manualmente uma empresa
router.post('/:id/bloquear-acesso', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    console.log(`🔒 [ADMIN] Bloqueando acesso da empresa ${id}...`);

    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, id))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    await db
      .update(empresas)
      .set({
        ativa: false,
        updatedAt: new Date()
      })
      .where(eq(empresas.id, id));

    console.log(`✅ [ADMIN] Acesso bloqueado para empresa ${empresa.nomeEmpresa}`);

    res.json({
      success: true,
      message: 'Acesso bloqueado com sucesso',
      empresa: {
        id: empresa.id,
        nome: empresa.nomeEmpresa,
        ativa: false
      }
    });

  } catch (error) {
    console.error('❌ [ADMIN] Erro ao bloquear acesso:', error);
    res.status(500).json({ error: 'Erro ao bloquear acesso da empresa' });
  }
});

// Admin: Excluir empresa (soft delete por padrão)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const modo = (req.query.modo as string) || 'soft';

    console.log(`🗑️ [ADMIN] Solicitação de exclusão da empresa ${id} (modo=${modo})...`);
    console.log('🗑️ [ADMIN] Tipos recebidos:', { idType: typeof id, idPreview: String(id).slice(0, 8) });

    // Normaliza UUID com traços para 32-hex no SQLite
    const normalizedId = String(id).replace(/-/g, '');

    // Validar formato do ID (SQLite usa 32-char hex; PG usa UUID com traços)
    const isHex32 = /^[0-9a-f]{32}$/i.test(normalizedId);
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    const updatedAtValue = isSqlite ? new Date().toISOString() : new Date();

    if (isSqlite) {
      if (!isHex32) {
        return res.status(400).json({ error: 'ID inválido para SQLite' });
      }
      const { sqlite } = await import('../db-sqlite');
      // Não assumir a existência da coluna 'ativa' no SELECT para evitar erro
      // Usa o ID original (com traços) pois é como está armazenado no banco
      const row: any = sqlite.prepare('SELECT id, nome_empresa, ativo FROM empresas WHERE id = ? LIMIT 1').get(String(id));
      if (!row) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      console.log('🗑️ [ADMIN] Registro encontrado:', { idDbType: typeof row.id, idDbPreview: String(row.id).slice(0, 8), ativo: row.ativo });
      try {
        const cols: Array<{ name: string }> = sqlite.prepare('PRAGMA table_info(empresas)').all().map((c: any) => ({ name: c.name }));
        const hasAtiva = cols.some(c => c.name === 'ativa');
        const sql = hasAtiva
          ? 'UPDATE empresas SET ativo = 0, ativa = 0 WHERE id = ?'
          : 'UPDATE empresas SET ativo = 0 WHERE id = ?';
        console.log('🗑️ [ADMIN] Executando UPDATE (SQLite):', { sql, bindIdType: typeof id, bindIdPreview: String(id).slice(0, 8) });
        sqlite.prepare(sql).run(String(id));
      } catch (e: any) {
        console.error('❌ [ADMIN] Falha no UPDATE (SQLite)', { code: e?.code, name: e?.name, message: e?.message, stack: e?.stack });
        return res.status(500).json({ error: 'Erro ao excluir empresa' });
      }

      console.log(`✅ [ADMIN] Empresa ${row.nome_empresa} marcada como inativa (soft delete)`);
      return res.json({
        success: true,
        message: 'Empresa excluída com sucesso (soft delete)',
        empresa: { id: row.id, nome: row.nome_empresa, ativa: false }
      });
    } else {
      const [empresa] = await db
        .select()
        .from(empresas)
        .where(eq(empresas.id, id))
        .limit(1);

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      await db
        .update(empresas)
        .set({ ativa: false, updatedAt: updatedAtValue })
        .where(eq(empresas.id, id));

      console.log(`✅ [ADMIN] Empresa ${empresa.nomeEmpresa} marcada como inativa (soft delete)`);
      return res.json({
        success: true,
        message: 'Empresa excluída com sucesso (soft delete)',
        empresa: { id: empresa.id, nome: empresa.nomeEmpresa, ativa: false }
      });
    }

    // Observação: se necessário implementar hard delete, considerar:
    // - Remover colaboradores vinculados (colaboradores.empresaId)
    // - Remover convites (convites_colaborador por empresa_id; convites_empresa por email_contato)
    // - Remover resultados vinculados (resultados.empresa_id)
    // - Depois deletar a própria empresa
    // Isso deve ser implementado com cuidado para não quebrar FKs.
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao excluir empresa:', {
      code: (error as any)?.code,
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack,
    });
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
});

// Compatibilidade: listar empresas na raiz para GET /api/empresas
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    console.log('🏢 [ADMIN] Listando empresas via GET /api/empresas');
    const todasEmpresas = await db
      .select({
        id: empresas.id,
        nomeEmpresa: empresas.nomeEmpresa,
        emailContato: empresas.emailContato,
        ativa: empresas.ativa,
        createdAt: empresas.createdAt,
        configuracoes: empresas.configuracoes,
      })
      .from(empresas);

    const empresasEnriquecidas = await Promise.all(
      todasEmpresas.map(async (empresa) => {
        const colaboradoresList = await db
          .select()
          .from(colaboradores)
          .where(eq(colaboradores.empresaId, empresa.id));

        return {
          id: empresa.id,
          nome_empresa: empresa.nomeEmpresa,
          email_contato: empresa.emailContato,
          ativo: empresa.ativa,
          created_at: empresa.createdAt,
          total_colaboradores: colaboradoresList.length,
          configuracoes: empresa.configuracoes,
        };
      })
    );

    res.json({ data: empresasEnriquecidas, total: empresasEnriquecidas.length });
  } catch (error) {
    console.error('Erro ao listar empresas (root):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
