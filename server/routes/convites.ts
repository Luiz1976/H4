import express from 'express';
import { db } from '../../db';
import { convitesEmpresa, convitesColaborador, empresas, colaboradores, insertConviteEmpresaSchema, insertConviteColaboradorSchema, insertEmpresaSchema, insertColaboradorSchema } from '../../shared/schema';
import { hashPassword, generateInviteToken } from '../utils/auth';
import { authenticateToken, requireAdmin, requireEmpresa, AuthRequest } from '../middleware/auth';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';
import { enviarConviteEmpresa, enviarConviteColaborador, enviarBoasVindas } from '../services/emailService';

const router = express.Router();

// Admin cria convite para empresa
router.post('/empresa', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const validationResult = insertConviteEmpresaSchema.omit({ token: true, validade: true }).extend({
      diasValidade: z.number().min(1).max(90).default(7),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const { nomeEmpresa, emailContato, cnpj, numeroColaboradores, diasAcesso, diasValidade, ...rest } = validationResult.data;

    const [existingEmpresa] = await db.select().from(empresas).where(eq(empresas.emailContato, emailContato)).limit(1);
    if (existingEmpresa) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const token = generateInviteToken();
    const validade = new Date();
    validade.setDate(validade.getDate() + (diasValidade || 7));

    const [convite] = await db
      .insert(convitesEmpresa)
      .values({
        token,
        nomeEmpresa,
        emailContato,
        cnpj: cnpj || null,
        numeroColaboradores: numeroColaboradores || null,
        diasAcesso: diasAcesso || null,
        adminId: req.user!.userId,
        validade,
        status: 'pendente',
        ...rest,
      })
      .returning();

    const linkConvite = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/convite/empresa/${token}`;

    // Enviar email de convite (não bloqueia a resposta)
    enviarConviteEmpresa(emailContato, nomeEmpresa, linkConvite)
      .then(success => {
        if (success) {
          console.log('✅ Email de convite enviado para:', emailContato);
        } else {
          console.warn('⚠️ Falha ao enviar email de convite para:', emailContato);
        }
      })
      .catch(error => {
        console.error('❌ Erro ao enviar email de convite:', error);
      });

    res.status(201).json({
      convite,
      linkConvite,
      emailEnviado: true, // Indica que o email foi agendado para envio
    });
  } catch (error) {
    console.error('Erro ao criar convite empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Empresa cria convite para colaborador
router.post('/colaborador', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const validationResult = insertConviteColaboradorSchema.omit({ token: true, validade: true, empresaId: true }).extend({
      diasValidade: z.number().min(1).max(30).default(3),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const { nome, email, diasValidade, ...rest } = validationResult.data;

    const [existingColaborador] = await db.select().from(colaboradores).where(eq(colaboradores.email, email)).limit(1);
    if (existingColaborador) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const token = generateInviteToken();
    const validade = new Date();
    validade.setDate(validade.getDate() + (diasValidade || 3));

    const [convite] = await db
      .insert(convitesColaborador)
      .values({
        token,
        nome,
        email,
        empresaId: req.user!.empresaId!,
        validade,
        status: 'pendente',
        ...rest,
      })
      .returning();

    const linkConvite = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/convite/colaborador/${token}`;

    // Buscar nome da empresa para incluir no email
    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, req.user!.empresaId!))
      .limit(1);

    // Enviar email de convite (não bloqueia a resposta)
    if (empresa) {
      enviarConviteColaborador(email, nome, empresa.nomeEmpresa, linkConvite)
        .then(success => {
          if (success) {
            console.log('✅ Email de convite enviado para:', email);
          } else {
            console.warn('⚠️ Falha ao enviar email de convite para:', email);
          }
        })
        .catch(error => {
          console.error('❌ Erro ao enviar email de convite:', error);
        });
    }

    res.status(201).json({
      success: true,
      message: 'Convite criado com sucesso',
      data: {
        ...convite,
        linkConvite,
        emailEnviado: true,
      }
    });
  } catch (error) {
    console.error('Erro ao criar convite colaborador:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o convite'
    });
  }
});

