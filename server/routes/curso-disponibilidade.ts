import express from 'express';
import { db } from '../db';
import { cursoDisponibilidade, cursoAvaliacoes, colaboradores, insertCursoDisponibilidadeSchema, updateCursoDisponibilidadeSchema } from '../../shared/schema';
import { authenticateToken, AuthRequest, requireEmpresa, requireColaborador } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

/**
 * Buscar cursos disponíveis para um colaborador
 * Retorna todos os cursos com informações de disponibilidade
 */
router.get('/colaborador/cursos', authenticateToken, requireColaborador, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user!.userId;
    const empresaId = req.user!.empresaId!;

    console.log('🔍 [CURSO-DISPONIBILIDADE] Buscando cursos para colaborador:', colaboradorId, 'da empresa:', empresaId);

    // Importar lista de cursos estáticos
    const { cursos } = await import('../../src/data/cursosData');
    
    console.log('📊 [CURSO-DISPONIBILIDADE] Total de cursos encontrados:', cursos.length);

    // Buscar disponibilidade para cada curso
    const cursosComDisponibilidade = await Promise.all(
      cursos.map(async (curso) => {
        // Verificar se existe registro de disponibilidade
        const [disponibilidade] = await db
          .select()
          .from(cursoDisponibilidade)
          .where(
            and(
              eq(cursoDisponibilidade.colaboradorId, colaboradorId),
              eq(cursoDisponibilidade.cursoId, curso.slug)
            )
          )
          .limit(1);

        // Verificar se já completou o curso (avaliação concluída)
        const [avaliacao] = await db
          .select()
          .from(cursoAvaliacoes)
          .where(
            and(
              eq(cursoAvaliacoes.cursoId, curso.slug),
              eq(cursoAvaliacoes.colaboradorId, colaboradorId),
              eq(cursoAvaliacoes.aprovado, true)
            )
          )
          .orderBy(desc(cursoAvaliacoes.dataRealizacao))
          .limit(1);

        // Determinar disponibilidade
        let disponivel = false; // Cursos bloqueados por padrão
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
                .update(cursoDisponibilidade)
                .set({ 
                  disponivel: true,
                  updatedAt: new Date() 
                })
                .where(eq(cursoDisponibilidade.id, disponibilidade.id));
            } else {
              proximaDisponibilidade = proxima;
              motivo = 'aguardando_periodicidade';
            }
          } else if (!disponivel) {
            motivo = 'bloqueado_empresa';
          }
        } else {
          // Se não tem configuração de disponibilidade, curso está bloqueado
          motivo = 'curso_nao_liberado';
        }

        // Se já completou, mostrar isso
        if (avaliacao) {
          motivo = 'curso_concluido';
        }

        const cursoInfo = {
          id: curso.id,
          slug: curso.slug,
          titulo: curso.titulo,
          subtitulo: curso.subtitulo,
          descricao: curso.descricao,
          duracao: curso.duracao,
          nivel: curso.nivel,
          categoria: curso.categoria,
          icone: curso.icone,
          cor: curso.cor,
          modulos: curso.modulos || [],
          disponivel,
          motivo,
          proximaDisponibilidade,
          dataConclusao: avaliacao?.dataRealizacao || null,
          pontuacao: avaliacao?.pontuacao || null,
          periodicidadeDias: disponibilidade?.periodicidadeDias || null,
        };

        console.log(`📋 [CURSO-DISPONIBILIDADE] Curso "${curso.titulo}" - Colaborador: ${colaboradorId}:`, {
          disponivel,
          motivo,
          temDisponibilidade: !!disponibilidade,
          temAvaliacao: !!avaliacao,
        });

        return cursoInfo;
      })
    );

    console.log('✅ [CURSO-DISPONIBILIDADE] Retornando', cursosComDisponibilidade.length, 'cursos');
    console.log('📊 [CURSO-DISPONIBILIDADE] Resumo:', {
      disponiveis: cursosComDisponibilidade.filter(c => c.disponivel).length,
      bloqueados: cursosComDisponibilidade.filter(c => !c.disponivel).length
    });

    res.json({ 
      cursos: cursosComDisponibilidade,
      total: cursosComDisponibilidade.length 
    });
  } catch (error) {
    console.error('Erro ao buscar cursos disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Buscar disponibilidade de cursos de um colaborador
 */
router.get('/empresa/colaborador/:colaboradorId/cursos', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
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

    // Importar lista de cursos estáticos
    const { cursos } = await import('../../src/data/cursosData');

    // Buscar disponibilidade e avaliações para cada curso
    const cursosComInfo = await Promise.all(
      cursos.map(async (curso) => {
        const [disponibilidade] = await db
          .select()
          .from(cursoDisponibilidade)
          .where(
            and(
              eq(cursoDisponibilidade.colaboradorId, colaboradorId),
              eq(cursoDisponibilidade.cursoId, curso.slug)
            )
          )
          .limit(1);

        const [avaliacao] = await db
          .select()
          .from(cursoAvaliacoes)
          .where(
            and(
              eq(cursoAvaliacoes.cursoId, curso.slug),
              eq(cursoAvaliacoes.colaboradorId, colaboradorId),
              eq(cursoAvaliacoes.aprovado, true)
            )
          )
          .orderBy(desc(cursoAvaliacoes.dataRealizacao))
          .limit(1);

        return {
          id: curso.id,
          slug: curso.slug,
          titulo: curso.titulo,
          descricao: curso.descricao,
          duracao: curso.duracao,
          nivel: curso.nivel,
          categoria: curso.categoria,
          disponibilidade: disponibilidade || null,
          ultimaAvaliacao: avaliacao ? {
            id: avaliacao.id,
            pontuacao: avaliacao.pontuacao,
            dataRealizacao: avaliacao.dataRealizacao,
          } : null,
          foiConcluido: !!avaliacao,
        };
      })
    );

    res.json({ 
      cursos: cursosComInfo,
      total: cursosComInfo.length 
    });
  } catch (error) {
    console.error('Erro ao buscar informações de cursos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Liberar curso para um colaborador
 */
router.post('/empresa/colaborador/:colaboradorId/curso/:cursoSlug/liberar', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, cursoSlug } = req.params;
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

    // Verificar se o curso existe
    const { cursos } = await import('../../src/data/cursosData');
    const curso = cursos.find(c => c.slug === cursoSlug);

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const agora = new Date();

    // Buscar registro de disponibilidade existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(cursoDisponibilidade)
      .where(
        and(
          eq(cursoDisponibilidade.colaboradorId, colaboradorId),
          eq(cursoDisponibilidade.cursoId, cursoSlug)
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
        .update(cursoDisponibilidade)
        .set({
          disponivel: true,
          ultimaLiberacao: agora,
          proximaDisponibilidade: disponibilidadeExistente.periodicidadeDias
            ? new Date(agora.getTime() + disponibilidadeExistente.periodicidadeDias * 24 * 60 * 60 * 1000)
            : null,
          historicoLiberacoes: novoHistorico,
          updatedAt: agora,
        })
        .where(eq(cursoDisponibilidade.id, disponibilidadeExistente.id))
        .returning();

      return res.json({
        success: true,
        message: 'Curso liberado com sucesso',
        disponibilidade: atualizado,
      });
    } else {
      // Criar novo registro
      const [novo] = await db
        .insert(cursoDisponibilidade)
        .values({
          colaboradorId,
          cursoId: cursoSlug,
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
        message: 'Curso liberado com sucesso',
        disponibilidade: novo,
      });
    }
  } catch (error) {
    console.error('Erro ao liberar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Bloquear curso de um colaborador
 */
router.post('/empresa/colaborador/:colaboradorId/curso/:cursoSlug/bloquear', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, cursoSlug } = req.params;
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

    const agora = new Date();

    // Buscar registro de disponibilidade existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(cursoDisponibilidade)
      .where(
        and(
          eq(cursoDisponibilidade.colaboradorId, colaboradorId),
          eq(cursoDisponibilidade.cursoId, cursoSlug)
        )
      )
      .limit(1);

    if (disponibilidadeExistente) {
      // Atualizar registro existente
      const [atualizado] = await db
        .update(cursoDisponibilidade)
        .set({
          disponivel: false,
          updatedAt: agora,
        })
        .where(eq(cursoDisponibilidade.id, disponibilidadeExistente.id))
        .returning();

      return res.json({
        success: true,
        message: 'Curso bloqueado com sucesso',
        disponibilidade: atualizado,
      });
    } else {
      // Criar novo registro como bloqueado
      const [novo] = await db
        .insert(cursoDisponibilidade)
        .values({
          colaboradorId,
          cursoId: cursoSlug,
          empresaId,
          disponivel: false,
        })
        .returning();

      return res.json({
        success: true,
        message: 'Curso bloqueado com sucesso',
        disponibilidade: novo,
      });
    }
  } catch (error) {
    console.error('Erro ao bloquear curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Configurar periodicidade de um curso para um colaborador
 */
router.patch('/empresa/colaborador/:colaboradorId/curso/:cursoSlug/periodicidade', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, cursoSlug } = req.params;
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

    // Verificar se o curso existe
    const { cursos } = await import('../../src/data/cursosData');
    const curso = cursos.find(c => c.slug === cursoSlug);

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const agora = new Date();

    // Buscar registro existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(cursoDisponibilidade)
      .where(
        and(
          eq(cursoDisponibilidade.colaboradorId, colaboradorId),
          eq(cursoDisponibilidade.cursoId, cursoSlug)
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
        .update(cursoDisponibilidade)
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
        .where(eq(cursoDisponibilidade.id, disponibilidadeExistente.id))
        .returning();

      return res.json({
        success: true,
        message: 'Periodicidade configurada com sucesso',
        disponibilidade: atualizado,
      });
    } else {
      // Criar novo registro
      const [novo] = await db
        .insert(cursoDisponibilidade)
        .values({
          colaboradorId,
          cursoId: cursoSlug,
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

export default router;
