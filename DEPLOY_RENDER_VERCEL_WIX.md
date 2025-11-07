# 🚀 Guia de Deploy - HumaniQ AI (Render + Vercel + WIX)

## 📋 Arquitetura de Produção

```
┌─────────────────────────────────────────────────────────┐
│       humaniqai.com.br (Domínio gerenciado no WIX)      │
└─────────────────────────────────────────────────────────┘
                      │
            ┌─────────┴────────┐
            │                  │
            ▼                  ▼
┌──────────────────┐  ┌──────────────────────┐
│  www.humaniqai   │  │  api.humaniqai       │
│  .com.br         │  │  .com.br             │
│                  │  │                      │
│  VERCEL          │  │  RENDER              │
│  (Frontend)      │  │  (Backend API)       │
└──────────────────┘  └──────────────────────┘
         │                      │
         │                      ▼
         │            ┌──────────────────────┐
         └───────────►│  Neon PostgreSQL      │
                      │  (Database)           │
                      └──────────────────────┘
```

---

## 🎯 Objetivo

Conectar o domínio **humaniqai.com.br** (gerenciado no WIX) com:
- **Frontend** (React/Vite) → **Vercel** → `www.humaniqai.com.br`
- **Backend** (Express/API) → **Render** → `api.humaniqai.com.br`
- **Database** → **Neon PostgreSQL**

---

## 📝 Status Atual

### ✅ Já Configurado:
- ✅ Backend deployado no Render: `https://h2-8xej.onrender.com`
- ✅ Frontend deployado no Vercel: (URL temporária)
- ✅ Database PostgreSQL no Neon (conectado)
- ✅ SSL automático em ambos (Render + Vercel)
- ✅ Repositório GitHub: `Luiz1976/H2`

### ⏳ Pendente:
- ⚠️ Configurar DNS no WIX para apontar `www` e `api`
- ⚠️ Adicionar domínios customizados no Render e Vercel
- ⚠️ Atualizar variáveis de ambiente de produção
- ⚠️ Validar comunicação Frontend ↔ Backend com domínios finais

---

## 🔧 PASSO 1: Configurar Domínio Customizado no Render (Backend)

### 1.1. Acessar Render Dashboard
1. Acesse: https://dashboard.render.com/
2. Faça login e vá para o serviço **h2-8xej** (Backend API)
3. Clique no serviço para abrir os detalhes

### 1.2. Adicionar Domínio Customizado
1. Role até a seção **Custom Domains**
2. Clique em **+ Add Custom Domain**
3. Digite: `api.humaniqai.com.br`
4. Clique em **Save**

### 1.3. Anotar Registro DNS
Render mostrará o **CNAME target** que você precisa adicionar no WIX:

```
Type: CNAME
Name: api
Value: <seu-servico>.onrender.com
```

**Exemplo:**
```
Type: CNAME
Name: api
Value: h2-8xej.onrender.com
```

**📝 ANOTE ESTE VALOR** - você usará no WIX

