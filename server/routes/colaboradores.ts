import express from 'express';
import { db } from '../db';
import { colaboradores, cursoProgresso, cursoCertificados, cursoDisponibilidade } from '../../shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { cursos } from '../../src/data/cursosData';

const router = express.Router();

// Endpoint para colaborador obter seus próprios dados
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verificar se é um colaborador autenticado
    if (req.user?.role !== 'colaborador' || !req.user?.colaboradorId) {
      return res.status(403).json({ error: 'Acesso negado. Apenas colaboradores podem acessar este endpoint.' });
    }

    const [colaborador] = await db
      .select({
        id: colaboradores.id,
        nome: colaboradores.nome,
        email: colaboradores.email,
        cargo: colaboradores.cargo,
        departamento: colaboradores.departamento,
        avatar: colaboradores.avatar,
        empresaId: colaboradores.empresaId,
        permissoes: colaboradores.permissoes,
        ativo: colaboradores.ativo,
        createdAt: colaboradores.createdAt,
      })
      .from(colaboradores)
      .where(eq(colaboradores.id, req.user.colaboradorId))
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json({ colaborador });
  } catch (error) {
    console.error('Erro ao buscar dados do colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Schema de validação para atualização de colaborador
const updateColaboradorSchema = z.object({
  avatar: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  nome: z.string().optional(),
});

// Endpoint para atualizar dados do colaborador
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se é um colaborador autenticado tentando atualizar seus próprios dados
    if (req.user?.role !== 'colaborador' || req.user?.colaboradorId !== id) {
      return res.status(403).json({ error: 'Acesso negado. Você só pode atualizar seus próprios dados.' });
    }

    // Validar dados de entrada
    const validationResult = updateColaboradorSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const updateData = validationResult.data;

    // Atualizar colaborador no banco
    const [updatedColaborador] = await db
      .update(colaboradores)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(colaboradores.id, id))
      .returning();

    if (!updatedColaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json({ 
      success: true, 
      colaborador: {
        id: updatedColaborador.id,
        nome: updatedColaborador.nome,
        email: updatedColaborador.email,
        cargo: updatedColaborador.cargo,
        departamento: updatedColaborador.departamento,
        avatar: updatedColaborador.avatar,
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para empresa buscar cursos e certificados de um colaborador
router.get('/:id/cursos-detalhes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se é uma empresa autenticada
    if (req.user?.role !== 'empresa') {
      return res.status(403).json({ error: 'Acesso negado. Apenas empresas podem acessar este endpoint.' });
    }

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(and(
        eq(colaboradores.id, id),
        eq(colaboradores.empresaId, req.user.empresaId!)
      ))
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado ou não pertence à sua empresa' });
    }

    // Buscar todos os certificados do colaborador
    const certificados = await db.query.cursoCertificados.findMany({
      where: eq(cursoCertificados.colaboradorId, id),
      orderBy: (cursoCertificados, { desc }) => [desc(cursoCertificados.dataEmissao)]
    });

    // Buscar progresso de todos os cursos
    const progressos = await db.query.cursoProgresso.findMany({
      where: eq(cursoProgresso.colaboradorId, id)
    });

    // Buscar disponibilidade dos cursos
    const disponibilidades = await db.query.cursoDisponibilidade.findMany({
      where: eq(cursoDisponibilidade.colaboradorId, id)
    });

    // Mapear cursos com todas as informações
    const cursosCompletos = cursos.map(curso => {
      const progresso = progressos.find(p => p.cursoSlug === curso.slug);
      const certificado = certificados.find(c => c.cursoSlug === curso.slug);
      const disponibilidade = disponibilidades.find(d => d.cursoId === curso.slug);

      return {
        ...curso,
        disponivel: disponibilidade?.disponivel || false,
        progresso: progresso ? {
          id: progresso.id,
          progressoPorcentagem: progresso.progressoPorcentagem || 0,
          modulosCompletados: progresso.modulosCompletados || [],
          avaliacaoFinalRealizada: progresso.avaliacaoFinalRealizada,
          avaliacaoFinalPontuacao: progresso.avaliacaoFinalPontuacao,
          dataConclusao: progresso.dataConclusao,
          dataUltimaAtualizacao: progresso.dataUltimaAtualizacao,
        } : null,
        certificado: certificado ? {
          id: certificado.id,
          dataEmissao: certificado.dataEmissao,
          codigoAutenticacao: certificado.codigoAutenticacao,
          qrCodeUrl: certificado.qrCodeUrl,
        } : null,
        status: certificado ? 'concluido' : 
                progresso && progresso.progressoPorcentagem > 0 ? 'em_andamento' : 
                disponibilidade?.disponivel ? 'disponivel' : 'bloqueado'
      };
    });

    res.json({
      cursosCompletos,
      resumo: {
        totalCursos: cursos.length,
        concluidos: certificados.length,
        emAndamento: progressos.filter(p => p.progressoPorcentagem > 0 && !p.avaliacaoFinalRealizada).length,
        disponiveis: disponibilidades.filter(d => d.disponivel).length,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar cursos do colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para empresa buscar certificado específico de um colaborador
router.get('/:id/certificado/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, cursoSlug } = req.params;

    // Verificar se é uma empresa autenticada
    if (req.user?.role !== 'empresa') {
      return res.status(403).json({ error: 'Acesso negado. Apenas empresas podem acessar este endpoint.' });
    }

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(and(
        eq(colaboradores.id, id),
        eq(colaboradores.empresaId, req.user.empresaId!)
      ))
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado ou não pertence à sua empresa' });
    }

    // Buscar certificado
    const certificado = await db.query.cursoCertificados.findFirst({
      where: and(
        eq(cursoCertificados.colaboradorId, id),
        eq(cursoCertificados.cursoSlug, cursoSlug)
      )
    });

    if (!certificado) {
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }

    res.json(certificado);
  } catch (error) {
    console.error('Erro ao buscar certificado do colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
