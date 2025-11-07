const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

// Dados temporários em memória (para teste)
const users = [
  {
    id: '1',
    email: 'admin@humaniq.com',
    nome: 'Administrador',
    senha: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin'
  },
  {
    id: '2',
    email: 'empresa@test.com',
    nome: 'Empresa Teste',
    senha: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'empresa'
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HumaniQ Backend está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Tentativa de login:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    // Buscar usuário
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.senha);
    if (!validPassword) {
      console.log('❌ Senha inválida para:', email);
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }
    
    // Gerar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      'seu_secret_super_seguro_aqui_desenvolvimento_local',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login bem-sucedido:', email);
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  jwt.verify(token, 'seu_secret_super_seguro_aqui_desenvolvimento_local', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Endpoint protegido de teste
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Listar testes (mock)
app.get('/api/testes', authenticateToken, (req, res) => {
  const testes = [
    {
      id: '1',
      nome: 'QVT - Qualidade de Vida no Trabalho',
      descricao: 'Avaliação da qualidade de vida no ambiente de trabalho',
      categoria: 'Bem-estar',
      tempoEstimado: 15
    },
    {
      id: '2',
      nome: 'Estresse Ocupacional',
      descricao: 'Medição dos níveis de estresse relacionados ao trabalho',
      categoria: 'Saúde Mental',
      tempoEstimado: 20
    }
  ];
  
  res.json({ testes });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HumaniQ Backend rodando em http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`✅ CORS configurado para: http://localhost:5000`);
  console.log(`📊 Usuários de teste disponíveis:`);
  console.log(`   - admin@humaniq.com / password`);
  console.log(`   - empresa@test.com / password`);
});