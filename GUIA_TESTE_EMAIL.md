# 📧 Guia de Teste - Sistema de Email SendGrid

**Data:** 29 de outubro de 2025  
**Status:** ✅ SendGrid Configurado e Integrado

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Serviço de Email** (`server/services/emailService.ts`)
- ✅ Cliente SendGrid configurado com autenticação Replit Connectors
- ✅ Função genérica `enviarEmail()` para qualquer tipo de email
- ✅ Template profissional para convite de empresa
- ✅ Template profissional para convite de colaborador
- ✅ Template de boas-vindas

### 2. **Integração Automática**
- ✅ Emails enviados automaticamente ao criar convites
- ✅ Envio assíncrono (não bloqueia a API)
- ✅ Logs detalhados de sucesso/falha

### 3. **Endpoints de Teste** (`/api/email/*`)
- ✅ `POST /api/email/test-email` - Testar envio de emails
- ✅ `GET /api/email/email-status` - Verificar status da configuração

---

## 🚀 COMO TESTAR O SISTEMA

### **Opção 1: Testar via Dashboard Admin**

1. **Faça login como Admin** no sistema
2. **Crie um convite de empresa:**
   - Vá para `/admin/convites`
   - Clique em "Criar Convite"
   - Preencha os dados
   - **Use seu email real no campo "Email de Contato"**
   - Clique em "Enviar Convite"

3. **Verifique:**
   - ✅ Convite criado com sucesso
   - ✅ Mensagem "Email enviado" aparece
   - ✅ **Verifique sua caixa de entrada** (pode levar 1-2 minutos)
   - ⚠️ Verifique também a pasta de SPAM

---

### **Opção 2: Testar via API (Recomendado)**

#### **Passo 1: Obter Token de Admin**

```bash
# Fazer login como admin
curl -X POST https://seu-dominio.replit.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@humaniq.com",
    "password": "sua-senha-admin"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**Copie o token** para usar nos próximos passos.

---

#### **Passo 2: Verificar Status do SendGrid**

```bash
curl -X GET https://seu-dominio.replit.dev/api/email/email-status \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta Esperada:**
```json
{
  "configured": true,
  "connectorHostname": true,
  "hasReplIdentity": true,
  "message": "✅ SendGrid está configurado e pronto para uso"
}
```

---

#### **Passo 3: Enviar Email de Teste**

**Teste Simples:**
```bash
curl -X POST https://seu-dominio.replit.dev/api/email/test-email \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "teste-simples",
    "emailDestino": "seu-email@gmail.com"
  }'
```

**Teste de Convite Empresa:**
```bash
curl -X POST https://seu-dominio.replit.dev/api/email/test-email \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "convite-empresa",
    "emailDestino": "seu-email@gmail.com"
  }'
```

**Teste de Convite Colaborador:**
```bash
curl -X POST https://seu-dominio.replit.dev/api/email/test-email \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "convite-colaborador",
    "emailDestino": "seu-email@gmail.com"
  }'
```

**Tipos disponíveis:**
- `teste-simples` - Email básico de teste
- `convite-empresa` - Template completo de convite empresa
- `convite-colaborador` - Template completo de convite colaborador
- `boas-vindas-empresa` - Email de boas-vindas empresa
- `boas-vindas-colaborador` - Email de boas-vindas colaborador

---

## 🎨 TEMPLATES DE EMAIL

### **Convite Empresa**
- Design profissional com gradiente azul-roxo
- Logo HQ (HumaniQ AI)
- Informações sobre a plataforma
- Call-to-action destacado
- Link direto do convite
- Footer institucional

### **Convite Colaborador**
- Design similar ao de empresa
- Personalizado com nome do colaborador e empresa
- Lista de benefícios de participar
- Aviso de privacidade e confidencialidade
- Call-to-action para começar

---

## ✅ CHECKLIST DE VALIDAÇÃO

Marque conforme testar:

- [ ] **Status do SendGrid:** API retorna `configured: true`
- [ ] **Email de teste simples:** Recebido na caixa de entrada
- [ ] **Email convite empresa:** Recebido com template correto
- [ ] **Email convite colaborador:** Recebido com template correto
- [ ] **Links funcionando:** Clicar no botão redireciona corretamente
- [ ] **Design responsivo:** Email visualizado bem em mobile
- [ ] **Não cai em spam:** Email chegou na caixa principal (não spam)

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### **Problema: "SendGrid not connected"**

**Solução:**
1. Verifique se a integração SendGrid está ativa no Replit
2. Vá em Secrets e confirme que as chaves SendGrid existem
3. Reinicie o workflow

### **Problema: Email não chega**

**Verificações:**
1. ✅ Verifique a pasta de SPAM
2. ✅ Aguarde até 5 minutos (pode demorar)
3. ✅ Verifique os logs do servidor:
   ```bash
   # Procure por:
   # ✅ Email de convite enviado para: email@exemplo.com
   # ❌ Erro ao enviar email de convite
   ```
4. ✅ Teste com outro endereço de email (Gmail, Outlook)

### **Problema: "X_REPLIT_TOKEN not found"**

**Solução:**
- Isso é normal em ambiente local
- O SendGrid só funciona quando deployado no Replit
- Para testar localmente, você precisaria usar uma API key diretamente

### **Problema: Email cai em SPAM**

**Soluções:**
1. **Curto prazo:** Marque como "Não é spam" no email
2. **Longo prazo:** Configure autenticação de domínio no SendGrid (DKIM/SPF)
   - Vá no painel SendGrid → Settings → Sender Authentication
   - Siga as instruções de configuração DNS

---

## 📊 LOGS E MONITORAMENTO

### **Ver Logs em Tempo Real**

No terminal do Replit, você verá:

```
✅ [EmailService] Email enviado com sucesso para: email@exemplo.com
✅ Email de convite enviado para: email@exemplo.com
```

Ou em caso de erro:

```
❌ [EmailService] Erro ao enviar email: [detalhes]
⚠️ Falha ao enviar email de convite para: email@exemplo.com
```

---

## 🎯 PRÓXIMOS PASSOS

### **Para Produção:**

1. **Configurar Domínio Próprio** (Opcional)
   - Ir para SendGrid → Settings → Sender Authentication
   - Adicionar registros DNS (CNAME)
   - Emails virão de `noreply@humaniq.com.br`

2. **Monitorar Taxa de Entrega**
   - Acessar Dashboard SendGrid
   - Verificar métricas de entrega
   - Ajustar templates se necessário

3. **Implementar Retry Logic** (Futuro)
   - Reenviar automaticamente se falhar
   - Fila de emails com retry exponencial

4. **Templates Dinâmicos** (Futuro)
   - Usar SendGrid Dynamic Templates
   - Editor visual de emails
   - Personalização avançada

---

## 📞 SUPORTE

**Se tudo funcionar:** 🎉 Parabéns! O sistema de email está operacional!

**Se tiver problemas:**
1. Verifique este guia novamente
2. Consulte logs do servidor
3. Teste com email diferente
4. Verifique configurações SendGrid no Replit

---

**Última atualização:** 29/10/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Produção
