# 🚀 Guia Completo de Deploy - HumaniQ AI
## Atualização da Produção (Vercel + Render + Neon)

**Data:** 07/11/2025  
**Versão:** 1.0 Final

---

## 📊 Infraestrutura de Produção

- **Frontend:** Vercel → https://www.humaniqai.com.br
- **Backend:** Render → https://h2-8xej.onrender.com
- **Database:** Neon PostgreSQL
- **Repositório:** GitHub → Luiz1976/H2

---

## ✅ Mudanças Implementadas

### 1. Correção de Estrutura de Resposta da API

**Problema:** Inconsistência entre frontend e backend na estrutura de resposta

**Solução Aplicada:**
- ✅ Backend padronizado para retornar `{ success: true, data: {...} }`
- ✅ Frontend atualizado para usar `response.data`
- ✅ Todos os endpoints de convites padronizados

**Arquivos Modificados:**
- `src/services/apiService.ts` - Padronizado todas as funções
- `server/routes/convites.ts` - Padronizado todas as respostas

### 2. Exclusão de Convites por Token

**Adicionado:**
- ✅ Endpoint DELETE `/api/convites/colaborador/:token`
- ✅ Endpoint DELETE `/api/convites/empresa/:token`
- ✅ UI de exclusão em `EmpresaGestaoConvites.tsx`
- ✅ Validações de segurança (verificar empresa proprietária)

### 3. Validações Aprimoradas

- ✅ Email único ao criar convite
- ✅ Verificação de status (só exclui "pendente")
- ✅ Verificação de propriedade (empresa só exclui seus convites)

---

## 📋 Passo a Passo - Deploy para Produção

### Etapa 1: Atualizar Código no GitHub (OBRIGATÓRIO)

Como há conflitos Git no Replit, recomendo atualização manual:

**Opção A: Via GitHub Web (MAIS FÁCIL)**

Para cada arquivo abaixo, abra no GitHub e atualize:

1. `src/services/apiService.ts`
   - Acesse: https://github.com/Luiz1976/H2/blob/main/src/services/apiService.ts
   - Clique em "Edit"
   - Cole o conteúdo do arquivo deste Replit
   - Commit: "fix: padronizar estrutura de resposta API (response.data)"

2. `server/routes/convites.ts`
   - Acesse: https://github.com/Luiz1976/H2/blob/main/server/routes/convites.ts
   - Clique em "Edit"
   - Cole o conteúdo do arquivo deste Replit
   - Commit: "feat: adicionar exclusão de convites por token"

3. `src/pages/empresa/EmpresaGestaoConvites.tsx`
   - Acesse: https://github.com/Luiz1976/H2/blob/main/src/pages/empresa/EmpresaGestaoConvites.tsx
   - Clique em "Edit"
   - Cole o conteúdo do arquivo deste Replit
   - Commit: "feat: adicionar botão de exclusão de convites"

**Opção B: Download e Upload**

1. No Replit, baixe os 3 arquivos acima
2. No GitHub, faça upload dos arquivos
3. Commit com mensagem descritiva

**Opção C: Git Clone Limpo (Para usuários avançados)**

```bash
# Em sua máquina local (não no Replit)
git clone https://github.com/Luiz1976/H2.git
cd H2

# Copie os arquivos do Replit para este diretório
# Depois:
git add src/services/apiService.ts server/routes/convites.ts src/pages/empresa/EmpresaGestaoConvites.tsx
git commit -m "fix: corrigir sistema de convites - exclusão e padronização API"
git push origin main
```

### Etapa 2: Deploy Automático (Aguardar)

Após push para GitHub:

**2.1 - Vercel (Frontend)**
- ⏱️ Deploy inicia automaticamente (~2-3 minutos)
- 📍 Acompanhe em: https://vercel.com/dashboard
- ✅ Aguarde status "Ready"

**2.2 - Render (Backend)**
- ⏱️ Deploy inicia automaticamente (~5-7 minutos)
- 📍 Acompanhe em: https://dashboard.render.com
- ✅ Aguarde status "Live"

### Etapa 3: Verificar Variáveis de Ambiente

**3.1 - Vercel (Frontend)**

Acesse: https://vercel.com/dashboard → Settings → Environment Variables

Confirme que está configurado:
```
VITE_API_URL = https://h2-8xej.onrender.com/api
VITE_STRIPE_PUBLIC_KEY = pk_live_... (ou pk_test_...)
```

**3.2 - Render (Backend)**

Acesse: https://dashboard.render.com → Environment

