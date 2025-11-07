# 🚀 Guia de Atualização da Produção - HumaniQ AI
## Atualizar www.humaniqai.com.br com as Melhorias Implementadas

Data: 07/11/2025

---

## 📋 Resumo das Mudanças

Foram implementadas as seguintes melhorias no sistema de convites:

### ✅ Correções Implementadas:

1. **API Service** - Corrigida estrutura de resposta (`response.convite` → `response.data`)
2. **Exclusão de Convites** - Implementada exclusão usando token ao invés de ID
3. **Endpoint DELETE** - Novo endpoint `/api/convites/colaborador/:token`
4. **Interface de Gestão** - Melhorias na UI de gestão de convites
5. **Validações** - Validações aprimoradas no backend

---

## 📁 Arquivos Modificados

### Frontend (`src/`)
```
✓ src/services/apiService.ts              - Corrigida estrutura de resposta
✓ src/pages/empresa/EmpresaGerarConvite.tsx      - Ajustes na criação
✓ src/pages/empresa/EmpresaGestaoConvites.tsx    - Nova funcionalidade de exclusão
✓ src/pages/empresa/EmpresaConvites.tsx          - Melhorias UI
```

### Backend (`server/`)
```
✓ server/routes/convites.ts                - Novo endpoint DELETE e validações
✓ server/routes/admin.ts                   - Melhorias em analytics
✓ server/index.ts                          - Ajustes gerais
```

### Schema/Database
```
✓ shared/schema.ts                         - Schema atualizado (se houver mudanças)
```

---

## 🔄 Plano de Atualização

### Opção 1: Atualização Manual via GitHub (RECOMENDADO)

Como o Git local tem conflitos, a forma mais segura é atualizar manualmente:

#### Passo 1: Backup
1. Faça backup do código atual em produção
2. Faça backup do banco de dados Neon

#### Passo 2: Atualizar Arquivos no GitHub

Você tem 3 opções:

**A) Via GitHub Web Interface:**
1. Acesse https://github.com/Luiz1976/H2
2. Para cada arquivo modificado, clique em "Edit" e cole o novo conteúdo
3. Commit cada arquivo com mensagem descritiva

**B) Via Git Clone Limpo:**
```bash
# Em um novo diretório local (não no Replit)
git clone https://github.com/Luiz1976/H2.git
cd H2

# Copiar os arquivos modificados do Replit para este diretório
# Use SCP, SFTP, ou copie manualmente

# Commit e push
git add .
git commit -m "feat: corrigir sistema de convites - exclusão por token e apiService"
git push origin main
```

**C) Via Replit (Resolver Conflitos):**
```bash
# Resetar para estado limpo (CUIDADO: perde mudanças não commitadas)
git reset --hard origin/main

# Aplicar mudanças manualmente nos arquivos
# Depois commit
git add src/services/apiService.ts src/pages/empresa/*.tsx server/routes/convites.ts
git commit -m "feat: corrigir sistema de convites"
git push origin main
```

#### Passo 3: Deploy Automático

Após push para o GitHub:

**Vercel (Frontend)**
- Deploy automático será acionado
- Monitore em: https://vercel.com/dashboard
- Aguarde ~2-3 minutos

**Render (Backend)**
- Deploy automático será acionado
- Monitore em: https://dashboard.render.com
- Aguarde ~5-7 minutos

---

### Opção 2: Download e Upload Manual

Se preferir evitar Git:

#### Arquivos para Baixar do Replit e Upload no GitHub:

1. **src/services/apiService.ts**
2. **src/pages/empresa/EmpresaGerarConvite.tsx**
3. **src/pages/empresa/EmpresaGestaoConvites.tsx**
4. **src/pages/empresa/EmpresaConvites.tsx**
5. **server/routes/convites.ts**

Para cada arquivo:
1. Abra o arquivo no Replit
2. Copie todo o conteúdo (Ctrl+A, Ctrl+C)
3. No GitHub, navegue até o arquivo
4. Clique em "Edit" (ícone de lápis)
5. Cole o novo conteúdo
6. Commit com mensagem descritiva

---

## 🗄️ Migração do Banco de Dados Neon

### Verificar se Há Mudanças no Schema

Se o arquivo `shared/schema.ts` foi modificado, você precisa migrar o banco Neon.

#### Opção 1: Via Replit (se conectar ao Neon)

