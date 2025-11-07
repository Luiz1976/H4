import express from 'express';
import { db } from '../../db';
import { convitesEmpresa, convitesColaborador, empresas, colaboradores, insertConviteEmpresaSchema, insertConviteColaboradorSchema, insertEmpresaSchema, insertColaboradorSchema } from '../../shared/schema';
import { hashPassword, generateInviteToken } from '../utils/auth';
import { authenticateToken, requireAdmin, requireEmpresa, AuthRequest } from '../middleware/auth';
import { eq, and, gt, sql } from 'drizzle-orm';
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
      return res.status(400).json({ success: false, error: 'Dados inválidos', message: 'Os dados fornecidos são inválidos', details: validationResult.error.issues });
    }

    const { nomeEmpresa, emailContato, cnpj, numeroColaboradores, diasAcesso, diasValidade, ...rest } = validationResult.data;

    const [existingEmpresa] = await db.select().from(empresas).where(eq(empresas.emailContato, emailContato)).limit(1);
    if (existingEmpresa) {
      return res.status(409).json({ success: false, error: 'Email já cadastrado', message: 'Este email já está em uso' });
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
      success: true,
      message: 'Convite criado com sucesso',
      data: {
        ...convite,
        linkConvite,
        emailEnviado: true,
      }
    });
  } catch (error) {
    console.error('Erro ao criar convite empresa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o convite'
    });
  }
});

// Empresa cria convite para colaborador
router.post('/colaborador', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const validationResult = insertConviteColaboradorSchema.omit({ token: true, validade: true, empresaId: true }).extend({
      diasValidade: z.number().min(1).max(30).default(3),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ success: false, error: 'Dados inválidos', message: 'Os dados fornecidos são inválidos', details: validationResult.error.issues });
    }

    const { nome, email, diasValidade, ...rest } = validationResult.data;

    const [existingColaborador] = await db.select().from(colaboradores).where(eq(colaboradores.email, email)).limit(1);
    if (existingColaborador) {
      return res.status(409).json({ success: false, error: 'Email já cadastrado', message: 'Este email já está em uso' });
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
        return res.status(404).json({ success: false, error: 'Convite não encontrado ou expirado', message: 'O convite não existe ou já expirou' });
      }

      return res.json({ success: true, data: convite, tipo: 'empresa' });
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
        return res.status(404).json({ success: false, error: 'Convite não encontrado ou expirado', message: 'O convite não existe ou já expirou' });
      }

      return res.json({ success: true, data: convite, tipo: 'colaborador' });
    }

    res.status(400).json({ success: false, error: 'Tipo de convite inválido', message: 'Tipo deve ser empresa ou colaborador' });
  } catch (error) {
    console.error('Erro ao buscar convite:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor', message: 'Erro ao buscar convite' });
  }
});