Confirme que estão configuradas:
```
DATABASE_URL = postgresql://...@neon.tech/neondb?sslmode=require
JWT_SECRET = (seu secret)
GOOGLE_API_KEY = AIza...
STRIPE_SECRET_KEY = sk_live_... (ou sk_test_...)
FRONTEND_URL = https://www.humaniqai.com.br
CORS_ORIGIN = https://www.humaniqai.com.br
NODE_ENV = production
```

⚠️ **CRÍTICO:** Se `FRONTEND_URL` não estiver configurado, os links de convite terão domínio errado!

### Etapa 4: Migração do Banco de Dados (Se Necessário)

**Verificar se precisa migração:**
- Se o arquivo `shared/schema.ts` foi modificado → SIM, precisa
- Se só mudou código frontend/rotas → NÃO precisa

**Como migrar:**

**Opção A: Via Render (RECOMENDADO)**
1. Acesse Render Dashboard → Seu serviço backend
2. Clique em "Shell" (no menu)
3. Execute:
   ```bash
   npm run db:push
   ```
4. Se der aviso de perda de dados:
   ```bash
   npm run db:push -- --force
   ```

**Opção B: Localmente com Connection String do Neon**
1. Copie DATABASE_URL do Neon
2. Configure localmente:
   ```bash
   export DATABASE_URL="postgresql://..."
   npm run db:push
   ```

### Etapa 5: Testes em Produção (OBRIGATÓRIO)

Acesse: https://www.humaniqai.com.br

**5.1 - Teste Login**
```
1. Login como empresa
2. Verificar acesso ao dashboard
```

**5.2 - Teste Criar Convite**
```
1. Ir em "Gerar Convite" ou "Gestão de Convites"
2. Preencher formulário
3. Clicar "Enviar Convite"
4. Verificar se aparece na lista
5. Verificar se link foi gerado
```

**5.3 - Teste Exclusão de Convite (NOVO)**
```
1. Na lista de convites
2. Localizar convite com status "Pendente"
3. Clicar no ícone de lixeira
4. Confirmar exclusão no diálogo
5. Verificar se sumiu da lista
```

**5.4 - Teste Link de Convite**
```
1. Copiar link de um convite
2. Abrir em aba anônima
3. Verificar se abre página de aceite
4. (Opcional) Completar fluxo de aceite
```

**5.5 - Verificar Console do Navegador**
```
1. Abrir DevTools (F12)
2. Ir em "Console"
3. Fazer ações (criar, deletar convites)
4. Verificar se não há erros 404, 500, CORS
```

---

## 🧪 Endpoints da API

### Criar Convite de Empresa
```http
POST /api/convites/empresa
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "nomeEmpresa": "Empresa Teste",
  "emailContato": "empresa@teste.com",
  "cnpj": "12.345.678/0001-90",
  "numeroColaboradores": 50,
  "diasValidade": 7
}

Response (201):
{
  "success": true,
  "message": "Convite criado com sucesso",
  "data": {
    "id": "uuid",
    "token": "abc123...",
    "nomeEmpresa": "Empresa Teste",
    "emailContato": "empresa@teste.com",
    "status": "pendente",
    "validade": "2025-11-14T...",
    "linkConvite": "https://www.humaniqai.com.br/convite/empresa/abc123...",
    "emailEnviado": true
  }
}
```

### Criar Convite de Colaborador
```http
POST /api/convites/colaborador
Authorization: Bearer {empresa_token}
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "cargo": "Analista",
  "departamento": "TI",
  "diasValidade": 3
}

Response (201):
{
  "success": true,
  "message": "Convite criado com sucesso",
  "data": {
    "id": "uuid",
    "token": "xyz789...",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "cargo": "Analista",
    "departamento": "TI",
    "status": "pendente",
    "validade": "2025-11-10T...",
    "linkConvite": "https://www.humaniqai.com.br/convite/colaborador/xyz789...",
    "emailEnviado": true
  }
}
```

### Deletar Convite (NOVO)
```http
DELETE /api/convites/colaborador/:token
Authorization: Bearer {empresa_token}

Response (200):
{
  "success": true,
  "message": "Convite excluído com sucesso"
}

Erros:
404 - Convite não encontrado
403 - Convite não pertence à empresa
400 - Convite já aceito (só exclui "pendente")
```

### Listar Convites
```http
GET /api/convites/listar
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "convites": [...],
  "tipo": "empresa" ou "colaborador"
}
```

### Buscar Convite por Token
```http
GET /api/convites/token/:token?tipo=colaborador
(Rota pública - sem auth)

Response (200):
{
  "success": true,
  "data": {
    "token": "xyz789...",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "status": "pendente",
    "validade": "2025-11-10T..."
  },
  "tipo": "colaborador"
}
```

