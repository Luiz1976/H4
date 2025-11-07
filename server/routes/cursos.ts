import express from 'express';
import { db } from '../db';
import { cursoProgresso, cursoAvaliacoes, cursoCertificados, colaboradores, cursoDisponibilidade } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Helper: Verificar se curso está disponível para o colaborador
async function verificarDisponibilidadeCurso(
  colaboradorId: string,
  cursoSlug: string
): Promise<{ disponivel: boolean; motivo?: string }> {
  try {
    // Buscar registro de disponibilidade
    const [disponibilidade] = await db
      .select()
      .from(cursoDisponibilidade)
      .where(
        and(
          eq(cursoDisponibilidade.colaboradorId, colaboradorId),
          eq(cursoDisponibilidade.cursoId, cursoSlug)
        )
      )
      .limit(1);

    if (!disponibilidade) {
      return { disponivel: false, motivo: 'Curso não liberado pela empresa' };
    }

    if (!disponibilidade.disponivel) {
      return { disponivel: false, motivo: 'Curso bloqueado pela empresa' };
    }

    return { disponivel: true };
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return { disponivel: false, motivo: 'Erro ao verificar disponibilidade' };
  }
}

// Obter progresso de um curso específico
router.get('/progresso/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar disponibilidade do curso
    const { disponivel, motivo } = await verificarDisponibilidadeCurso(colaboradorId, cursoSlug);
    if (!disponivel) {
      return res.status(403).json({ error: motivo || 'Curso não disponível' });
    }

    const progresso = await db.query.cursoProgresso.findFirst({
      where: and(
        eq(cursoProgresso.colaboradorId, colaboradorId),
        eq(cursoProgresso.cursoSlug, cursoSlug)
      )
    });

    if (!progresso) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    return res.json(progresso);
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
});

// Iniciar ou atualizar progresso de um curso
router.post('/progresso', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user?.userId;
    const { cursoId, cursoSlug, totalModulos } = req.body;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar disponibilidade do curso
    const { disponivel, motivo } = await verificarDisponibilidadeCurso(colaboradorId, cursoSlug);
    if (!disponivel) {
      return res.status(403).json({ error: motivo || 'Curso não disponível' });
    }

    // Verificar se já existe progresso
    const progressoExistente = await db.query.cursoProgresso.findFirst({
      where: and(
        eq(cursoProgresso.colaboradorId, colaboradorId),
        eq(cursoProgresso.cursoId, cursoId)
      )
    });

    if (progressoExistente) {
      return res.json(progressoExistente);
    }

    // Criar novo progresso
    const [novoProgresso] = await db.insert(cursoProgresso).values({
      colaboradorId,
      cursoId,
      cursoSlug,
      totalModulos,
      modulosCompletados: [],
      progressoPorcentagem: 0,
    }).returning();

    return res.status(201).json(novoProgresso);
  } catch (error) {
    console.error('Erro ao criar progresso:', error);
    return res.status(500).json({ error: 'Erro ao criar progresso' });
  }
});

