// Servidor mínimo para Render (CommonJS)
// Dependências: express, cors, dotenv

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Permitir Vercel Preview explicitamente
const allowedOrigins = [
  CORS_ORIGIN,
  'https://trae9eoscz2t.vercel.app'
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Log simples
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoints essenciais
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'render-minimal', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'render-minimal', path: '/api/health', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.status(200).send('OK');
});

// Middleware de erro básico
app.use((err, _req, res, _next) => {
  console.error('Erro inesperado:', err);
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
  console.log(`Servidor mínimo (Render) ouvindo em http://localhost:${PORT}`);
  console.log(`CORS_ORIGIN permitido:`, allowedOrigins);
});