// Aceitar convite de empresa
router.post('/empresa/aceitar/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log('📨 [DEBUG] Aceitando convite de empresa - Token:', token);
    console.log('📨 [DEBUG] Body recebido:', req.body);
    
    const validationResult = z.object({
      email: z.string().email('Email inválido'),
      senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    }).safeParse(req.body);

    if (!validationResult.success) {
      console.log('❌ [DEBUG] Validação falhou:', validationResult.error.issues);
      return res.status(400).json({ success: false, error: 'Dados inválidos', message: 'Os dados fornecidos são inválidos', details: validationResult.error.issues });
    }
    
    console.log('✅ [DEBUG] Validação passou - Email:', validationResult.data.email);

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
      return res.status(404).json({ success: false, error: 'Convite não encontrado ou expirado', message: 'O convite não existe ou já expirou' });
    }

    const hashedPassword = await hashPassword(validationResult.data.senha);

    const dataExpiracao = convite.diasAcesso 
      ? (() => {
          const data = new Date();
          data.setDate(data.getDate() + convite.diasAcesso);
          return data;
        })()
      : null;

    // Verificar se o email já está em uso
    const [empresaExistente] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.emailContato, validationResult.data.email))
      .limit(1);

    if (empresaExistente) {
      return res.status(400).json({ 
        success: false,
        error: 'Email já cadastrado', 
        message: 'Este email já está sendo usado por outra empresa. Por favor, use um email diferente.' 
      });
    }

    const [novaEmpresa] = await db
      .insert(empresas)
      .values({
        nomeEmpresa: convite.nomeEmpresa,
        emailContato: validationResult.data.email,
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
      success: true,
      message: 'Empresa cadastrada com sucesso',
      data: {
        empresa: {
          id: novaEmpresa.id,
          nome: novaEmpresa.nomeEmpresa,
          email: novaEmpresa.emailContato,
          dataExpiracao: novaEmpresa.dataExpiracao,
        }
      },
    });
  } catch (error: any) {
    console.error('Erro ao aceitar convite empresa:', error);
    
    // Verificar se é erro de duplicação de email
    if (error?.code === '23505' || error?.cause?.code === '23505') {
      console.warn('⚠️ Tentativa de cadastro com email duplicado');
      return res.status(400).json({ 
        success: false,
        error: 'Email já cadastrado', 
        message: 'Este email já está sendo usado por outra empresa. Por favor, use um email diferente.' 
      });
    }
    
    res.status(500).json({ success: false, error: 'Erro interno do servidor', message: 'Erro ao aceitar convite' });
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
      return res.status(400).json({ success: false, error: 'Senha inválida', message: 'A senha fornecida é inválida', details: validationResult.error.issues });
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
      return res.status(404).json({ success: false, error: 'Convite não encontrado ou expirado', message: 'O convite não existe ou já expirou' });
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
      success: true,
      message: 'Colaborador cadastrado com sucesso',
      data: {
        colaborador: {
          id: novoColaborador.id,
          nome: novoColaborador.nome,
          email: novoColaborador.email,
        }
      },
    });
  } catch (error) {
    console.error('Erro ao aceitar convite colaborador:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor', message: 'Erro ao aceitar convite de colaborador' });
  }
});

// Listar convites (admin vê TODOS de empresa, empresa vê seus de colaborador)
router.get('/listar', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role === 'admin') {
      // Admin vê TODOS os convites de empresa, exceto os cancelados
      const convitesEmpresas = await db
        .select()
        .from(convitesEmpresa)
        .where(sql`${convitesEmpresa.status} != 'cancelado'`)
        .orderBy(convitesEmpresa.createdAt);

      return res.json({ success: true, data: { convites: convitesEmpresas, tipo: 'empresa' } });
    } else if (req.user!.role === 'empresa') {
      // Empresa vê seus convites de colaborador, exceto os cancelados
      const convitesColaboradores = await db
        .select()
        .from(convitesColaborador)
        .where(
          and(
            eq(convitesColaborador.empresaId, req.user!.empresaId!),
            sql`${convitesColaborador.status} != 'cancelado'`
          )
        )
        .orderBy(convitesColaborador.createdAt);

      return res.json({ success: true, data: { convites: convitesColaboradores, tipo: 'colaborador' } });
    }

    res.status(403).json({ success: false, error: 'Sem permissão', message: 'Você não tem permissão para acessar este recurso' });
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor', message: 'Erro ao listar convites' });
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
      return res.status(404).json({ success: false, error: 'Convite não encontrado ou você não tem permissão', message: 'O convite não existe ou você não tem permissão para excluí-lo' });
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
    res.status(500).json({ success: false, error: 'Erro interno do servidor', message: 'Erro ao cancelar convite' });
  }
});

// Cancelar/Excluir convite de empresa
router.delete('/empresa/:token', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;

    // Verificar se o convite existe (admin pode excluir qualquer convite)
    const [convite] = await db
      .select()
      .from(convitesEmpresa)
      .where(eq(convitesEmpresa.token, token))
      .limit(1);

    if (!convite) {
      return res.status(404).json({ 
        success: false,
        error: 'Convite não encontrado' 
      });
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
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;