// Marcar módulo como completado
router.post('/progresso/:cursoSlug/modulo/:moduloId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('📝 [CURSOS] Requisição para marcar módulo como concluído recebida');
    const { cursoSlug, moduloId } = req.params;
    const colaboradorId = req.user?.userId;
    const { totalModulos } = req.body; // Aceitar totalModulos do frontend
    
    console.log('📝 [CURSOS] Params:', { cursoSlug, moduloId, colaboradorId, totalModulos });

    if (!colaboradorId) {
      console.error('❌ [CURSOS] Colaborador não autenticado');
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar disponibilidade do curso
    const { disponivel, motivo } = await verificarDisponibilidadeCurso(colaboradorId, cursoSlug);
    if (!disponivel) {
      console.error('❌ [CURSOS] Curso não disponível:', motivo);
      return res.status(403).json({ error: motivo || 'Curso não disponível' });
    }

    console.log('📝 [CURSOS] Buscando progresso no banco...');
    let progresso = await db.query.cursoProgresso.findFirst({
      where: and(
        eq(cursoProgresso.colaboradorId, colaboradorId),
        eq(cursoProgresso.cursoSlug, cursoSlug)
      )
    });

    if (!progresso) {
      console.log('⚠️  [CURSOS] Progresso não encontrado, criando automaticamente...');
      
      if (!totalModulos) {
        console.error('❌ [CURSOS] totalModulos não foi fornecido');
        return res.status(400).json({ error: 'totalModulos é obrigatório para criar progresso' });
      }
      
      // Criar progresso automaticamente
      const [novoProgresso] = await db.insert(cursoProgresso).values({
        colaboradorId,
        cursoId: cursoSlug, // Usar slug como ID temporário
        cursoSlug,
        totalModulos,
        modulosCompletados: [],
        progressoPorcentagem: 0,
      }).returning();
      
      console.log('✅ [CURSOS] Progresso criado automaticamente:', novoProgresso.id);
      progresso = novoProgresso;
    }

    console.log('✅ [CURSOS] Progresso encontrado:', progresso.id);

    const modulosCompletadosArray = Array.isArray(progresso.modulosCompletados) 
      ? progresso.modulosCompletados 
      : [];
    
    console.log('📝 [CURSOS] Módulos completados antes:', modulosCompletadosArray);
    
    // Adicionar módulo se ainda não foi completado
    const moduloIdNum = parseInt(moduloId);
    if (!modulosCompletadosArray.includes(moduloIdNum)) {
      modulosCompletadosArray.push(moduloIdNum);
      console.log('✅ [CURSOS] Módulo adicionado:', moduloIdNum);
    } else {
      console.log('⚠️  [CURSOS] Módulo já estava completado:', moduloIdNum);
    }

    const novaProgresso = Math.round((modulosCompletadosArray.length / progresso.totalModulos) * 100);
    console.log('📊 [CURSOS] Novo progresso calculado:', novaProgresso + '%');

    console.log('📝 [CURSOS] Atualizando banco de dados...');
    const [progressoAtualizado] = await db
      .update(cursoProgresso)
      .set({
        modulosCompletados: modulosCompletadosArray,
        progressoPorcentagem: novaProgresso,
        dataUltimaAtualizacao: new Date(),
        dataConclusao: modulosCompletadosArray.length === progresso.totalModulos ? new Date() : null,
      })
      .where(eq(cursoProgresso.id, progresso.id))
      .returning();

    console.log('✅ [CURSOS] Progresso atualizado com sucesso!');
    return res.json(progressoAtualizado);
  } catch (error) {
    console.error('❌ [CURSOS] Erro ao atualizar progresso:', error);
    console.error('❌ [CURSOS] Stack trace:', (error as Error).stack);
    return res.status(500).json({ 
      error: 'Erro ao atualizar progresso',
      details: (error as Error).message 
    });
  }
});