1. Configure a variável `DATABASE_URL` com a connection string do Neon:
```
DATABASE_URL=postgresql://usuario:senha@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

2. Execute a migração:
```bash
npm run db:push
```

#### Opção 2: Via Render (Backend)

Após o deploy do backend no Render:

1. Acesse o shell do Render:
   - Dashboard Render → Seu serviço → Shell
   
2. Execute:
```bash
npm run db:push
```

3. Confirme se solicitado

#### Opção 3: SQL Manual (se necessário)

Se preferir executar SQL manualmente no Neon:

1. Acesse https://console.neon.tech
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Execute as queries necessárias (veja seção SQL abaixo)

---

## 🔐 Variáveis de Ambiente

### Vercel (Frontend)

Certifique-se de que estas variáveis estão configuradas:

```bash
VITE_API_URL=https://h2-8xej.onrender.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

**Como verificar:**
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto HumaniQ
3. Settings → Environment Variables
4. Verifique se `VITE_API_URL` aponta para o backend do Render

### Render (Backend)

Certifique-se de que estas variáveis estão configuradas:

```bash
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
JWT_SECRET=seu_jwt_secret
GOOGLE_API_KEY=sua_google_api_key
STRIPE_SECRET_KEY=sk_live_...
FRONTEND_URL=https://www.humaniqai.com.br
CORS_ORIGIN=https://www.humaniqai.com.br
```

**Como verificar:**
1. Acesse https://dashboard.render.com
2. Selecione o serviço do backend
3. Environment → Environment Variables
4. Verifique se todas as variáveis necessárias estão presentes

**IMPORTANTE:** Verifique se `FRONTEND_URL` está configurado corretamente, pois ele é usado nos links de convite!

---

## 📝 Mudanças Detalhadas por Arquivo

### 1. src/services/apiService.ts

**Problema:** API retornava `response.convite` mas código esperava `response.data`

**Correção:**
```typescript
// ANTES
return response.convite;

// DEPOIS
return response.data;
```

**Locais afetados:**
- `criarConviteEmpresa()`
- `criarConviteColaborador()`
- Outros endpoints de convite

### 2. server/routes/convites.ts

**Adicionado:** Novo endpoint DELETE por token

```typescript
// Novo endpoint
router.delete('/colaborador/:token', async (req, res) => {
  const { token } = req.params;
  // Lógica de exclusão usando token
});
```

**Validações adicionadas:**
- Verificar se convite existe
- Verificar se convite pertence à empresa
- Validar status do convite

### 3. src/pages/empresa/EmpresaGestaoConvites.tsx

**Adicionado:** 
- Botão de exclusão de convites
- Confirmação via Dialog
- Integração com novo endpoint DELETE

**Comportamento:**
- Botão só aparece para convites com status "Pendente"
- Confirmação antes de deletar
- Atualiza lista automaticamente após exclusão

---

## ✅ Checklist de Atualização

### Antes do Deploy

- [ ] Backup do código em produção
- [ ] Backup do banco de dados Neon
- [ ] Revisar todas as mudanças
- [ ] Confirmar variáveis de ambiente

### GitHub

- [ ] Código atualizado no repositório Luiz1976/H2
- [ ] Commit com mensagem descritiva
- [ ] Push para branch `main`

### Deploy Vercel (Frontend)

- [ ] Deploy automático iniciado
- [ ] Build concluído sem erros
- [ ] Preview disponível
- [ ] Promovido para produção
- [ ] `VITE_API_URL` aponta para Render correto

### Deploy Render (Backend)

- [ ] Deploy automático iniciado
- [ ] Build concluído sem erros
- [ ] Serviço rodando (status: "Live")
- [ ] Variáveis de ambiente configuradas
- [ ] `FRONTEND_URL` = https://www.humaniqai.com.br

### Banco de Dados Neon

- [ ] Migração executada (se necessário)
- [ ] Tabelas atualizadas
- [ ] Dados preservados
- [ ] Conexão funcionando

### Testes em Produção

- [ ] Login de empresa funcionando
- [ ] Criação de convite funcionando
- [ ] Lista de convites carregando
- [ ] Exclusão de convite funcionando
- [ ] Link de convite funcionando
- [ ] Email de convite enviado (se aplicável)

---

## 🧪 Como Testar Após Deploy

### 1. Testar Login
```
1. Acesse https://www.humaniqai.com.br
2. Faça login como empresa
3. Verifique se entra no dashboard
```

