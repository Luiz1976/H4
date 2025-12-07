import express from 'express';
import { db } from '../db-config';
import logger from '../utils/logger';
import { admins, empresas, colaboradores, insertAdminSchema, insertEmpresaSchema } from '../../shared/schema';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const router = express.Router();

// Middleware para verificar token JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const { verifyToken } = require('../utils/auth');
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('❌ [AUTH] Token inválido', { error });
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Endpoint para verificar se o usuário está autenticado
router.get('/check', authenticateToken, (req: any, res: any) => {
  res.json({
    authenticated: true,
    user: req.user
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', async (req, res) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: validationResult.error.issues });
    }

    const { email, password } = validationResult.data;
    const emailTrimmed = email.trim().toLowerCase();

    logger.info(`🔐 [AUTH/LOGIN] Tentativa de login para: ${emailTrimmed}`);

    let user;
    let role: 'admin' | 'empresa' | 'colaborador';
    let empresaId: string | undefined;
    let colaboradorId: string | undefined;

    // Check empresa
    const [empresa] = await db.select().from(empresas).where(sql`lower(${empresas.emailContato}) = ${emailTrimmed}`);
    if (empresa) {
      const validPasswordEmpresa = await comparePassword(password, (empresa as any).senha);
      if (validPasswordEmpresa) {
        user = empresa;
        role = 'empresa';
        empresaId = (empresa as any).id;
        logger.info(`✅ [AUTH/LOGIN] Empresa encontrada e senha válida: ${emailTrimmed}`);
      } else {
        logger.warn(`⚠️ [AUTH/LOGIN] Empresa encontrada mas SENHA INVÁLIDA: ${emailTrimmed}`);
      }
    }

    // Check colaborador if not found as empresa
    if (!user) {
      const [colaborador] = await db.select().from(colaboradores).where(sql`lower(${colaboradores.email}) = ${emailTrimmed}`);
      if (colaborador) {
        const validPasswordColab = await comparePassword(password, (colaborador as any).senha);
        if (validPasswordColab) {
          user = colaborador;
          role = 'colaborador';
          empresaId = (colaborador as any).empresaId || undefined;
          colaboradorId = (colaborador as any).id;
          logger.info(`✅ [AUTH/LOGIN] Colaborador encontrado e senha válida: ${emailTrimmed}`);
        } else {
          logger.warn(`⚠️ [AUTH/LOGIN] Colaborador encontrado mas SENHA INVÁLIDA: ${emailTrimmed}`);
        }
      }
    }

    // Check admin if not found elsewhere
    if (!user) {
      const [admin] = await db.select().from(admins).where(sql`lower(${admins.email}) = ${emailTrimmed}`);
      if (admin) {
        const validPasswordAdmin = await comparePassword(password, (admin as any).senha);
        if (validPasswordAdmin) {
          user = admin;
          role = 'admin';
          logger.info(`✅ [AUTH/LOGIN] Admin encontrado e senha válida: ${emailTrimmed}`);
        } else {
          logger.warn(`⚠️ [AUTH/LOGIN] Admin encontrado mas SENHA INVÁLIDA: ${emailTrimmed}`);
        }
      }
    }

    if (!user) {
      logger.warn(`❌ [AUTH/LOGIN] Usuário não encontrado ou credenciais inválidas para: ${emailTrimmed}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email || (user as any).emailContato,
      role: role!,
      empresaId,
      colaboradorId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email || (user as any).emailContato,
        nome: user.nome || (user as any).nomeEmpresa,
        role,
        empresaId,
        avatar: (user as any).avatar,
        cargo: (user as any).cargo,
        departamento: (user as any).departamento,
      },
    });
  } catch (error: any) {
    logger.error('❌ [AUTH/LOGIN] Erro interno durante login', {
      email: req.body?.email,
      code: error?.code,
      name: error?.name,
      message: error?.message,
      stack: typeof error?.stack === 'string' ? error.stack.split('\n').slice(0, 3).join(' | ') : undefined,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register/admin', async (req, res) => {
  try {
    const validationResult = insertAdminSchema.extend({
      senha: z.string().min(8),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: validationResult.error.issues });
    }

    const { email, nome, senha } = validationResult.data;

    const [existing] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(senha);

    // Inserção compatível com Postgres (UUID default) e SQLite (UUID manual)
    try {
      const isSqlite = process.env.DATABASE_URL ? false : true;
      if (isSqlite) {
        const id = randomUUID();
        await db.insert(admins).values({
          id: id as any,
          email,
          nome,
          senha: hashedPassword,
        });
      } else {
        await db.insert(admins).values({
          email,
          nome,
          senha: hashedPassword,
        });
      }
    } catch (e: any) {
      logger.error('❌ [AUTH/REGISTER] Erro ao inserir admin', {
        code: e?.code,
        name: e?.name,
        message: e?.message,
      });
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Buscar registro recém-criado
    const [newAdmin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (!newAdmin) {
      return res.status(500).json({ error: 'Falha ao criar admin' });
    }

    const token = generateToken({
      userId: newAdmin.id,
      email: newAdmin.email,
      role: 'admin',
    });

    res.status(201).json({
      token,
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        nome: newAdmin.nome,
        role: 'admin',
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    let userExists = false;

    const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (admin) {
      userExists = true;
    } else {
      const [empresa] = await db.select().from(empresas).where(eq(empresas.emailContato, email)).limit(1);
      if (empresa) {
        userExists = true;
      } else {
        const [colaborador] = await db.select().from(colaboradores).where(eq(colaboradores.email, email)).limit(1);
        if (colaborador) {
          userExists = true;
        }
      }
    }

    if (userExists) {
      logger.info(`Solicitação de recuperação de senha para: ${email}`);
    }

    res.json({
      message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.'
    });
  } catch (error) {
    logger.error('Erro ao processar recuperação de senha:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

export default router;

// Registro direto de empresa (compatível com SQLite e Postgres)
// Uso: POST /api/auth/register/empresa { nomeEmpresa, emailContato, senha }
router.post('/register/empresa', async (req, res) => {
  try {
    const validationResult = insertEmpresaSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: validationResult.error.issues });
    }

    const { nomeEmpresa, emailContato, senha, adminId, configuracoes, ativa, cnpj, endereco } = validationResult.data;

    // Verificar se já existe empresa com o email
    try {
      const [existing] = await db.select().from(empresas).where(eq(empresas.emailContato, emailContato)).limit(1);
      if (existing) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    } catch (e) {
      logger.error('❌ [AUTH/REGISTER] Erro ao verificar existência de empresa', e);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const hashedPassword = await hashPassword(senha);
    // Usar default gen_random_uuid() do Postgres

    try {
      await db
        .insert(empresas)
        .values({
          nomeEmpresa,
          emailContato,
          senha: hashedPassword,
          cnpj,
          endereco,
          adminId: (adminId as any) || null,
          configuracoes: (configuracoes as any) || {},
          ativa: typeof ativa === 'boolean' ? ativa : true,
        });
    } catch (e: any) {
      logger.error('❌ [AUTH/REGISTER] Erro ao inserir empresa', {
        code: e?.code,
        name: e?.name,
        message: e?.message,
      });
      return res.status(500).json({ error: 'Internal server error' });
    }

    let novaEmpresa: any;
    try {
      [novaEmpresa] = await db.select().from(empresas).where(eq(empresas.emailContato, emailContato)).limit(1);
    } catch (e) {
      logger.error('❌ [AUTH/REGISTER] Erro ao buscar empresa recém-criada', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!novaEmpresa) {
      return res.status(500).json({ error: 'Falha ao criar empresa' });
    }

    const token = generateToken({
      userId: novaEmpresa.id,
      email: novaEmpresa.emailContato,
      role: 'empresa',
      empresaId: novaEmpresa.id,
    });

    res.status(201).json({
      token,
      user: {
        id: novaEmpresa.id,
        email: novaEmpresa.emailContato,
        nome: novaEmpresa.nomeEmpresa,
        role: 'empresa',
        empresaId: novaEmpresa.id,
      },
    });
  } catch (error) {
    logger.error('Registration error (empresa):', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
