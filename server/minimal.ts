import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  console.log('Health check recebido:', new Date().toISOString());
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV 
  });
});

app.get('/', (req, res) => {
  console.log('Root request recebido:', new Date().toISOString());
  res.json({ message: 'Servidor mínimo funcionando!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor mínimo rodando na porta ${PORT}`);
  console.log(`📍 Endereço: http://0.0.0.0:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});