---

## ⚠️ Problemas Comuns e Soluções

### Problema: "404 Not Found" ao deletar convite

**Causa:** Backend não atualizado ou rota errada

**Solução:**
1. Verifique se Render fez deploy do backend
2. Olhe logs do Render
3. Teste endpoint direto:
   ```bash
   curl -X DELETE https://h2-8xej.onrender.com/api/convites/colaborador/TOKEN \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

### Problema: CORS Error no console

**Causa:** `CORS_ORIGIN` não configurado ou incorreto

**Solução:**
1. Render → Environment → `CORS_ORIGIN`
2. Valor deve ser: `https://www.humaniqai.com.br`
3. Redeploy do backend

### Problema: Link de convite com domínio errado

**Causa:** `FRONTEND_URL` não configurado no Render

**Solução:**
1. Render → Environment → Adicionar `FRONTEND_URL`
2. Valor: `https://www.humaniqai.com.br`
3. Redeploy do backend
4. Criar novo convite para testar

### Problema: Deploy não inicia automaticamente

**Solução Vercel:**
1. Vercel Dashboard → Deployments
2. Clicar "Redeploy"

**Solução Render:**
1. Render Dashboard → Manual Deploy
2. Clicar "Deploy latest commit"

### Problema: Frontend não conecta ao backend

**Solução:**
1. Vercel → Settings → Environment Variables
2. Confirmar `VITE_API_URL = https://h2-8xej.onrender.com/api`
3. Redeploy do frontend

---

## 📊 Monitoramento Pós-Deploy

### Logs do Frontend (Vercel)
```
https://vercel.com/dashboard → Logs
- Ver erros de build
- Ver erros de runtime
- Ver requisições
```

### Logs do Backend (Render)
```
https://dashboard.render.com → Logs
- Ver requisições HTTP
- Ver erros do servidor
- Ver queries do banco
```

### Métricas
```
Vercel: Analytics → Page views, errors, performance
Render: Metrics → CPU, memory, response time
Neon: Dashboard → Connections, queries
```

---

## 🔄 Rollback (Se Algo Der Errado)

### Rollback Frontend (Vercel)
```
1. Vercel Dashboard → Deployments
2. Localizar deploy anterior (que funcionava)
3. Clicar "..." → "Promote to Production"
4. Confirmar
```

### Rollback Backend (Render)
```
1. Render Dashboard → Deployments
2. Localizar deploy anterior
3. Clicar "Redeploy"
4. Aguardar
```

### Rollback Banco (Neon)
```
1. Neon Console → Branches
2. Restaurar backup anterior
3. Ou criar novo branch do ponto anterior
```

---

## ✅ Checklist Final de Deploy

### Pré-Deploy
- [ ] Código testado localmente no Replit
- [ ] Todas funcionalidades verificadas
- [ ] Sem erros no console do navegador
- [ ] Sem erros nos logs do servidor

### GitHub
- [ ] Arquivos atualizados no repositório
- [ ] Commit com mensagem descritiva
- [ ] Push para branch `main`

### Deploy
- [ ] Vercel: Build concluído (status "Ready")
- [ ] Render: Deploy concluído (status "Live")
- [ ] Variáveis de ambiente verificadas (ambos)
- [ ] Migração do banco executada (se necessário)

### Testes
- [ ] Login funcionando
- [ ] Criar convite funcionando
- [ ] Listar convites funcionando
- [ ] Deletar convite funcionando (NOVO)
- [ ] Link de convite funcionando
- [ ] Sem erros no console
- [ ] Sem erros nos logs

### Pós-Deploy
- [ ] Monitorar logs por 15 minutos
- [ ] Verificar métricas (sem picos de erro)
- [ ] Comunicar equipe que deploy foi concluído
- [ ] Documentar qualquer problema encontrado

---

## 📞 Suporte

**Vercel:** https://vercel.com/support  
**Render:** https://render.com/docs/support  
**Neon:** https://neon.tech/docs/introduction

**Repositório:** https://github.com/Luiz1976/H2

---

## 📚 Documentação Adicional

Consulte também:
- `VARIAVEIS_AMBIENTE.md` - Lista completa de variáveis
- `ATUALIZACAO_PRODUCAO.md` - Detalhes técnicos das mudanças
- `DEPLOY_REPLIT.md` - Deploy no Replit (se necessário)

---

**Última atualização:** 07/11/2025  
**Versão:** 1.0 Final  
**Status:** ✅ Pronto para Deploy
