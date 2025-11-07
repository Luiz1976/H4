# 🚨 Solução: Railway Backend Offline - www.humaniqai.com.br

## 🔍 **Problema Identificado**
- **Status**: Railway backend retornando `404 - Application not found`
- **URL afetada**: `https://humaniq-ai-backend-production.up.railway.app`
- **Impacto**: Site `www.humaniqai.com.br` não consegue fazer login
- **Erro**: `TypeError: Failed to fetch`
- **Data**: Janeiro 2025 - Problema confirmado via testes de conectividade

## 🎯 **Soluções Disponíveis**

### **Opção 1: Reativar Railway (RECOMENDADA)**

#### **Passo 1: Acessar Dashboard Railway**
1. Acesse: https://railway.com/project/4266d53d-269a-4667-9127-f241b39ee095
2. Faça login na conta associada ao projeto
3. Verifique o status do serviço

#### **Passo 2: Verificar Status do Projeto**
- ✅ **Se pausado**: Clique em "Resume" ou "Unpause"
- ✅ **Se com erro**: Verificar logs e fazer redeploy
- ✅ **Se removido**: Criar novo deploy (instruções abaixo)

#### **Passo 3: Configurar Variáveis de Ambiente**
No Railway Dashboard, configure:

```bash
# Essenciais
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
CORS_ORIGIN=https://www.humaniqai.com.br

# Banco de dados (se usando PostgreSQL)
DATABASE_URL=postgresql://...

# Segurança
JWT_SECRET=seu_jwt_secret_super_seguro_256_bits

# APIs (se necessário)
GOOGLE_API_KEY=sua_google_api_key
SENDGRID_API_KEY=sua_sendgrid_key
STRIPE_SECRET_KEY=sk_live_...
```

#### **Passo 4: Fazer Deploy**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link 4266d53d-269a-4667-9127-f241b39ee095

# Deploy
railway up
```

#### **Passo 5: Testar Conectividade**
```bash
# Testar health check
curl https://humaniq-ai-backend-production.up.railway.app/health

# Testar login
curl -X POST https://humaniq-ai-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@humaniq.com","password":"password"}'
```

---

### **Opção 2: Deploy Alternativo (BACKUP)**

#### **2A: Vercel Functions**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy backend como functions
vercel --prod

# Configurar variáveis no Vercel Dashboard
```

#### **2B: Render.com**
```bash
# Conectar repositório GitHub ao Render
# Configurar build command: npm install && npm run build
# Configurar start command: npm run start:prod
```

#### **2C: Heroku**
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login e criar app
heroku login
heroku create humaniq-backend-prod

# Deploy
git push heroku main
```

---

## 🛠️ **Configuração Rápida (Se Railway foi removido)**

### **Criar Novo Projeto Railway**

1. **Acesse**: https://railway.app/new
2. **Conecte**: Repositório GitHub `Luiz1976/H2`
3. **Configure**:
   - **Root Directory**: `/` (raiz do projeto)
   - **Build Command**: `npm install --legacy-peer-deps`
   - **Start Command**: `npm run start:prod`
   - **Port**: `${{RAILWAY_PUBLIC_PORT}}`

4. **Variáveis de Ambiente**:
```bash
NODE_ENV=production
PORT=${{RAILWAY_PUBLIC_PORT}}
CORS_ORIGIN=https://www.humaniqai.com.br
JWT_SECRET=gere_um_secret_seguro_256_bits
```

5. **Deploy**: Railway fará deploy automático

---

## 🔧 **Configuração do Frontend (se necessário)**

Se o Railway mudar de URL, atualize o frontend:

### **Vercel (onde está hospedado www.humaniqai.com.br)**
1. Acesse: https://vercel.com/luizs-projects-8ac983de/humaniq-ai
2. Vá em **Settings → Environment Variables**
3. Atualize:
```bash
VITE_API_URL=https://nova-url-railway.up.railway.app/api
```
4. **Redeploy**: Vercel → Deployments → Redeploy

---

## ✅ **Checklist de Verificação**

### **Após Reativar Railway**
- [ ] Health check responde: `GET /health` → `200 OK`
- [ ] Login funciona: `POST /api/auth/login` → JWT token
- [ ] CORS configurado para `https://www.humaniqai.com.br`
- [ ] Variáveis de ambiente configuradas
- [ ] Site `www.humaniqai.com.br` consegue fazer login

### **Teste Final**
1. Acesse: https://www.humaniqai.com.br
2. Tente fazer login com credenciais válidas
3. Verifique se não há erro "Failed to fetch"
4. Confirme que o login é bem-sucedido

---

## 🚨 **Solução de Emergência (Temporária)**

Se não conseguir reativar o Railway imediatamente:

### **Usar Backend Local Temporário**
1. **Configure um servidor local público**:
```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar backend local
npm run server

# Expor publicamente (nova aba)
ngrok http 3001
```

2. **Atualizar frontend temporariamente**:
```bash
# No Vercel, alterar VITE_API_URL para:
VITE_API_URL=https://sua-url-ngrok.ngrok.io/api
```

⚠️ **ATENÇÃO**: Esta é uma solução temporária. Use apenas até reativar o Railway.

---

## 📞 **Suporte**

**Se precisar de ajuda:**
1. Verificar logs do Railway: `railway logs`
2. Verificar status: https://status.railway.app
3. Documentação: https://docs.railway.app
4. Suporte Railway: https://help.railway.app

---

## 🎯 **Resumo da Solução**

**Problema**: Railway backend offline (404)  
**Causa**: Projeto pausado/removido/com erro  
**Solução**: Reativar Railway + configurar variáveis  
**Resultado**: `www.humaniqai.com.br` funcionando 100%  

**Tempo estimado**: 15-30 minutos  
**Prioridade**: CRÍTICA (site em produção afetado)