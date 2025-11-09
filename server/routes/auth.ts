import express from 'express';
import { db } from '../db';
import { admins, empresas, colaboradores, insertAdminSchema, insertEmpresaSchema } from '../../shared/schema';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { eq } from 'drizzle-orm';
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

    // Priorizar EMPRESA sobre ADMIN para evitar confusão quando e-mails coexistem
    const [empresa] = await db.select().from(empresas).where(eq(empresas.emailContato, email)).limit(1);
    if (empresa) {
      const validPassword = await comparePassword(password, empresa.senha);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      user = empresa;
      role = 'empresa';
      empresaId = empresa.id;
      console.log('✅ [AUTH/LOGIN] Role selecionado: empresa', { email, empresaId });
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
        console.log('✅ [AUTH/LOGIN] Role selecionado: colaborador', { email, empresaId, colaboradorId });
      } else {
        const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
        if (admin) {
          const validPassword = await comparePassword(password, admin.senha);
          if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }
          user = admin;
          role = 'admin';
          console.log('✅ [AUTH/LOGIN] Role selecionado: admin', { email });
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

    // Inserção compatível com SQLite: gerar id no Node e usar SQL nativo quando em dev
    const generatedId = randomUUID();
    // Considerar SQLite sempre que não estivermos em produção (independente de DATABASE_URL setada)
    const isSQLite = process.env.NODE_ENV !== 'production';

    try {
      if (isSQLite) {
        console.log('ℹ️ [AUTH/REGISTER] Usando inserção direta SQLite (better-sqlite3)');
        // Inserir via better-sqlite3 para evitar defaults do Postgres (gen_random_uuid)
        const { sqlite } = require('../db-sqlite');
        const stmt = sqlite.prepare('INSERT INTO admins (id, email, nome, senha) VALUES (?, ?, ?, ?)');
        stmt.run(generatedId, email, nome, hashedPassword);
      } else {
        console.log('ℹ️ [AUTH/REGISTER] Usando Drizzle/Postgres para inserção');
        // Postgres em produção via Drizzle
        await db
          .insert(admins)
          .values({
            id: generatedId as any,
            email,
            nome,
            senha: hashedPassword,
          });
      }
    } catch (e: any) {
      console.error('❌ [AUTH/REGISTER] Erro ao inserir admin', {
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

// Registro direto de empresa (compatível com SQLite e Postgres)
// Uso: POST /api/auth/register/empresa { nomeEmpresa, emailContato, senha }
router.post('/register/empresa', async (req, res) => {
  try {
    const validationResult = insertEmpresaSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request', details: validationResult.error.issues });
    }

    const { nomeEmpresa, emailContato, senha, adminId, configuracoes, ativa } = validationResult.data;

    // Verificar se já existe empresa com o email
    try {
      const [existing] = await db.select().from(empresas).where(eq(empresas.emailContato, emailContato)).limit(1);
      if (existing) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    } catch (e) {
      // Fallback SQLite direto
      try {
        const { sqlite } = require('../db-sqlite');
        const countStmt = sqlite.prepare('SELECT COUNT(1) as c FROM empresas WHERE email_contato = ?');
        const exists = countStmt.get(emailContato) as { c: number } | undefined;
        if (exists && exists.c > 0) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      } catch (ee) {
        console.warn('⚠️ Falha ao verificar existência de empresa (SQLite):', (ee as any)?.message);
      }
    }

    const hashedPassword = await hashPassword(senha);
    const generatedId = randomUUID();

    try {
      // Tentar via ORM primeiro
      await db
        .insert(empresas)
        .values({
          id: generatedId as any,
          nomeEmpresa,
          emailContato,
          senha: hashedPassword,
          adminId: (adminId as any) || null,
          configuracoes: (configuracoes as any) || {},
          ativa: typeof ativa === 'boolean' ? ativa : true,
        });
    } catch (e: any) {
      console.warn('⚠️ [AUTH/REGISTER] Falha ORM, tentando SQLite direto...', {
        code: e?.code,
        name: e?.name,
        message: e?.message,
      });
      try {
        const { sqlite } = require('../db-sqlite');
        const stmt = sqlite.prepare(`
          INSERT INTO empresas (id, nome_empresa, email_contato, senha, admin_id, configuracoes, ativa)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          generatedId,
          nomeEmpresa,
          emailContato,
          hashedPassword,
          adminId || null,
          JSON.stringify(configuracoes || {}),
          typeof ativa === 'boolean' ? (ativa ? 1 : 0) : 1
        );
      } catch (ee: any) {
        console.error('❌ [AUTH/REGISTER] Erro ao inserir empresa (SQLite)', {
          code: ee?.code,
          name: ee?.name,
          message: ee?.message,
        });
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    let novaEmpresa: any;
    try {
      [novaEmpresa] = await db.select().from(empresas).where(eq(empresas.emailContato, emailContato)).limit(1);
    } catch (_) {
      const { sqlite } = require('../db-sqlite');
      const getStmt = sqlite.prepare('SELECT * FROM empresas WHERE email_contato = ? LIMIT 1');
      novaEmpresa = getStmt.get(emailContato);
      if (novaEmpresa) {
        // Normalizar campos para resposta
        novaEmpresa.id = novaEmpresa.id;
        (novaEmpresa as any).emailContato = novaEmpresa.email_contato;
        (novaEmpresa as any).nomeEmpresa = novaEmpresa.nome_empresa;
      }
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
    console.error('Registration error (empresa):', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
