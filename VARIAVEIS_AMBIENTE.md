# 🔐 Variáveis de Ambiente - HumaniQ AI
## Configuração para Produção (Vercel + Render + Neon)

---

## 🎯 Visão Geral

Este documento lista todas as variáveis de ambiente necessárias para rodar o HumaniQ AI em produção.

**Infraestrutura:**
- Frontend: Vercel (www.humaniqai.com.br)
- Backend: Render (https://h2-8xej.onrender.com)
- Database: Neon PostgreSQL

---

## 🌐 Frontend (Vercel)

### Configurar em: https://vercel.com/dashboard → Settings → Environment Variables

| Variável | Valor | Obrigatório | Descrição |
|----------|-------|-------------|-----------|
| `VITE_API_URL` | `https://h2-8xej.onrender.com/api` | ✅ Sim | URL da API do backend |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` ou `pk_test_...` | ✅ Sim | Chave pública da Stripe |

### Como Configurar:

```bash
# Via Vercel CLI
vercel env add VITE_API_URL
# Cole: https://h2-8xej.onrender.com/api

vercel env add VITE_STRIPE_PUBLIC_KEY
# Cole: pk_live_... (ou pk_test_ para testes)
```

### Verificar Configuração:

```bash
# Listar variáveis
vercel env ls

# Puxar variáveis localmente (para testar)
vercel env pull .env.local
```

---

## 🖥️ Backend (Render)

### Configurar em: https://dashboard.render.com → Environment

| Variável | Valor | Obrigatório | Descrição |
|----------|-------|-------------|-----------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require` | ✅ Sim | Connection string do Neon |
| `JWT_SECRET` | `seu_jwt_secret_super_secreto` | ✅ Sim | Secret para tokens JWT |
| `GOOGLE_API_KEY` | `AIza...` | ✅ Sim | API Key do Google Gemini |
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` | ✅ Sim | Secret Key da Stripe |
| `FRONTEND_URL` | `https://www.humaniqai.com.br` | ✅ Sim | URL do frontend (para links) |
| `CORS_ORIGIN` | `https://www.humaniqai.com.br` | ✅ Sim | Origins permitidas (CORS) |
| `NODE_ENV` | `production` | ⚠️ Recomendado | Ambiente de execução |
| `PORT` | `3001` | 🔄 Auto | Porta do servidor (Render define auto) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | 🔵 Opcional | Secret para webhooks Stripe |
| `STRIPE_PRICE_ESSENCIAL` | `price_...` | 🔵 Opcional | ID do plano Essencial |
| `STRIPE_PRICE_PROFISSIONAL` | `price_...` | 🔵 Opcional | ID do plano Profissional |
| `STRIPE_PRICE_ENTERPRISE` | `price_...` | 🔵 Opcional | ID do plano Enterprise |
| `LOG_LEVEL` | `info` | 🔵 Opcional | Nível de log (debug, info, warn, error) |

### Como Configurar:

**Via Render Dashboard:**
1. Acesse https://dashboard.render.com
2. Selecione seu serviço backend
3. Vá em **Environment**
4. Clique em **Add Environment Variable**
5. Adicione cada variável

**Via Render API (se tiver):**
```bash
# Exemplo com curl
curl -X POST "https://api.render.com/v1/services/{service_id}/env-vars" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "FRONTEND_URL",
    "value": "https://www.humaniqai.com.br"
  }'
```

### Valores de Exemplo (NÃO USAR EM PRODUÇÃO):

```bash
# .env.example para desenvolvimento
DATABASE_URL=postgresql://postgres:password@localhost:5432/humaniq_dev
JWT_SECRET=dev_secret_change_in_production
GOOGLE_API_KEY=AIzaSy...
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5000
NODE_ENV=development
```

---

## 🗄️ Banco de Dados (Neon)

### Obter Connection String:

1. Acesse https://console.neon.tech
2. Selecione seu projeto
3. Vá em **Dashboard** → **Connection Details**
4. Copie a **Connection string**

**Formato:**
```
postgresql://[usuario]:[senha]@[host]/[database]?sslmode=require
```

**Exemplo:**
```
postgresql://humaniq_user:AbCd1234@ep-example-123.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Configurar no Render:

1. Copie a connection string do Neon
2. No Render, adicione como `DATABASE_URL`
3. ⚠️ **IMPORTANTE:** Mantenha `?sslmode=require` no final

---

## 🔑 Stripe

### Obter Chaves:

1. Acesse https://dashboard.stripe.com
2. Vá em **Developers** → **API keys**
3. Copie:
   - **Publishable key** (pk_live_... ou pk_test_...)
   - **Secret key** (sk_live_... ou sk_test_...)

### Webhook Secret (Opcional mas Recomendado):

1. Vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. URL: `https://h2-8xej.onrender.com/api/stripe/webhook`
4. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Signing secret** (whsec_...)
6. Adicione como `STRIPE_WEBHOOK_SECRET` no Render

### Price IDs (Planos):

1. Vá em **Products**
2. Para cada plano, copie o **Price ID** (price_...)
3. Adicione no Render:
   - `STRIPE_PRICE_ESSENCIAL`
   - `STRIPE_PRICE_PROFISSIONAL`
   - `STRIPE_PRICE_ENTERPRISE`

---

## 🤖 Google Gemini AI

### Obter API Key:

1. Acesse https://makersuite.google.com/app/apikey
2. Crie um novo projeto (se necessário)
3. Clique em **Create API Key**
4. Copie a chave (AIza...)
5. Adicione como `GOOGLE_API_KEY` no Render

**Modelos usados:**
- `gemini-1.5-flash` (análises rápidas)
- `gemini-1.5-pro` (análises complexas)

---

## 📧 SendGrid (Opcional)

Se quiser enviar emails via SendGrid:

### Obter API Key:

1. Acesse https://app.sendgrid.com
2. Vá em **Settings** → **API Keys**
3. Clique em **Create API Key**
4. Nome: "HumaniQ Production"
5. Permissões: **Full Access** ou **Mail Send**
6. Copie a chave (SG....)
7. Adicione como `SENDGRID_API_KEY` no Render

**Nota:** O projeto já tem integração configurada via Replit Connector, mas você pode usar API key direta também.

---

## ✅ Checklist de Configuração

### Frontend (Vercel)

- [ ] `VITE_API_URL` configurado
- [ ] `VITE_STRIPE_PUBLIC_KEY` configurado
- [ ] Variáveis aplicadas a todos os ambientes (Production, Preview, Development)
- [ ] Deploy realizado após configurar variáveis

### Backend (Render)

- [ ] `DATABASE_URL` configurado (Neon connection string)
- [ ] `JWT_SECRET` configurado (strong secret)
- [ ] `GOOGLE_API_KEY` configurado
- [ ] `STRIPE_SECRET_KEY` configurado
- [ ] `FRONTEND_URL` = `https://www.humaniqai.com.br`
- [ ] `CORS_ORIGIN` = `https://www.humaniqai.com.br`
- [ ] `NODE_ENV` = `production`
- [ ] (Opcional) `STRIPE_WEBHOOK_SECRET` configurado
- [ ] (Opcional) Price IDs configurados
- [ ] Deploy realizado após configurar variáveis

### Banco de Dados (Neon)

- [ ] Connection string obtida
- [ ] SSL mode habilitado (`?sslmode=require`)
- [ ] Banco de dados criado e acessível
- [ ] Schema migrado (`npm run db:push`)

---

## 🧪 Testar Configuração

### Teste 1: Verificar Variáveis do Frontend

```bash
# Inspecionar no navegador
# Abra DevTools (F12) → Console
console.log(import.meta.env.VITE_API_URL);
// Deve retornar: https://h2-8xej.onrender.com/api
```

### Teste 2: Verificar Conectividade do Backend

```bash
# Health check
curl https://h2-8xej.onrender.com/api/health

# Deve retornar algo como:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-07T..."
}
```

### Teste 3: Verificar CORS

```bash
# Testar CORS
curl -I https://h2-8xej.onrender.com/api/health \
  -H "Origin: https://www.humaniqai.com.br"

# Deve incluir header:
# Access-Control-Allow-Origin: https://www.humaniqai.com.br
```

### Teste 4: Verificar Stripe

```bash
# No frontend, tentar criar checkout
# Deve redirecionar para Stripe Checkout sem erros
```

---

## 🐛 Troubleshooting

### Problema: Frontend não conecta ao backend

**Causa:** `VITE_API_URL` incorreto ou não configurado

**Solução:**
1. Verificar valor em Vercel → Environment Variables
2. Deve ser exatamente: `https://h2-8xej.onrender.com/api`
3. Redeploy do frontend após corrigir

### Problema: CORS Error

**Causa:** `CORS_ORIGIN` no backend não inclui domínio do frontend

**Solução:**
1. Render → Environment → `CORS_ORIGIN`
2. Valor: `https://www.humaniqai.com.br`
3. Se múltiplos domínios: `https://www.humaniqai.com.br,https://humaniqai.com.br`
4. Redeploy do backend

### Problema: Erro de conexão com banco

**Causa:** `DATABASE_URL` incorreto ou Neon offline

**Solução:**
1. Verificar connection string no Neon Console
2. Testar conexão: `psql $DATABASE_URL -c "SELECT 1"`
3. Verificar se SSL está habilitado (`?sslmode=require`)

### Problema: Stripe não funciona

**Causa:** Chaves incorretas ou webhooks não configurados

**Solução:**
1. Verificar se está usando chaves de produção (`pk_live_`, `sk_live_`)
2. Verificar webhook endpoint está correto
3. Verificar eventos do webhook estão configurados

### Problema: Links de convite com domínio errado

**Causa:** `FRONTEND_URL` incorreto no backend

**Solução:**
1. Render → `FRONTEND_URL` deve ser `https://www.humaniqai.com.br`
2. Redeploy do backend
3. Testar criar novo convite

---

## 🔒 Segurança

### Boas Práticas:

1. **Nunca commite secrets no Git**
   - Use `.env.local` para desenvolvimento
   - Adicione `.env*` no `.gitignore`

2. **Use secrets fortes**
   - `JWT_SECRET`: mínimo 32 caracteres aleatórios
   - Gere com: `openssl rand -base64 32`

3. **Rotacione secrets periodicamente**
   - Troque JWT_SECRET a cada 3-6 meses
   - Revogue e recrie API keys anualmente

4. **Separe ambientes**
   - Use chaves Stripe diferentes (test vs live)
   - Use databases separados (dev vs prod)

5. **Monitore uso de APIs**
   - Configure alertas de uso no Google Cloud
   - Monitore custos no Stripe Dashboard

---

## 📞 Suporte

**Problemas com variáveis?**
- Vercel: https://vercel.com/docs/concepts/projects/environment-variables
- Render: https://render.com/docs/configure-environment-variables
- Neon: https://neon.tech/docs/connect/connection-string

---

**Última atualização:** 07/11/2025  
**Versão:** 1.0  
**Autor:** Equipe HumaniQ AI
