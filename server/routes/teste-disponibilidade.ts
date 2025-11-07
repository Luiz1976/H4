import express from 'express';
import { db } from '../../db';
import { testeDisponibilidade, testes, resultados, colaboradores, insertTesteDisponibilidadeSchema, updateTesteDisponibilidadeSchema } from '../../shared/schema';
import { authenticateToken, AuthRequest, requireEmpresa, requireColaborador } from '../middleware/auth';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

/**
 * Buscar testes disponíveis para um colaborador
 * Retorna todos os testes com informações de disponibilidade
 */
router.get('/colaborador/testes', authenticateToken, requireColaborador, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user!.userId;
    const empresaId = req.user!.empresaId!;

    console.log('🔍 [DISPONIBILIDADE] Buscando testes para colaborador:', colaboradorId, 'da empresa:', empresaId);

    // Buscar todos os testes ativos
    const todosTestes = await db
      .select()
      .from(testes)
      .where(eq(testes.ativo, true));
    
    console.log('📊 [DISPONIBILIDADE] Total de testes ativos encontrados:', todosTestes.length);

    // Buscar disponibilidade para cada teste
    const testesComDisponibilidade = await Promise.all(
      todosTestes.map(async (teste) => {
        // Verificar se existe registro de disponibilidade
        const [disponibilidade] = await db
          .select()
          .from(testeDisponibilidade)
          .where(
            and(
              eq(testeDisponibilidade.colaboradorId, colaboradorId),
              eq(testeDisponibilidade.testeId, teste.id)
            )
          )
          .limit(1);

        // Verificar se já completou o teste
        const [resultado] = await db
          .select()
          .from(resultados)
          .where(
            and(
              eq(resultados.testeId, teste.id),
              or(
                eq(resultados.colaboradorId, colaboradorId),
                eq(resultados.usuarioId, colaboradorId)
              ),
              eq(resultados.status, 'concluido')
            )
          )
          .orderBy(desc(resultados.dataRealizacao))
          .limit(1);

        // Determinar disponibilidade
        let disponivel = true;
        let motivo: string | null = null;
        let proximaDisponibilidade: Date | null = null;

        if (disponibilidade) {
          // Se existe configuração, usar ela
          disponivel = disponibilidade.disponivel;
          
          if (!disponivel && disponibilidade.periodicidadeDias && disponibilidade.proximaDisponibilidade) {
            const agora = new Date();
            const proxima = new Date(disponibilidade.proximaDisponibilidade);
            
            if (agora >= proxima) {
              // Período expirou, liberar automaticamente
              disponivel = true;
              // Atualizar registro
              await db
                .update(testeDisponibilidade)
                .set({ 
                  disponivel: true,
                  updatedAt: new Date() 
                })
                .where(eq(testeDisponibilidade.id, disponibilidade.id));
            } else {
              proximaDisponibilidade = proxima;
              motivo = 'aguardando_periodicidade';
            }
          } else if (!disponivel) {
            motivo = 'bloqueado_empresa';
          }
        } else if (resultado) {
          // Se não tem configuração mas já completou, bloquear por padrão
          disponivel = false;
          motivo = 'teste_concluido';
          
          // Criar registro de disponibilidade
          await db
            .insert(testeDisponibilidade)
            .values({
              colaboradorId,
              testeId: teste.id,
              empresaId,
              disponivel: false,
              ultimaLiberacao: null,
              proximaDisponibilidade: null,
            })
            .onConflictDoNothing();
        }

        const testeInfo = {
          ...teste,
          disponivel,
          motivo,
          proximaDisponibilidade,
          dataConclusao: resultado?.dataRealizacao || null,
          pontuacao: resultado?.pontuacaoTotal || null,
          periodicidadeDias: disponibilidade?.periodicidadeDias || null,
        };

        console.log(`📋 [DISPONIBILIDADE] Teste "${teste.nome}" - Colaborador: ${colaboradorId}:`, {
          disponivel,
          motivo,
          temDisponibilidade: !!disponibilidade,
          temResultado: !!resultado,
          disponibilidadeData: disponibilidade ? {
            id: disponibilidade.id,
            disponivel: disponibilidade.disponivel,
            periodicidade: disponibilidade.periodicidadeDias,
            proxima: disponibilidade.proximaDisponibilidade,
            ultimaLiberacao: disponibilidade.ultimaLiberacao
          } : null,
          resultadoData: resultado ? {
            id: resultado.id,
            dataRealizacao: resultado.dataRealizacao,
            pontuacao: resultado.pontuacaoTotal
          } : null
        });

        return testeInfo;
      })
    );

    console.log('✅ [DISPONIBILIDADE] Retornando', testesComDisponibilidade.length, 'testes');
    console.log('📊 [DISPONIBILIDADE] Resumo:', {
      disponiveis: testesComDisponibilidade.filter(t => t.disponivel).length,
      bloqueados: testesComDisponibilidade.filter(t => !t.disponivel).length
    });

    res.json({ 
      testes: testesComDisponibilidade,
      total: testesComDisponibilidade.length 
    });
  } catch (error) {
    console.error('Erro ao buscar testes disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Buscar disponibilidade de testes de um colaborador
 */
router.get('/empresa/colaborador/:colaboradorId/testes', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { colaboradorId } = req.params;
    const empresaId = req.user!.empresaId!;

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Buscar todos os testes
    const todosTestes = await db
      .select()
      .from(testes)
      .where(eq(testes.ativo, true));

    // Buscar disponibilidade e resultados para cada teste
    const testesComInfo = await Promise.all(
      todosTestes.map(async (teste) => {
        const [disponibilidade] = await db
          .select()
          .from(testeDisponibilidade)
          .where(
            and(
              eq(testeDisponibilidade.colaboradorId, colaboradorId),
              eq(testeDisponibilidade.testeId, teste.id)
            )
          )
          .limit(1);

        const [resultado] = await db
          .select()
          .from(resultados)
          .where(
            and(
              eq(resultados.testeId, teste.id),
              or(
                eq(resultados.colaboradorId, colaboradorId),
                eq(resultados.usuarioId, colaboradorId)
              ),
              eq(resultados.status, 'concluido')
            )
          )
          .orderBy(desc(resultados.dataRealizacao))
          .limit(1);

        return {
          ...teste,
          disponibilidade: disponibilidade || null,
          ultimoResultado: resultado ? {
            id: resultado.id,
            pontuacaoTotal: resultado.pontuacaoTotal,
            dataRealizacao: resultado.dataRealizacao,
          } : null,
          foiConcluido: !!resultado,
        };
      })
    );

    res.json({ 
      testes: testesComInfo,
      total: testesComInfo.length 
    });
  } catch (error) {
    console.error('Erro ao buscar informações de testes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Liberar teste novamente para um colaborador
 */
router.post('/empresa/colaborador/:colaboradorId/teste/:testeId/liberar', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, testeId } = req.params;
    const empresaId = req.user!.empresaId!;

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Verificar se o teste existe
    const [teste] = await db
      .select()
      .from(testes)
      .where(eq(testes.id, testeId))
      .limit(1);

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    const agora = new Date();

    // Buscar registro de disponibilidade existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(testeDisponibilidade)
      .where(
        and(
          eq(testeDisponibilidade.colaboradorId, colaboradorId),
          eq(testeDisponibilidade.testeId, testeId)
        )
      )
      .limit(1);

    if (disponibilidadeExistente) {
      // Atualizar registro existente
      const historicoAtual = (disponibilidadeExistente.historicoLiberacoes as any[]) || [];
      const novoHistorico = [
        ...historicoAtual,
        {
          data: agora.toISOString(),
          liberadoPor: req.user!.userId,
          motivo: 'liberacao_manual',
        },
      ];

      const [atualizado] = await db
        .update(testeDisponibilidade)
        .set({
          disponivel: true,
          ultimaLiberacao: agora,
          proximaDisponibilidade: disponibilidadeExistente.periodicidadeDias
            ? new Date(agora.getTime() + disponibilidadeExistente.periodicidadeDias * 24 * 60 * 60 * 1000)
            : null,
          historicoLiberacoes: novoHistorico,
          updatedAt: agora,
        })
        .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id))
        .returning();

      return res.json({
        success: true,
        message: 'Teste liberado com sucesso',
        disponibilidade: atualizado,
      });
    } else {
      // Criar novo registro
      const [novo] = await db
        .insert(testeDisponibilidade)
        .values({
          colaboradorId,
          testeId,
          empresaId,
          disponivel: true,
          ultimaLiberacao: agora,
          proximaDisponibilidade: null,
          historicoLiberacoes: [{
            data: agora.toISOString(),
            liberadoPor: req.user!.userId,
            motivo: 'liberacao_manual',
          }],
        })
        .returning();

      return res.json({
        success: true,
        message: 'Teste liberado com sucesso',
        disponibilidade: novo,
      });
    }
  } catch (error) {
    console.error('Erro ao liberar teste:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Configurar periodicidade de um teste para um colaborador
 */
router.patch('/empresa/colaborador/:colaboradorId/teste/:testeId/periodicidade', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, testeId } = req.params;
    const empresaId = req.user!.empresaId!;

    // Validar dados
    const validationResult = z.object({
      periodicidadeDias: z.number().min(1).nullable().optional(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validationResult.error.issues 
      });
    }

    const { periodicidadeDias } = validationResult.data;

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Verificar se o teste existe
    const [teste] = await db
      .select()
      .from(testes)
      .where(eq(testes.id, testeId))
      .limit(1);

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    const agora = new Date();

    // Buscar registro existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(testeDisponibilidade)
      .where(
        and(
          eq(testeDisponibilidade.colaboradorId, colaboradorId),
          eq(testeDisponibilidade.testeId, testeId)
        )
      )
      .limit(1);

    // Calcular próxima disponibilidade se tiver periodicidade
    let proximaDisponibilidade: Date | null = null;
    if (periodicidadeDias && disponibilidadeExistente?.ultimaLiberacao) {
      const ultimaData = new Date(disponibilidadeExistente.ultimaLiberacao);
      proximaDisponibilidade = new Date(
        ultimaData.getTime() + periodicidadeDias * 24 * 60 * 60 * 1000
      );
    }

    if (disponibilidadeExistente) {
      // Atualizar registro existente
      const [atualizado] = await db
        .update(testeDisponibilidade)
        .set({
          periodicidadeDias,
          proximaDisponibilidade,
          metadados: {
            ...(disponibilidadeExistente.metadados as any || {}),
            periodicidadeConfiguradaEm: agora.toISOString(),
            configuradoPor: req.user!.userId,
          },
          updatedAt: agora,
        })
        .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id))
        .returning();

      return res.json({
        success: true,
        message: 'Periodicidade configurada com sucesso',
        disponibilidade: atualizado,
      });
    } else {
      // Criar novo registro
      const [novo] = await db
        .insert(testeDisponibilidade)
        .values({
          colaboradorId,
          testeId,
          empresaId,
          disponivel: true,
          periodicidadeDias,
          proximaDisponibilidade,
          metadados: {
            periodicidadeConfiguradaEm: agora.toISOString(),
            configuradoPor: req.user!.userId,
          },
        })
        .returning();

      return res.json({
        success: true,
        message: 'Periodicidade configurada com sucesso',
        disponibilidade: novo,
      });
    }
  } catch (error) {
    console.error('Erro ao configurar periodicidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Hook: Marcar teste como indisponível após conclusão
 * Este é chamado automaticamente após salvar um resultado
 */
router.post('/marcar-concluido', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validationResult = z.object({
      testeId: z.string().uuid(),
      colaboradorId: z.string().uuid().optional(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: validationResult.error.issues 
      });
    }

    const { testeId, colaboradorId: colaboradorIdParam } = validationResult.data;
    const colaboradorId = colaboradorIdParam || req.user!.userId;
    const empresaId = req.user!.empresaId;

    if (!empresaId) {
      return res.status(400).json({ error: 'Empresa não identificada' });
    }

    // Buscar registro existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(testeDisponibilidade)
      .where(
        and(
          eq(testeDisponibilidade.colaboradorId, colaboradorId),
          eq(testeDisponibilidade.testeId, testeId)
        )
      )
      .limit(1);

    const agora = new Date();

    if (disponibilidadeExistente) {
      // Calcular próxima disponibilidade se tiver periodicidade
      let proximaDisponibilidade: Date | null = null;
      if (disponibilidadeExistente.periodicidadeDias) {
        proximaDisponibilidade = new Date(
          agora.getTime() + disponibilidadeExistente.periodicidadeDias * 24 * 60 * 60 * 1000
        );
      }

      // Atualizar para indisponível
      await db
        .update(testeDisponibilidade)
        .set({
          disponivel: false,
          proximaDisponibilidade,
          updatedAt: agora,
        })
        .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id));
    } else {
      // Criar novo registro como indisponível
      await db
        .insert(testeDisponibilidade)
        .values({
          colaboradorId,
          testeId,
          empresaId,
          disponivel: false,
          ultimaLiberacao: null,
          proximaDisponibilidade: null,
        })
        .onConflictDoNothing();
    }

    res.json({ 
      success: true, 
      message: 'Teste marcado como concluído' 
    });
  } catch (error) {
    console.error('Erro ao marcar teste como concluído:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