### 2. Testar Criação de Convite
```
1. Vá em "Gerar Convite" ou "Convites"
2. Preencha formulário de novo convite
3. Clique em "Enviar Convite"
4. Verifique se aparece na lista
```

### 3. Testar Exclusão de Convite
```
1. Na lista de convites
2. Localize convite com status "Pendente"
3. Clique no botão de deletar (lixeira)
4. Confirme a exclusão
5. Verifique se sumiu da lista
```

### 4. Testar Link de Convite
```
1. Copie o link de um convite
2. Abra em aba anônima
3. Verifique se abre a página de aceite
4. Complete o fluxo de aceite
```

### 5. Verificar Console do Navegador
```
1. Abra DevTools (F12)
2. Vá em "Console"
3. Verifique se não há erros
4. Faça ações (criar, deletar convites)
5. Confirme que não há erros 404 ou 500
```

---

## 🐛 Troubleshooting

### Problema: Deploy não inicia automaticamente

**Solução:**
- Vercel: Vá em Deployments → Redeploy
- Render: Vá em Manual Deploy → Deploy latest commit

### Problema: Erro 404 ao deletar convite

**Solução:**
- Verifique se o backend foi atualizado
- Verifique logs do Render
- Confirme que endpoint `/api/convites/colaborador/:token` existe

### Problema: Frontend não se conecta ao backend

**Solução:**
- Verifique `VITE_API_URL` no Vercel
- Deve ser: `https://h2-8xej.onrender.com/api`
- Redeploy do frontend após corrigir

### Problema: CORS Error

**Solução:**
- Verifique `CORS_ORIGIN` no Render
- Deve incluir: `https://www.humaniqai.com.br`
- Pode ser lista separada por vírgula se múltiplos domínios

### Problema: Links de convite com domínio errado

**Solução:**
- Verifique `FRONTEND_URL` no Render
- Deve ser: `https://www.humaniqai.com.br`
- Redeploy do backend após corrigir

---

## 📊 Monitoramento Pós-Deploy

### Logs do Frontend (Vercel)

```
1. Acesse https://vercel.com/dashboard
2. Selecione projeto
3. Vá em "Logs"
4. Monitore erros em tempo real
```

### Logs do Backend (Render)

```
1. Acesse https://dashboard.render.com
2. Selecione serviço
3. Vá em "Logs"
4. Monitore requisições e erros
```

### Métricas

- **Vercel:** Analytics → Page views, errors
- **Render:** Metrics → CPU, Memory, Response time
- **Neon:** Dashboard → Queries, Connections

---

## 🔄 Rollback (Se Necessário)

Se algo der errado:

### Rollback Frontend (Vercel)
```
1. Vercel Dashboard → Deployments
2. Localize deploy anterior (que funcionava)
3. Clique nos 3 pontinhos → "Promote to Production"
```

### Rollback Backend (Render)
```
1. Render Dashboard → Deployments
2. Localize deploy anterior
3. Clique em "Redeploy"
```

### Rollback Banco de Dados (Neon)
```
1. Neon Console → Branches
2. Restaure backup anterior
```

---

## 📞 Contatos de Suporte

- **Vercel:** https://vercel.com/support
- **Render:** https://render.com/docs/support
- **Neon:** https://neon.tech/docs/introduction

---

## 📎 Anexos

### Principais Endpoints Afetados

```
POST   /api/convites/empresa                - Criar convite empresa
POST   /api/convites/colaborador            - Criar convite colaborador
GET    /api/convites/listar                 - Listar convites
GET    /api/convites/token/:token           - Buscar convite por token
DELETE /api/convites/colaborador/:token     - Deletar convite (NOVO)
DELETE /api/convites/empresa/:token         - Deletar convite empresa (NOVO)
```

### Estrutura de Resposta Padronizada

**Sucesso:**
```json
{
  "success": true,
  "message": "Convite criado com sucesso",
  "data": {
    "id": "uuid",
    "token": "abc...",
    "email": "email@example.com",
    "status": "pendente",
    "linkConvite": "https://www.humaniqai.com.br/convite/..."
  }
}
```

**Erro:**
```json
{
  "success": false,
  "error": "Descrição do erro",
  "message": "Mensagem amigável"
}
```

---

**Última atualização:** 07/11/2025  
**Versão:** 1.0  
**Autor:** Equipe HumaniQ AI
