// Servidor simples para testar se o Node.js está funcionando
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor temporário funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de login temporária (mock)
app.post('/api/auth/login', (req, res) => {
  console.log('🔄 Tentativa de login recebida:', req.body);
  
  // Mock de resposta de login
  res.json({
    success: true,
    message: 'Login temporário - servidor funcionando!',
    token: 'mock_token_123',
    user: {
      id: '1',
      email: req.body.email,
      nome: 'Usuário Teste',
      role: 'admin'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor temporário rodando em http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`✅ CORS configurado para: http://localhost:5000`);
});