// Submeter avaliação final
router.post('/avaliacao/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;
    const { cursoId, respostas, pontuacao, totalQuestoes, tempoGasto } = req.body;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar se todos os módulos foram completados
    const progresso = await db.query.cursoProgresso.findFirst({
      where: and(
        eq(cursoProgresso.colaboradorId, colaboradorId),
        eq(cursoProgresso.cursoSlug, cursoSlug)
      )
    });

    if (!progresso) {
      return res.status(400).json({ error: 'Complete todos os módulos antes da avaliação' });
    }

    // Se o colaborador já tem progresso, significa que o curso foi liberado em algum momento
    // Permitir avaliação mesmo se disponibilidade foi alterada posteriormente

    const modulosCompletadosArray = Array.isArray(progresso.modulosCompletados) 
      ? progresso.modulosCompletados 
      : [];

    if (modulosCompletadosArray.length < progresso.totalModulos) {
      return res.status(400).json({ 
        error: 'Complete todos os módulos antes da avaliação',
        modulosCompletados: modulosCompletadosArray.length,
        totalModulos: progresso.totalModulos
      });
    }

    // Verificar número de tentativas (máximo 3)
    const tentativasAtuais = progresso.tentativasAvaliacao || 0;
    
    if (tentativasAtuais >= 3) {
      return res.status(400).json({ 
        error: 'Você já utilizou todas as 3 tentativas disponíveis para esta avaliação',
        tentativasRestantes: 0
      });
    }

    // Verificar se já foi aprovado anteriormente
    if (progresso.avaliacaoFinalRealizada && progresso.avaliacaoFinalPontuacao && progresso.avaliacaoFinalPontuacao >= (totalQuestoes * 0.7)) {
      return res.status(400).json({ 
        error: 'Avaliação já aprovada anteriormente',
        aprovado: true
      });
    }

    // Aprovar se pontuação >= 70%
    const aprovado = pontuacao >= (totalQuestoes * 0.7);
    const novaTentativa = tentativasAtuais + 1;

    // Criar avaliação
    const [avaliacao] = await db.insert(cursoAvaliacoes).values({
      colaboradorId,
      cursoId,
      cursoSlug,
      respostas,
      pontuacao,
      totalQuestoes,
      aprovado,
      tempoGasto,
    }).returning();

    // Atualizar progresso com resultado da avaliação
    await db
      .update(cursoProgresso)
      .set({
        avaliacaoFinalRealizada: aprovado, // Só marca como realizada se aprovado
        avaliacaoFinalPontuacao: pontuacao,
        tentativasAvaliacao: novaTentativa,
        dataUltimaAtualizacao: new Date(),
      })
      .where(eq(cursoProgresso.id, progresso.id));

    // 🔒 BLOQUEIO AUTOMÁTICO: Se aprovado, bloquear o curso automaticamente
    if (aprovado) {
      try {
        console.log('🔒 [BLOQUEIO-AUTO] Iniciando bloqueio automático do curso após aprovação');
        console.log('🔒 [BLOQUEIO-AUTO] Colaborador:', colaboradorId);
        console.log('🔒 [BLOQUEIO-AUTO] Curso:', cursoSlug);

        // Buscar registro de disponibilidade
        const disponibilidadeExistente = await db.query.cursoDisponibilidade.findFirst({
          where: and(
            eq(cursoDisponibilidade.colaboradorId, colaboradorId),
            eq(cursoDisponibilidade.cursoId, cursoSlug)
          )
        });

        if (disponibilidadeExistente) {
          // Bloquear curso
          await db
            .update(cursoDisponibilidade)
            .set({ 
              disponivel: false,
              updatedAt: new Date()
            })
            .where(eq(cursoDisponibilidade.id, disponibilidadeExistente.id));
          
          console.log('✅ [BLOQUEIO-AUTO] Curso bloqueado automaticamente após conclusão');
        } else {
          console.log('⚠️ [BLOQUEIO-AUTO] Registro de disponibilidade não encontrado');
        }
      } catch (bloqueioError) {
        // Log do erro mas não falhar a avaliação
        console.error('❌ [BLOQUEIO-AUTO] Erro ao bloquear curso automaticamente:', bloqueioError);
        console.error('⚠️ [BLOQUEIO-AUTO] Avaliação registrada com sucesso, mas bloqueio falhou');
      }
    }

    return res.status(201).json({ 
      ...avaliacao, 
      aprovado,
      tentativaAtual: novaTentativa,
      tentativasRestantes: 3 - novaTentativa
    });
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    return res.status(500).json({ error: 'Erro ao salvar avaliação' });
  }
});

