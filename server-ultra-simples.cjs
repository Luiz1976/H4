// Servidor ultra-simples em CommonJS para diagnóstico
// Dependências: express, cors, dotenv

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middlewares básicos
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Log simples de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoints mínimos
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ultra-simple', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ultra-simple', path: '/api/health', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Tratamento de erros básico
app.use((err, req, res, next) => {
  console.error('Erro inesperado:', err);
  res.status(500).json({ error: 'internal_error', message: 'Algo deu errado.' });
});

// Robustez mínima para erros não capturados
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.listen(PORT, () => {
  console.log(`Ultra-simple server ouvindo em http://localhost:${PORT}`);
  console.log(`CORS_ORIGIN permitido: ${CORS_ORIGIN}`);
});