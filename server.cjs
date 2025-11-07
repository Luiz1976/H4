// ================================================
// HUMANIQ AI - SIMPLE BACKEND SERVER (RENDER.COM)
// ================================================
// Servidor backend simplificado para deploy no Render.com
// ================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Carregar variáveis de ambiente
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configurar CORS
const corsOptions = {
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://trae9eoscz2t.vercel.app',
    'https://www.humaniqai.com.br',
    'https://humaniqai.com.br',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      baseSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'server', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'server', path: '/api/health', timestamp: new Date().toISOString() });
});

// Catch-all para endpoints inexistentes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'This is the HumaniQ Backend API. Frontend is served separately.',
    availableEndpoints: ['/health', '/api/health']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HumaniQ Backend iniciado com sucesso!`);
  console.log(`📍 Servidor rodando em: http://0.0.0.0:${PORT}`);
  console.log(`📊 Ambiente: ${NODE_ENV}`);
  console.log(`🗄️ Banco de dados: PostgreSQL (Neon)`);
  console.log(`🔒 CORS configurado para: ${corsOptions.origin.join(', ')}`);
  console.log(`⚡ Rate limiting: 100 req/15min por IP`);
});

module.exports = app;