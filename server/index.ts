// Carregar variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv';
dotenv.config();



import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { db } from '../db';
import winston from 'winston';

// Importar rotas
import authRoutes from './routes/auth';
import testesRoutes from './routes/testes';
import empresasRoutes from './routes/empresas';
import colaboradoresRoutes from './routes/colaboradores';
import convitesRoutes from './routes/convites';
import adminRoutes from './routes/admin';
import chatbotRoutes from './routes/chatbot';
import stripeRoutes from './routes/stripe';
import erpRoutes from './routes/erp';
import testeDisponibilidadeRoutes from './routes/teste-disponibilidade';
import cursoDisponibilidadeRoutes from './routes/curso-disponibilidade';
import cursosRoutes from './routes/cursos';
import emailTestRoutes from './routes/email-test';



const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'humaniq-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Configurar CORS (inclui produção)
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      'https://www.humaniqai.com.br',
      'https://humaniqai.com.br',
      'https://h2-8xej.onrender.com',
      // Removido domínio fixo de vercel para lógica dinâmica
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    // Permitir requests sem origin (mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Permitir domínios de preview e produção do Vercel (*.vercel.app)
    try {
      const hostname = new URL(origin).hostname;
      if (hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      // Permitir domínios onrender.com
      if (hostname.endsWith('.onrender.com')) {
        return callback(null, true);
      }
    } catch (_) {}

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS bloqueado para origem: ${origin}`);
      callback(new Error('Não permitido pelo CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT,
    database: 'connected',
    version: '1.0.0',
  });
});

// API Health check endpoint (para compatibilidade com frontend)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT,
    database: 'connected',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HumaniQ AI Backend API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      testes: '/api/testes',
      empresas: '/api/empresas',
      colaboradores: '/api/colaboradores',
      admin: '/api/admin'
    }
  });
});

// Configurar rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/testes', testesRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/convites', convitesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/teste-disponibilidade', testeDisponibilidadeRoutes);
app.use('/api/curso-disponibilidade', cursoDisponibilidadeRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/email-test', emailTestRoutes);

// Middleware para rotas não encontradas (sem wildcard inválido)
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Inicializar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 HumaniQ Backend iniciado com sucesso!`);
  logger.info(`📍 Servidor rodando em: http://0.0.0.0:${PORT}`);
  logger.info(`📊 Ambiente: ${NODE_ENV}`);
  logger.info(`🗄️ Banco de dados: ${process.env.DATABASE_URL ? 'PostgreSQL (Neon)' : 'SQLite (local)'}`);
  logger.info(`🔒 CORS configurado para: ${process.env.CORS_ORIGIN || 'localhost:5000'}`);
  logger.info(`⚡ Rate limiting: 100 req/15min por IP`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor graciosamente...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor graciosamente...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