// Emitir certificado
router.post('/certificado/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;
    const { cursoId, cursoTitulo, cargaHoraria } = req.body;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar se avaliação foi aprovada
    const avaliacao = await db.query.cursoAvaliacoes.findFirst({
      where: and(
        eq(cursoAvaliacoes.colaboradorId, colaboradorId),
        eq(cursoAvaliacoes.cursoSlug, cursoSlug),
        eq(cursoAvaliacoes.aprovado, true)
      )
    });

    if (!avaliacao) {
      return res.status(400).json({ error: 'Avaliação não aprovada ou não realizada' });
    }

    // Verificar se certificado já existe
    const certificadoExistente = await db.query.cursoCertificados.findFirst({
      where: and(
        eq(cursoCertificados.colaboradorId, colaboradorId),
        eq(cursoCertificados.cursoSlug, cursoSlug)
      )
    });

    if (certificadoExistente) {
      return res.json(certificadoExistente);
    }

    // Buscar nome do colaborador
    const colaborador = await db.query.colaboradores.findFirst({
      where: eq(colaboradores.id, colaboradorId)
    });

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Gerar código de autenticação único
    const codigoAutenticacao = `HQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Criar certificado
    const [certificado] = await db.insert(cursoCertificados).values({
      colaboradorId,
      cursoId,
      cursoSlug,
      cursoTitulo,
      colaboradorNome: colaborador.nome,
      cargaHoraria,
      codigoAutenticacao,
      qrCodeUrl: `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/${codigoAutenticacao}`,
      assinaturaDigital: 'Dr. Carlos Silva - Diretor de Educação HumaniQ AI',
      validado: true,
    }).returning();

    return res.status(201).json(certificado);
  } catch (error) {
    console.error('Erro ao emitir certificado:', error);
    return res.status(500).json({ error: 'Erro ao emitir certificado' });
  }
});

// Buscar certificado por colaborador e curso
router.get('/certificado/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;

    console.log('🎓 [BACKEND-CERTIFICADO] Buscando certificado');
    console.log('🎓 [BACKEND-CERTIFICADO] Curso slug:', cursoSlug);
    console.log('🎓 [BACKEND-CERTIFICADO] Colaborador ID:', colaboradorId);

    if (!colaboradorId) {
      console.error('❌ [BACKEND-CERTIFICADO] Colaborador não autorizado');
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const certificado = await db.query.cursoCertificados.findFirst({
      where: and(
        eq(cursoCertificados.colaboradorId, colaboradorId),
        eq(cursoCertificados.cursoSlug, cursoSlug)
      )
    });

    console.log('🎓 [BACKEND-CERTIFICADO] Certificado encontrado?', !!certificado);
    if (certificado) {
      console.log('🎓 [BACKEND-CERTIFICADO] ID do certificado:', certificado.id);
    }

    if (!certificado) {
      console.log('⚠️ [BACKEND-CERTIFICADO] Retornando 404');
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }

    console.log('✅ [BACKEND-CERTIFICADO] Retornando certificado com sucesso');
    return res.json(certificado);
  } catch (error) {
    console.error('❌ [BACKEND-CERTIFICADO] Erro ao buscar certificado:', error);
    return res.status(500).json({ error: 'Erro ao buscar certificado' });
  }
});

// Validar certificado (público)
router.get('/validar-certificado/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await db.query.cursoCertificados.findFirst({
      where: eq(cursoCertificados.codigoAutenticacao, codigo)
    });

    if (!certificado) {
      return res.status(404).json({ 
        valido: false, 
        mensagem: 'Certificado não encontrado' 
      });
    }

    return res.json({
      valido: certificado.validado,
      certificado: {
        cursoTitulo: certificado.cursoTitulo,
        colaboradorNome: certificado.colaboradorNome,
        cargaHoraria: certificado.cargaHoraria,
        dataEmissao: certificado.dataEmissao,
        codigoAutenticacao: certificado.codigoAutenticacao,
      }
    });
  } catch (error) {
    console.error('Erro ao validar certificado:', error);
    return res.status(500).json({ error: 'Erro ao validar certificado' });
  }
});

// Listar todo o progresso de cursos do colaborador
router.get('/progresso', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user?.userId;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const progressos = await db.query.cursoProgresso.findMany({
      where: eq(cursoProgresso.colaboradorId, colaboradorId)
    });

    return res.json(progressos);
  } catch (error) {
    console.error('Erro ao buscar progressos:', error);
    return res.status(500).json({ error: 'Erro ao buscar progressos' });
  }
});

// Listar todos os certificados do colaborador
router.get('/meus-certificados', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user?.userId;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const certificados = await db.query.cursoCertificados.findMany({
      where: eq(cursoCertificados.colaboradorId, colaboradorId)
    });

    // Converter para camelCase para o frontend
    const certificadosCamelCase = certificados.map(cert => ({
      id: cert.id,
      colaboradorId: cert.colaboradorId,
      cursoId: cert.cursoId,
      cursoSlug: cert.cursoSlug,
      cursoTitulo: cert.cursoTitulo,
      colaboradorNome: cert.colaboradorNome,
      cargaHoraria: cert.cargaHoraria,
      dataEmissao: cert.dataEmissao,
      codigoAutenticacao: cert.codigoAutenticacao,
      qrCodeUrl: cert.qrCodeUrl,
      assinaturaDigital: cert.assinaturaDigital,
      validado: cert.validado
    }));

    return res.json(certificadosCamelCase);
  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return res.status(500).json({ error: 'Erro ao buscar certificados' });
  }
});

export default router;
