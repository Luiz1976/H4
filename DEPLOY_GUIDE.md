# 🚀 Guia de Deploy e CI/CD - HumaniQ AI

## 📋 Índice

1. [Deploy no Render.com](#deploy-no-rendercom)
2. [Configuração de Secrets](#configuração-de-secrets)
3. [Deploy Manual](#deploy-manual)
4. [CI/CD Automático](#cicd-automático)
5. [Ambientes](#ambientes)
6. [Rollback](#rollback)
7. [Monitoramento](#monitoramento)

---

## 🌐 Deploy no Render.com

### ✅ Configuração Atual (IMPLEMENTADA)

O backend está configurado para deploy no **Render.com** com as seguintes especificações:

#### Arquivo `render.yaml`
```yaml
services:
  - type: web
    name: humaniq-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm run start:prod
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: humaniq-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://trae9eoscz2t.vercel.app
      - key: CORS_ORIGIN
        value: https://trae9eoscz2t.vercel.app
    autoDeploy: true
    
databases:
  - name: humaniq-db
    databaseName: humaniq
    user: humaniq_user
    plan: free
```

#### Passos para Deploy:

1. **Conectar Repositório ao Render:**
   - Acesse [render.com](https://render.com)
   - Conecte sua conta GitHub
   - Selecione o repositório HumaniQ

2. **Configurar Variáveis de Ambiente:**
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `JWT_SECRET`: (gerado automaticamente)
   - `DATABASE_URL`: (conectado ao PostgreSQL)
   - `FRONTEND_URL`: https://trae9eoscz2t.vercel.app
   - `CORS_ORIGIN`: https://trae9eoscz2t.vercel.app

3. **Deploy Automático:**
   - O Render detectará o `render.yaml`
   - Build: `npm install`
   - Start: `npm run start:prod`
   - Health Check: `/health`

#### URLs de Produção:
- **Backend**: `https://humaniq-backend.onrender.com`
- **Frontend**: `https://trae9eoscz2t.vercel.app`
- **Health Check**: `https://humaniq-backend.onrender.com/health`

---

## 🔐 Configuração de Secrets

### GitHub Secrets Necessários

Acesse: `Settings → Secrets and variables → Actions → New repository secret`

#### Secrets Gerais
```
NODE_VERSION=20.x
```

#### Backend (Render.com)
```
RENDER_API_KEY=<render_api_key>
DATABASE_URL_PRODUCTION=<postgresql_connection_string>
```

#### Frontend (Vercel)
```
VERCEL_TOKEN=<vercel_token>
VERCEL_ORG_ID=<organization_id>
VERCEL_PROJECT_ID=<project_id>
VITE_API_URL=https://api.humaniq.ai
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

#### Integrações
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_API_KEY=<gemini_key>
SENDGRID_API_KEY=<sendgrid_key>
```

#### Monitoramento (Opcional)
```
SNYK_TOKEN=<snyk_token>
SLACK_WEBHOOK=<slack_webhook_url>
SENTRY_DSN=<sentry_dsn>
```

---

## 🛠️ Deploy Manual

### Frontend (Vercel)

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy de Staging**
   ```bash
   vercel --env VITE_API_URL=https://api-staging.humaniq.ai
   ```

4. **Deploy de Produção**
   ```bash
   vercel --prod \
     --env VITE_API_URL=https://api.humaniq.ai \
     --env VITE_STRIPE_PUBLIC_KEY=pk_live_...
   ```

### Backend (Railway)

1. **Instalar Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Deploy**
   ```bash
   railway up
   ```

4. **Configurar Variáveis de Ambiente**
   ```bash
   railway variables set DATABASE_URL=<connection_string>
   railway variables set JWT_SECRET=<secret>
   railway variables set STRIPE_SECRET_KEY=<key>
   ```

### Banco de Dados (Neon)

1. **Push Schema**
   ```bash
   npm run db:push
   ```

2. **Verificar Conexão**
   ```bash
   curl https://api.humaniq.ai/health
   ```

---

## 🤖 CI/CD Automático

### Workflow Configurado

O arquivo `.github/workflows/ci-cd.yml` automatiza:

#### On Push to `develop` → Deploy Staging
```
1. Lint & Type Check
2. Run Tests
3. Build Application
4. Security Scan
5. Deploy to Staging (Vercel + Railway)
```

#### On Push to `main` → Deploy Production
```
1. Lint & Type Check
2. Run Tests
3. Build Application
4. Security Scan
5. Deploy to Production (Vercel + Railway)
6. Run Database Migrations
7. Notify Team (Slack)
```

### Branches

- **`main`**: Produção (https://humaniq.ai)
- **`develop`**: Staging (https://staging.humaniq.ai)
- **`feature/*`**: Features em desenvolvimento

### Pull Requests

Ao criar um PR:
- ✅ Lint automático
- ✅ Type checking
- ✅ Testes executados
- ✅ Security scan
- ✅ Preview deploy (Vercel)

---

## 🌍 Ambientes

### Development (Local)
```bash
# Frontend: http://localhost:5000
# Backend: http://localhost:3001
npm run dev
```

### Staging
```bash
# Frontend: https://staging.humaniq.ai
# Backend: https://api-staging.humaniq.ai
# Database: Neon (staging branch)
```

### Production
```bash
# Frontend: https://humaniq.ai
# Backend: https://api.humaniq.ai
# Database: Neon (main branch)
```

---

## ⏪ Rollback

### Vercel (Frontend)

1. **Via Dashboard**
   - Acesse https://vercel.com/dashboard
   - Selecione o projeto
   - Vá para "Deployments"
   - Clique em "Promote to Production" no deploy anterior

2. **Via CLI**
   ```bash
   vercel rollback <deployment-url>
   ```

### Railway (Backend)

1. **Via Dashboard**
   - Acesse https://railway.app
   - Selecione o serviço
   - Vá para "Deployments"
   - Clique em "Redeploy" no deploy anterior

2. **Via CLI**
   ```bash
   railway rollback
   ```

### Database (Neon)

1. **Via Dashboard**
   - Acesse https://neon.tech
   - Selecione o projeto
   - Vá para "Branches"
   - Restaure backup anterior

2. **Via SQL**
   ```bash
   # Criar backup antes de qualquer migration
   npm run db:backup
   
   # Restaurar backup
   npm run db:restore <backup-file>
   ```

---

## 📊 Monitoramento

### Health Checks

```bash
# Backend
curl https://api.humaniq.ai/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2025-10-30T01:31:39.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

### Logs

#### Winston (Backend)
```bash
# Logs em tempo real
railway logs --tail

# Logs de erro
railway logs --filter error

# Download de logs
railway logs > logs.txt
```

#### Vercel (Frontend)
```bash
# Via CLI
vercel logs

# Via Dashboard
https://vercel.com/dashboard → Project → Logs
```

### Métricas

#### Vercel Analytics
- Page views
- Unique visitors
- Web vitals (LCP, FID, CLS)
- Geography

#### Railway Metrics
- CPU usage
- Memory usage
- Network traffic
- Response time

### Alertas

Configurar em:
- **Sentry**: Erros em tempo real
- **Datadog**: Performance e uptime
- **Slack**: Notificações de deploy

---

## 🐛 Troubleshooting

### Build Falha

```bash
# Limpar cache
rm -rf node_modules dist
npm ci
npm run build
```

### Timeout no Deploy

```bash
# Aumentar timeout no Railway
railway up --timeout 600
```

### Erro de Conexão com Database

```bash
# Verificar variáveis de ambiente
railway variables

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"
```

### Rate Limiting em Produção

```bash
# Ajustar em server/index.ts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500 // Aumentar para produção
});
```

---

## ✅ Checklist Pré-Deploy

### Antes do Deploy para Produção

- [ ] Todos os testes passando (`npm test`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] TypeScript compila (`npx tsc --noEmit`)
- [ ] Build local funciona (`npm run build`)
- [ ] `.env.example` atualizado
- [ ] Secrets configurados no GitHub
- [ ] Variáveis de ambiente configuradas em Vercel/Railway
- [ ] Database schema sincronizado (`npm run db:push`)
- [ ] Backup do banco de dados criado
- [ ] Changelog atualizado
- [ ] Documentação atualizada
- [ ] Testado em staging
- [ ] Equipe notificada

---

## 📞 Suporte

**Problemas com Deploy?**
1. Verificar logs: `railway logs` / `vercel logs`
2. Verificar status: https://status.railway.app / https://vercel-status.com
3. Rollback se necessário
4. Contatar equipe de DevOps

---

**Última atualização:** 30/10/2025  
**Mantido por:** Equipe HumaniQ AI