### 1.4. Aguardar Verificação
- Render mostrará status **"Verification Pending"**
- Após configurar o DNS no WIX, ficará **"Verified"**
- SSL será emitido automaticamente (Let's Encrypt)

---

## 🔧 PASSO 2: Configurar Domínio Customizado no Vercel (Frontend)

### 2.1. Acessar Vercel Dashboard
1. Acesse: https://vercel.com/
2. Faça login e vá para o projeto **HumaniQ AI Frontend**
3. Vá em **Settings** → **Domains**

### 2.2. Adicionar Domínio Customizado
1. Clique em **Add Domain**
2. Digite: `www.humaniqai.com.br`
3. Clique em **Add**

### 2.3. Anotar Valores DNS
Vercel mostrará o registro CNAME necessário:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**📝 ANOTE ESTE VALOR** - você usará no WIX

---

## 🌐 PASSO 3: Configurar DNS no WIX

### 3.1. Acessar Gerenciador de DNS do WIX
1. Faça login em: https://www.wix.com/
2. Vá em **Meu Painel** → **Domínios**
3. Encontre `humaniqai.com.br`
4. Clique em **Gerenciar** ou **Manage DNS Records**

### 3.2. Adicionar CNAME para Backend (API)
1. Na seção **CNAME (Aliases)**, clique em **+ Adicionar Registro** (ou **+ Add Record**)
2. Preencha:
   - **Nome do Host** (Host Name): `api`
   - **Valor** (Value): `h2-8xej.onrender.com` ← (valor do Render)
   - **TTL**: `3600` (1 hora)
3. Clique em **Salvar** (Save)

### 3.3. Adicionar CNAME para Frontend (www)
1. Na seção **CNAME (Aliases)**, clique em **+ Adicionar Registro**
2. Preencha:
   - **Nome do Host**: `www`
   - **Valor**: `cname.vercel-dns.com`
   - **TTL**: `3600`
3. Clique em **Salvar** (Save)

### 3.4. Opcional: Redirecionar Domínio Raiz
Se quiser que `humaniqai.com.br` (sem www) redirecione para `www.humaniqai.com.br`:

**Opção A: Redirecionamento HTTP (no WIX)**
1. No painel WIX, configure um redirecionamento 301:
   - **De**: `humaniqai.com.br`
   - **Para**: `www.humaniqai.com.br`

**Opção B: Registro A (apontar para Vercel)**
Consulte a documentação do Vercel para obter o IP correto.

### 3.5. Verificar Registros Adicionados
Após adicionar, sua lista de registros CNAME deve incluir:

```
api.humaniqai.com.br  →  h2-8xej.onrender.com
www.humaniqai.com.br  →  cname.vercel-dns.com
```

### 3.6. Aguardar Propagação DNS
- **Tempo estimado**: 5 minutos a 48 horas (geralmente 15-60 minutos)
- **Verificar propagação**: https://dnschecker.org/

---

## ⚙️ PASSO 4: Configurar Variáveis de Ambiente

### 4.1. Variáveis no Render (Backend)
Acesse: **Render Dashboard** → **Seu Serviço (h2-8xej)** → **Environment**

Adicione/atualize as seguintes variáveis:

```bash
# Database Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database?sslmode=require

# Autenticação
JWT_SECRET=sua_chave_secreta_jwt_256_bits_muito_segura

# CORS - IMPORTANTE! (aceitar ambas URLs durante transição)
FRONTEND_URL=https://www.humaniqai.com.br

# URLs da aplicação
BACKEND_URL=https://api.humaniqai.com.br

# Node Environment
NODE_ENV=production

# Porta (Render usa automaticamente PORT)
PORT=5000

# Stripe (use chaves LIVE, não test!)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ESSENCIAL=price_...
STRIPE_PRICE_PROFISSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Google AI Gemini
GOOGLE_API_KEY=AIzaSy...

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxx...
SENDGRID_FROM_EMAIL=noreply@humaniqai.com.br
SENDGRID_FROM_NAME=HumaniQ AI
```

**⚠️ IMPORTANTE**:
- Use **chaves LIVE** do Stripe (não test!)
- `DATABASE_URL` deve incluir `?sslmode=require` para Neon
- Após salvar, Render fará **redeploy automático**

### 4.2. Atualizar CORS no Backend (server/index.ts)
Verifique se o CORS está configurado para aceitar o novo domínio:

```typescript
const corsOptions = {
  origin: [
    'https://www.humaniqai.com.br',
    'https://humaniqai.com.br',
    'http://localhost:5173', // Dev local
  ],
  credentials: true,
};

app.use(cors(corsOptions));
```

### 4.3. Variáveis no Vercel (Frontend)
Acesse: **Vercel** → **Seu Projeto** → **Settings** → **Environment Variables**

Adicione as seguintes variáveis (para **Production**):

```bash
# URL da API Backend - CRÍTICO!
VITE_API_URL=https://api.humaniqai.com.br

# Stripe Public Key (LIVE!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google AI
VITE_GOOGLE_API_KEY=AIzaSy...

# URL da Aplicação
VITE_APP_URL=https://www.humaniqai.com.br
```

**⚠️ IMPORTANTE**:
- Todas as variáveis frontend DEVEM começar com `VITE_`
- Use `api.humaniqai.com.br` (não a URL temporária do Render!)
- Após adicionar, **Redeploy** o projeto no Vercel

### 4.4. Redesploy Após Adicionar Variáveis
1. **Render**: Redeploy automático ao salvar variáveis
2. **Vercel**: Vá em **Deployments** → **...** (três pontos) → **Redeploy**

---

## 🧪 PASSO 5: Testar a Configuração

### 5.1. Verificar Propagação DNS
Use: https://dnschecker.org/

Digite:
- `api.humaniqai.com.br` → Deve apontar para Render
- `www.humaniqai.com.br` → Deve apontar para Vercel

Ou use terminal:
```bash
# Testar CNAME do backend
nslookup api.humaniqai.com.br

# Testar CNAME do frontend
nslookup www.humaniqai.com.br
```

### 5.2. Testar Backend (API)
Abra o navegador:
```
https://api.humaniqai.com.br/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "version": "1.0.0",
  "database": "connected"
}
```

Se não funcionar:
- Aguarde mais tempo (DNS pode levar até 48h)
- Verifique se o CNAME foi adicionado corretamente no WIX
- Verifique se o Render marcou o domínio como **"Verified"**

### 5.3. Testar Frontend
Abra o navegador:
```
https://www.humaniqai.com.br
```

Deve carregar a aplicação HumaniQ AI normalmente.

### 5.4. Testar Integração (Frontend → Backend)
1. Acesse: `https://www.humaniqai.com.br`
2. Abra o **Console do Navegador** (F12 → Console)
3. Tente fazer **login**
4. Verifique se as requisições vão para `https://api.humaniqai.com.br/api/*`
5. **Se aparecer erro de CORS**, volte ao **Passo 4.2** e atualize o `corsOptions`

### 5.5. Testar Fluxo Completo de Convites
1. Login como **Admin**
2. Criar convite de **Empresa**
3. Aceitar convite de **Empresa** (nova aba/incógnito)
4. Login como **Empresa**
5. Criar convite de **Colaborador**
6. Aceitar convite de **Colaborador**
7. Login como **Colaborador**

**Verificar:**
- ✅ Todos os passos funcionam sem erros
- ✅ Respostas da API seguem o padrão `{ success, data/error, message }`
- ✅ Sem erros de CORS no console

---

## 🔍 Troubleshooting

### ❌ Erro: "DNS_PROBE_FINISHED_NXDOMAIN"
**Causa**: DNS ainda não propagou ou CNAME incorreto

**Solução**:
1. Aguarde até 48h para propagação completa
2. Verifique se os CNAMEs estão corretos no WIX:
   - `api` → `h2-8xej.onrender.com`
   - `www` → `cname.vercel-dns.com`
3. Use https://dnschecker.org/ para verificar propagação global

### ❌ Erro: "CORS policy: No 'Access-Control-Allow-Origin'"
**Causa**: CORS não configurado no backend

**Solução**:
1. Verifique `server/index.ts`:
   ```typescript
   const corsOptions = {
     origin: [
       'https://www.humaniqai.com.br',
       'https://humaniqai.com.br',
     ],
     credentials: true,
   };
   ```
2. Redeploy do backend no Render
3. Limpe cache do navegador (Ctrl+Shift+Delete)

### ❌ Erro: "Failed to fetch" ou "Network Error"
**Causa**: Frontend usando URL incorreta da API

**Solução**:
1. Vá no Vercel → Settings → Environment Variables
2. Verifique: `VITE_API_URL=https://api.humaniqai.com.br`
3. **Redeploy** do frontend
4. Limpe cache do navegador

### ❌ Frontend carrega mas não chama API
**Causa**: `VITE_API_URL` não configurada ou incorreta

**Solução**:
1. Adicione `VITE_API_URL=https://api.humaniqai.com.br` no Vercel
2. Redeploy
3. Abra **DevTools** → **Console** e veja se há erros
4. Verifique **Network tab** para ver quais URLs estão sendo chamadas

### ❌ SSL Certificate Error
**Causa**: DNS não propagou completamente

**Solução**:
- Aguarde mais tempo (até 1 hora após DNS propagar)
- Render e Vercel emitem SSL automaticamente (Let's Encrypt)
- Verifique status no Render: **Custom Domains** → deve mostrar **"Verified"** com 🔒

### ❌ Backend retorna erro 500
**Causa**: Variáveis de ambiente incorretas ou banco desconectado

**Solução**:
1. Verifique logs no Render: **Logs** tab
2. Verifique `DATABASE_URL` está correta
3. Teste conexão: `https://api.humaniqai.com.br/health`

---

## 📊 Checklist de Deploy

Marque conforme completar:

### Render (Backend)
- [ ] ✅ Domínio customizado adicionado: `api.humaniqai.com.br`
- [ ] ✅ Status no Render: **"Verified"** com certificado SSL
- [ ] ✅ Variáveis de ambiente configuradas:
  - [ ] `DATABASE_URL` (Neon PostgreSQL com `?sslmode=require`)
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL=https://www.humaniqai.com.br`
  - [ ] `NODE_ENV=production`
  - [ ] `STRIPE_SECRET_KEY` (sk_live_...)
  - [ ] `GOOGLE_API_KEY`
  - [ ] `SENDGRID_API_KEY`
- [ ] ✅ CORS configurado em `server/index.ts`
- [ ] ✅ Health check funcionando: `/health`

### Vercel (Frontend)
- [ ] ✅ Domínio customizado adicionado: `www.humaniqai.com.br`
- [ ] ✅ Status no Vercel: **"Valid Configuration"** com SSL
- [ ] ✅ Variáveis de ambiente configuradas:
  - [ ] `VITE_API_URL=https://api.humaniqai.com.br`
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
  - [ ] `VITE_GOOGLE_API_KEY`
  - [ ] `VITE_APP_URL=https://www.humaniqai.com.br`
- [ ] ✅ Redeploy executado após adicionar variáveis

### WIX (DNS)
- [ ] ✅ CNAME adicionado: `api` → `h2-8xej.onrender.com`
- [ ] ✅ CNAME adicionado: `www` → `cname.vercel-dns.com`
- [ ] ✅ Aguardado propagação DNS (15min - 48h)
- [ ] ✅ Verificado com https://dnschecker.org/

### Testes em Produção
- [ ] ✅ Backend acessível: `https://api.humaniqai.com.br/health`
- [ ] ✅ Frontend carrega: `https://www.humaniqai.com.br`
- [ ] ✅ Login funciona (admin/empresa/colaborador)
- [ ] ✅ Convites funcionam (criar/aceitar/listar/cancelar)
- [ ] ✅ Cursos funcionam (colaborador)
- [ ] ✅ Sem erros de CORS no console
- [ ] ✅ SSL ativo em ambos (cadeado 🔒 verde no navegador)

---

## 🚀 Deploy Contínuo (CI/CD)

### Deploy Automático Configurado
Ambos Render e Vercel fazem deploy automático ao detectar push no GitHub:

```bash
# No terminal do Replit (ou local)
git add .
git commit -m "fix: padronização completa da API de convites"
git push origin main
```

**Render** e **Vercel** farão deploy automaticamente!

### Monitorar Deploy
- **Render**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Deployments → Logs

---

## 📈 Monitoramento Pós-Deploy

### Render (Backend)
- **Logs em tempo real**: Dashboard → Logs
- **Métricas**: Dashboard → Metrics (CPU, Memória, Requisições)
- **Health check**: Configure monitoramento em https://uptimerobot.com/

### Vercel (Frontend)
- **Analytics**: Dashboard → Analytics
- **Speed Insights**: Dashboard → Speed Insights
- **Logs**: Dashboard → Logs

### Neon (Database)
- **Dashboard Neon**: https://console.neon.tech/
- **Monitoramento**: Conexões ativas, queries lentas, uso de storage

---

## 🎉 Conclusão

Após completar todos os passos, sua aplicação estará:

✅ **Frontend**: https://www.humaniqai.com.br (Vercel)  
✅ **Backend API**: https://api.humaniqai.com.br (Render)  
✅ **Database**: Neon PostgreSQL (auto-gerenciado)  
✅ **SSL**: Certificados automáticos em ambos  
✅ **CORS**: Configurado para aceitar domínio customizado  
✅ **Deploy Contínuo**: Push no GitHub → Deploy automático

---

## 📞 Suporte

Se encontrar problemas:

1. **Render Support**: https://render.com/docs
2. **Vercel Support**: https://vercel.com/support
3. **WIX DNS Help**: https://support.wix.com/ (buscar "DNS management")
4. **Neon Support**: https://neon.tech/docs
5. **Verificar Logs**:
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → Logs

---

## 📚 Documentos Relacionados

- `DEPLOY_PRODUCAO_FINAL.md` - Guia geral de deploy
- `ATUALIZACAO_PRODUCAO.md` - Detalhes técnicos das alterações
- `VARIAVEIS_AMBIENTE.md` - Lista completa de variáveis

---

**Última atualização**: 07/11/2025  
**Versão do Guia**: 2.0.0  
**Infraestrutura**: Render + Vercel + WIX + Neon PostgreSQL
