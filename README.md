# 🧠 HumaniQ - Plataforma de Avaliação Psicológica

> Sistema hierárquico de gestão e aplicação de testes psicológicos no ambiente de trabalho

## 📋 Sobre o Projeto

HumaniQ é uma plataforma completa para avaliação psicológica no ambiente corporativo, permitindo que administradores criem empresas, empresas gerenciem colaboradores, e colaboradores realizem testes psicológicos validados

### 🎯 Funcionalidades Principais

- **Sistema Hierárquico**: Admin → Empresa → Colaborador
- **7 Testes Psicológicos**: QVT, RPO, Clima, Estresse, Karasek-Siegrist, PAS, MGRP
- **Gestão de Convites**: Sistema de tokens para onboarding seguro
- **Autenticação Segura**: JWT + bcrypt
- **API RESTful**: Express + TypeScript + PostgreSQL

---

## 🚀 Como Iniciar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz:
```env
DATABASE_URL=sua_connection_string_postgresql
JWT_SECRET=seu_secret_super_seguro_aqui
PORT=3001
CORS_ORIGIN=http://localhost:5000
```

### 3. Criar Tabelas no Banco
```bash
npm run db:push
```

### 4. Iniciar Aplicação
```bash
# Backend (API)
npm run server

# Frontend
npm run dev
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001

---

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register/admin` - Criar administrador
- `POST /api/auth/login` - Login multi-função

### Sistema de Convites
- `POST /api/convites/empresa` - Criar convite para empresa (Admin)
- `POST /api/convites/colaborador` - Criar convite para colaborador (Empresa)
- `GET /api/convites/token/:token` - Buscar convite
- `POST /api/convites/empresa/aceitar/:token` - Aceitar convite empresa
- `POST /api/convites/colaborador/aceitar/:token` - Aceitar convite colaborador
- `GET /api/convites/listar` - Listar convites

### Empresas
- `GET /api/empresas/me` - Dados da própria empresa
- `GET /api/empresas/colaboradores` - Listar colaboradores
- `GET /api/empresas/todas` - Listar todas (Admin)
- `PATCH /api/empresas/configuracoes` - Atualizar configurações

### Testes Psicológicos
- `GET /api/testes` - Listar testes disponíveis
- `GET /api/testes/:id` - Detalhes do teste
- `GET /api/testes/:id/perguntas` - Perguntas do teste
- `POST /api/testes/resultado` - Submeter resultado
- `GET /api/testes/resultados/meus` - Meus resultados

Documentação completa: `API_COMPLETA.md`

---

## 🗄️ Banco de Dados

### Tabelas
1. `admins` - Administradores do sistema
2. `empresas` - Empresas cadastradas
3. `colaboradores` - Funcionários
4. `convites_empresa` - Convites para empresas
5. `convites_colaborador` - Convites para colaboradores
6. `testes` - Testes psicológicos disponíveis
7. `perguntas` - Perguntas dos testes
8. `respostas` - Respostas dos usuários
9. `resultados` - Resultados finalizados

### Tecnologias
- **Banco**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Validação**: Zod

---

## 🔐 Segurança

- **Senhas**: Hash bcrypt (10 rounds)
- **Tokens**: JWT com expiração de 7 dias
- **Validação**: Zod schemas para todos os endpoints
- **CORS**: Configurado para ambiente específico
- **Secrets**: Gerenciados via variáveis de ambiente

---

## 📂 Estrutura do Projeto

```
HumaniQ/
├── server/              # Backend API
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Middlewares (auth)
│   └── utils/           # Utilitários
├── shared/              # Código compartilhado
│   └── schema.ts        # Schema Drizzle + Zod
├── db/                  # Configuração banco
├── client/              # Frontend React
│   └── src/
│       ├── components/  # Componentes UI
│       ├── pages/       # Páginas
│       └── services/    # Serviços API
└── docs/                # Documentação
```

---

## 🎯 Fluxo de Uso

### 1. Setup Inicial
```bash
# Criar primeiro admin
curl -X POST http://localhost:3001/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@humaniq.com",
    "nome": "Administrador",
    "senha": "SenhaSegura123!"
  }'
```

### 2. Admin Convida Empresa
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@humaniq.com","password":"SenhaSegura123!"}'

# Criar convite (use o token retornado)
curl -X POST http://localhost:3001/api/convites/empresa \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeEmpresa": "TechCorp",
    "emailContato": "contato@techcorp.com",
    "diasValidade": 7
  }'
```

### 3. Empresa Aceita e Convida Colaboradores
```bash
# Empresa aceita convite
curl -X POST http://localhost:3001/api/convites/empresa/aceitar/TOKEN_DO_CONVITE \
  -H "Content-Type: application/json" \
  -d '{"senha":"SenhaEmpresa123!"}'

# Empresa faz login e cria convites para colaboradores
```

### 4. Colaborador Faz Testes
```bash
# Colaborador aceita convite, faz login e realiza testes psicológicos
```

---

## 🧪 Testes Psicológicos

1. **QVT** - Qualidade de Vida no Trabalho
2. **RPO** - Riscos Psicossociais Ocupacionais
3. **Clima e Bem-Estar**
4. **Estresse Ocupacional**
5. **Karasek-Siegrist** - Demanda-Controle-Suporte
6. **PAS** - Percepção de Assédio Sexual
7. **MGRP** - Modelo de Gestão de Riscos Psicossociais

---

## 📖 Documentação Adicional

- `API_COMPLETA.md` - Documentação completa da API
- `STATUS_DO_PROJETO.md` - Status do projeto
- `MIGRATION_STATUS.md` - Relatório da migração
- `RESUMO_COMPLETO.md` - Resumo técnico

---

## 🛠️ Stack Tecnológica

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (Neon)
- Drizzle ORM
- Zod (validação)
- JWT + bcrypt

### Frontend
- React 18
- Vite
- Shadcn/UI
- Tailwind CSS
- TanStack Query
- Wouter (routing)

---

## 📝 Scripts Disponíveis

```bash
npm run dev           # Inicia frontend (Vite)
npm run server        # Inicia backend (Express)
npm run db:push       # Sincroniza schema com banco
npm run db:generate   # Gera migrations
npm run build         # Build para produção
```

---

## 🔄 Status da Migração

| Componente | Status |
|------------|--------|
| Banco de Dados | ✅ 100% |
| API Backend | ✅ 100% |
| Autenticação | ✅ 100% |
| Sistema de Convites | ✅ 100% |
| Frontend | ⏳ 30% |
| Integração | ⏳ 0% |

**Progresso Total: 80%**

---

## 👥 Contribuindo

Este é um projeto interno da HumaniQ. Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

## 📄 Licença

Propriedade da HumaniQ © 2025

---

**Desenvolvido com ❤️ pela equipe HumaniQ**
