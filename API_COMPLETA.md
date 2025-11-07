# 🚀 API Completa do HumaniQ

## 📋 Todos os Endpoints Disponíveis

### 🔐 Autenticação (`/api/auth`)

#### Login Multi-função
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```
**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário",
    "role": "admin|empresa|colaborador",
    "empresaId": "uuid (se aplicável)"
  }
}
```

#### Registrar Admin
```http
POST /api/auth/register/admin
Content-Type: application/json

{
  "email": "admin@humaniq.com",
  "nome": "Administrador Principal",
  "senha": "SenhaSegura123!"
}
```

---

### 📨 Convites (`/api/convites`)

#### Criar Convite para Empresa (Admin)
```http
POST /api/convites/empresa
Authorization: Bearer {token}
Content-Type: application/json

{
  "nomeEmpresa": "Empresa XYZ",
  "emailContato": "contato@empresa.com",
  "diasValidade": 7
}
```
**Resposta:**
```json
{
  "convite": {...},
  "linkConvite": "http://localhost:5000/convite/empresa/TOKEN123"
}
```

#### Criar Convite para Colaborador (Empresa)
```http
POST /api/convites/colaborador
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "cargo": "Desenvolvedor",
  "departamento": "TI",
  "diasValidade": 3
}
```

#### Buscar Convite por Token (Público)
```http
GET /api/convites/token/{TOKEN}?tipo=empresa
GET /api/convites/token/{TOKEN}?tipo=colaborador
```

#### Aceitar Convite de Empresa
```http
POST /api/convites/empresa/aceitar/{TOKEN}
Content-Type: application/json

{
  "senha": "SenhaSegura123!"
}
```

#### Aceitar Convite de Colaborador
```http
POST /api/convites/colaborador/aceitar/{TOKEN}
Content-Type: application/json

{
  "senha": "SenhaSegura123!"
}
```

#### Listar Convites
```http
GET /api/convites/listar
Authorization: Bearer {token}
```
- Admin: vê convites de empresas que criou
- Empresa: vê convites de colaboradores que criou

---

### 🏢 Empresas (`/api/empresas`)

#### Obter Dados da Própria Empresa
```http
GET /api/empresas/me
Authorization: Bearer {token}
```

#### Listar Colaboradores da Empresa
```http
GET /api/empresas/colaboradores
Authorization: Bearer {token}
```
**Resposta:**
```json
{
  "colaboradores": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "cargo": "Desenvolvedor",
      "departamento": "TI",
      "ativo": true,
      "createdAt": "2025-10-18T..."
    }
  ],
  "total": 1
}
```

#### Listar Todas as Empresas (Admin)
```http
GET /api/empresas/todas
Authorization: Bearer {token}
```

#### Atualizar Configurações da Empresa
```http
PATCH /api/empresas/configuracoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "configuracoes": {
    "notificacoes": true,
    "limiteColaboradores": 100
  }
}
```

---

### 🧠 Testes Psicológicos (`/api/testes`)

#### Listar Todos os Testes (Público)
```http
GET /api/testes
```
**Resposta:**
```json
{
  "testes": [
    {
      "id": "uuid",
      "nome": "QVT - Qualidade de Vida no Trabalho",
      "descricao": "Avaliação da qualidade de vida...",
      "categoria": "Bem-estar",
      "tempoEstimado": 25,
      "ativo": true
    }
  ]
}
```

#### Obter Detalhes de um Teste
```http
GET /api/testes/{id}
```

#### Obter Perguntas de um Teste
```http
GET /api/testes/{id}/perguntas
```
**Resposta:**
```json
{
  "perguntas": [
    {
      "id": "uuid",
      "texto": "Como você avalia...",
      "tipo": "likert_5",
      "ordem": 1,
      "obrigatoria": true
    }
  ],
  "total": 50
}
```

#### Submeter Resultado de Teste
```http
POST /api/testes/resultado
Authorization: Bearer {token}
Content-Type: application/json

{
  "testeId": "uuid",
  "respostas": [
    {
      "perguntaId": "uuid",
      "valor": "4",
      "pontuacao": 4
    }
  ],
  "tempoGasto": 1200,
  "sessionId": "session123"
}
```

#### Obter Meus Resultados
```http
GET /api/testes/resultados/meus
Authorization: Bearer {token}
```

#### Obter Detalhes de um Resultado
```http
GET /api/testes/resultado/{id}
Authorization: Bearer {token}
```

---

### ❤️ Health Check

```http
GET /health
```
**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T22:00:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 🔑 Autenticação

Todas as rotas protegidas requerem header de autorização:
```
Authorization: Bearer {seu_token_jwt}
```

### Níveis de Permissão

| Endpoint | Admin | Empresa | Colaborador |
|----------|-------|---------|-------------|
| POST /api/convites/empresa | ✅ | ❌ | ❌ |
| POST /api/convites/colaborador | ❌ | ✅ | ❌ |
| GET /api/empresas/todas | ✅ | ❌ | ❌ |
| GET /api/empresas/me | ❌ | ✅ | ❌ |
| POST /api/testes/resultado | ✅ | ✅ | ✅ |

---

## 🎯 Fluxo de Uso Completo

### 1️⃣ Setup Inicial
```bash
# 1. Criar primeiro admin
POST /api/auth/register/admin

# 2. Fazer login como admin
POST /api/auth/login
```

### 2️⃣ Admin cria Empresa
```bash
# 1. Admin cria convite para empresa
POST /api/convites/empresa

# 2. Empresa acessa link e aceita convite
POST /api/convites/empresa/aceitar/{token}

# 3. Empresa faz login
POST /api/auth/login
```

### 3️⃣ Empresa cria Colaboradores
```bash
# 1. Empresa cria convite para colaborador
POST /api/convites/colaborador

# 2. Colaborador acessa link e aceita
POST /api/convites/colaborador/aceitar/{token}

# 3. Colaborador faz login
POST /api/auth/login
```

### 4️⃣ Colaborador faz Teste
```bash
# 1. Listar testes disponíveis
GET /api/testes

# 2. Ver perguntas do teste
GET /api/testes/{id}/perguntas

# 3. Submeter respostas
POST /api/testes/resultado

# 4. Ver resultados
GET /api/testes/resultados/meus
```

---

## 🚀 Como Testar

### Usar cURL
```bash
# Health check
curl http://localhost:3001/health

# Criar admin
curl -X POST http://localhost:3001/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@humaniq.com",
    "nome": "Admin",
    "senha": "Senha123!"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@humaniq.com",
    "password": "Senha123!"
  }'
```

### Usar Postman/Insomnia
1. Importe os endpoints acima
2. Configure variável de ambiente `{{token}}`
3. Teste o fluxo completo

---

## 📊 Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (email já existe) |
| 500 | Erro do servidor |

---

**API Completa e Funcional! 🎉**