// Buscar convite por token (público)
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { tipo } = req.query;

    if (tipo === 'empresa') {
      const [convite] = await db
        .select()
        .from(convitesEmpresa)
        .where(
          and(
            eq(convitesEmpresa.token, token),
            eq(convitesEmpresa.status, 'pendente'),
            gt(convitesEmpresa.validade, new Date())
          )
        )
        .limit(1);

      if (!convite) {
        return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
      }

      return res.json({ convite, tipo: 'empresa' });
    } else if (tipo === 'colaborador') {
      const [convite] = await db
        .select()
        .from(convitesColaborador)
        .where(
          and(
            eq(convitesColaborador.token, token),
            eq(convitesColaborador.status, 'pendente'),
            gt(convitesColaborador.validade, new Date())
          )
        )
        .limit(1);

      if (!convite) {
        return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
      }

      return res.json({ convite, tipo: 'colaborador' });
    }

    res.status(400).json({ error: 'Tipo de convite inválido' });
  } catch (error) {
    console.error('Erro ao buscar convite:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aceitar convite de empresa
router.post('/empresa/aceitar/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const validationResult = z.object({
      senha: z.string().min(8),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Senha inválida', details: validationResult.error.issues });
    }

    const [convite] = await db
      .select()
      .from(convitesEmpresa)
      .where(
        and(
          eq(convitesEmpresa.token, token),
          eq(convitesEmpresa.status, 'pendente'),
          gt(convitesEmpresa.validade, new Date())
        )
      )
      .limit(1);

    if (!convite) {
      return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
    }

    const hashedPassword = await hashPassword(validationResult.data.senha);

    const dataExpiracao = convite.diasAcesso 
      ? (() => {
          const data = new Date();
          data.setDate(data.getDate() + convite.diasAcesso);
          return data;
        })()
      : null;

    const [novaEmpresa] = await db
      .insert(empresas)
      .values({
        nomeEmpresa: convite.nomeEmpresa,
        emailContato: convite.emailContato,
        senha: hashedPassword,
        cnpj: convite.cnpj || null,
        numeroColaboradores: convite.numeroColaboradores || null,
        diasAcesso: convite.diasAcesso || null,
        dataExpiracao: dataExpiracao,
        adminId: convite.adminId,
        ativa: true,
      })
      .returning();

    await db
      .update(convitesEmpresa)
      .set({ status: 'aceito' })
      .where(eq(convitesEmpresa.id, convite.id));

    console.log(`✅ Empresa criada com acesso até: ${dataExpiracao ? dataExpiracao.toLocaleDateString('pt-BR') : 'ilimitado'}`);

    res.status(201).json({
      message: 'Empresa cadastrada com sucesso',
      empresa: {
        id: novaEmpresa.id,
        nome: novaEmpresa.nomeEmpresa,
        email: novaEmpresa.emailContato,
        dataExpiracao: novaEmpresa.dataExpiracao,
      },
    });
  } catch (error) {
    console.error('Erro ao aceitar convite empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aceitar convite de colaborador
router.post('/colaborador/aceitar/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const validationResult = z.object({
      senha: z.string().min(8),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Senha inválida', details: validationResult.error.issues });
    }

    const [convite] = await db
      .select()
      .from(convitesColaborador)
      .where(
        and(
          eq(convitesColaborador.token, token),
          eq(convitesColaborador.status, 'pendente'),
          gt(convitesColaborador.validade, new Date())
        )
      )
      .limit(1);

    if (!convite) {
      return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
    }

    const hashedPassword = await hashPassword(validationResult.data.senha);

    const [novoColaborador] = await db
      .insert(colaboradores)
      .values({
        nome: convite.nome,
        email: convite.email,
        senha: hashedPassword,
        cargo: convite.cargo,
        departamento: convite.departamento,
        empresaId: convite.empresaId,
      })
      .returning();

    // Seeding: Criar registros de disponibilidade de cursos (bloqueados por padrão)
    if (convite.empresaId) {
      try {
        const { cursos } = await import('../../src/data/cursosData');
        const { cursoDisponibilidade } = await import('../../shared/schema');
        
        const cursosDisponibilidadeData = cursos.map(curso => ({
          colaboradorId: novoColaborador.id,
          cursoId: curso.slug,
          empresaId: convite.empresaId!,
          disponivel: false, // Bloqueado por padrão
        }));

        await db
          .insert(cursoDisponibilidade)
          .values(cursosDisponibilidadeData)
          .onConflictDoNothing();

        console.log(`✅ [SEEDING] Criados ${cursosDisponibilidadeData.length} registros de disponibilidade de cursos para colaborador ${novoColaborador.id}`);
      } catch (seedError) {
        console.error('⚠️ [SEEDING] Erro ao criar disponibilidade de cursos:', seedError);
        // Não falhar a criação do colaborador se o seeding falhar
      }
    }

    await db
      .update(convitesColaborador)
      .set({ status: 'aceito' })
      .where(eq(convitesColaborador.id, convite.id));

    res.status(201).json({
      message: 'Colaborador cadastrado com sucesso',
      colaborador: {
        id: novoColaborador.id,
        nome: novoColaborador.nome,
        email: novoColaborador.email,
      },
    });
  } catch (error) {
    console.error('Erro ao aceitar convite colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar convites (admin vê TODOS de empresa, empresa vê seus de colaborador)
router.get('/listar', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role === 'admin') {
      // Admin vê TODOS os convites de empresa, não apenas os que ele criou
      const convitesEmpresas = await db
        .select()
        .from(convitesEmpresa)
        .orderBy(convitesEmpresa.createdAt);

      return res.json({ success: true, convites: convitesEmpresas, tipo: 'empresa' });
    } else if (req.user!.role === 'empresa') {
      const convitesColaboradores = await db
        .select()
        .from(convitesColaborador)
        .where(eq(convitesColaborador.empresaId, req.user!.empresaId!))
        .orderBy(convitesColaborador.createdAt);

      return res.json({ success: true, convites: convitesColaboradores, tipo: 'colaborador' });
    }

    res.status(403).json({ error: 'Sem permissão' });
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar/Excluir convite de colaborador
router.delete('/colaborador/:token', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;

    // Verificar se o convite existe e pertence à empresa
    const [convite] = await db
      .select()
      .from(convitesColaborador)
      .where(
        and(
          eq(convitesColaborador.token, token),
          eq(convitesColaborador.empresaId, req.user!.empresaId!)
        )
      )
      .limit(1);

    if (!convite) {
      return res.status(404).json({ error: 'Convite não encontrado ou você não tem permissão' });
    }

    // Atualizar status para cancelado
    await db
      .update(convitesColaborador)
      .set({ status: 'cancelado' })
      .where(eq(convitesColaborador.id, convite.id));

    res.json({ 
      success: true, 
      message: 'Convite cancelado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao cancelar convite colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancelar/Excluir convite de empresa
router.delete('/empresa/:token', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;

    // Verificar se o convite existe e pertence ao admin
    const [convite] = await db
      .select()
      .from(convitesEmpresa)
      .where(
        and(
          eq(convitesEmpresa.token, token),
          eq(convitesEmpresa.adminId, req.user!.userId)
        )
      )
      .limit(1);

    if (!convite) {
      return res.status(404).json({ error: 'Convite não encontrado ou você não tem permissão' });
    }

    // Atualizar status para cancelado
    await db
      .update(convitesEmpresa)
      .set({ status: 'cancelado' })
      .where(eq(convitesEmpresa.id, convite.id));

    res.json({ 
      success: true, 
      message: 'Convite cancelado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao cancelar convite empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
