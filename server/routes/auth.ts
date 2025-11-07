import express from 'express';
import { db } from '../db';
import { admins, empresas, colaboradores, insertAdminSchema } from '../../shared/schema';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

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

    let user;
    let role: 'admin' | 'empresa' | 'colaborador';
    let empresaId: string | undefined;
    let colaboradorId: string | undefined;

    const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (admin) {
      const validPassword = await comparePassword(password, admin.senha);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      user = admin;
      role = 'admin';
    } else {
      const [empresa] = await db.select().from(empresas).where(eq(empresas.emailContato, email)).limit(1);
      if (empresa) {
        const validPassword = await comparePassword(password, empresa.senha);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        user = empresa;
        role = 'empresa';
        empresaId = empresa.id;
      } else {
        const [colaborador] = await db.select().from(colaboradores).where(eq(colaboradores.email, email)).limit(1);
        if (colaborador) {
          const validPassword = await comparePassword(password, colaborador.senha);
          if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          user = colaborador;
          role = 'colaborador';
          empresaId = colaborador.empresaId || undefined;
          colaboradorId = colaborador.id;
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email || (user as any).emailContato,
      role,
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
    console.error('❌ [AUTH/LOGIN] Erro interno durante login', {
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

    const [newAdmin] = await db
      .insert(admins)
      .values({
        email,
        nome,
        senha: hashedPassword,
      })
      .returning();

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
    console.error('Registration error:', error);
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
      console.log(`Solicitação de recuperação de senha para: ${email}`);
    }

    res.json({ 
      message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.' 
    });
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

export default router;
