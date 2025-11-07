// Servidor standalone mínimo (CommonJS), sem TSX/TypeScript
// Dependências: express, cors, dotenv

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  'http://localhost:5000',
  'https://www.humaniqai.com.br',
  'https://trae9eoscz2t.vercel.app',
  process.env.CORS_ORIGIN || ''
].filter(Boolean);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin === o)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Log simples
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoints de saúde
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'server-standalone', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'server-standalone', path: '/api/health', timestamp: new Date().toISOString() });
});

// Endpoint mínimo de login
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body || {};
  res.status(200).json({ ok: true, token: 'dummy-token', user: { email: email || 'user@example.com' } });
});

app.get('/', (_req, res) => {
  res.status(200).send('OK');
});

// Middleware de erro básico
app.use((err, _req, res, _next) => {
  console.error('Erro inesperado:', err && err.message ? err.message : err);
  res.status(500).json({ error: 'internal_error' });
});

// Robustez mínima
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.listen(PORT, () => {
  console.log(`Servidor standalone ouvindo em http://localhost:${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
});