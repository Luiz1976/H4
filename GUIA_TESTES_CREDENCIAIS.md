# 🧪 GUIA DE TESTES COM CREDENCIAIS REAIS
**Sistema:** HumaniQ - Módulo de Integração ERP  
**Data:** 22 de Outubro de 2025

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar os testes, você precisará de:

1. ✅ Credenciais válidas de um dos ERPs suportados
2. ✅ Acesso ao sistema ERP (para obter URLs se necessário)
3. ✅ Conta de empresa criada no HumaniQ
4. ✅ Estar logado como usuário tipo "Empresa"

---

## 🚀 COMO TESTAR

### **Passo 1: Acesse o Módulo**

1. Faça login no HumaniQ como **Empresa**
2. Navegue até **"Gerar Convites"**
3. Procure o card **"Integração com ERP"**

---

### **Passo 2: ERPs Prontos (Não Precisam de URL Customizada)**

#### ✅ **TOTVS, SAP, SENIOR, SANKHYA**

**Passos:**
1. Clique em "Conectar ao ERP"
2. Selecione o tipo de ERP no dropdown
3. Informe seu **usuário** do ERP
4. Informe sua **senha** do ERP
5. Clique em "Conectar e Buscar"

**Resultado Esperado:**
- ✅ Sistema conecta automaticamente (URL pré-configurada)
- ✅ Busca colaboradores do ERP
- ✅ Exibe lista para seleção

---

### **Passo 3: Oracle Cloud ERP (Requer URL Customizada)**

#### ⚙️ **ORACLE**

**Como Obter a URL:**

1. Faça login no **Oracle Cloud ERP**
2. Verifique a URL no navegador
3. A URL será algo como:
   ```
   https://acme.fa.us2.oraclecloud.com/fscm/faces/...
   ```
4. Copie até `.oraclecloud.com`:
   ```
   https://acme.fa.us2.oraclecloud.com
   ```

**Formato da URL:**
```
https://{cliente}.fa.{datacenter}.oraclecloud.com
```

**Componentes:**
- `{cliente}` = Nome do seu ambiente (ex: acme, global, brasil)
- `{datacenter}` = Região do servidor:
  - `us2`, `us6` = Estados Unidos
  - `em2`, `em5` = EMEA (Europa)
  - `ap1`, `ap5` = Ásia-Pacífico

**Exemplos Reais:**
```
https://acme.fa.us2.oraclecloud.com
https://global-corp.fa.em2.oraclecloud.com
https://brasil.fa.us6.oraclecloud.com
```

**Passos no HumaniQ:**
1. Clique em "Conectar ao ERP"
2. Selecione **"⚙️ Oracle Cloud ERP (requer URL)"**
3. ℹ️ **APARECERÁ** um campo **"URL do Ambiente Oracle"** com instruções
4. Cole a URL que você copiou (ex: `https://acme.fa.us2.oraclecloud.com`)
5. Informe seu **usuário** Oracle
6. Informe sua **senha** Oracle
7. Clique em "Conectar e Buscar"

**Resultado Esperado:**
- ✅ Sistema usa sua URL customizada
- ✅ Conecta no ambiente correto
- ✅ Busca colaboradores

---

### **Passo 4: Microsoft Dynamics 365 (Requer URL Customizada)**

#### ⚙️ **MICROSOFT**

**Como Obter a URL:**

1. Faça login no **Dynamics 365**
2. Verifique a URL no navegador
3. A URL será algo como:
   ```
   https://contoso.crm4.dynamics.com/main.aspx...
   ```
4. Copie até `.dynamics.com`:
   ```
   https://contoso.crm4.dynamics.com
   ```

**Formato da URL:**
```
https://{organização}.{região}.dynamics.com
```

**Componentes:**
- `{organização}` = Nome da sua organização D365 (ex: contoso, acme)
- `{região}` = Região do servidor:
  - `crm` = América do Norte
  - `crm2` = América do Sul ← **Mais comum no Brasil**
  - `crm4` = EMEA (Europa, Oriente Médio, África)
  - `crm5` = Ásia-Pacífico
  - `crm6` = Austrália
  - `crm11` = Reino Unido

**Exemplos Reais:**
```
https://contoso.crm2.dynamics.com  ← América do Sul
https://acme.crm4.dynamics.com     ← EMEA
https://global.crm.dynamics.com    ← América do Norte
```

**Passos no HumaniQ:**
1. Clique em "Conectar ao ERP"
2. Selecione **"⚙️ Microsoft Dynamics 365 (requer URL)"**
3. ℹ️ **APARECERÁ** um campo **"URL do Tenant Dynamics 365"** com instruções
4. Cole a URL que você copiou (ex: `https://contoso.crm2.dynamics.com`)
5. Informe seu **email corporativo** (usuário Microsoft)
6. Informe sua **senha** Microsoft
7. Clique em "Conectar e Buscar"

**Resultado Esperado:**
- ✅ Sistema usa sua URL customizada
- ✅ Conecta na organização correta
- ✅ Busca colaboradores

---

## 🎯 CHECKLIST DE TESTES

### **Teste Básico (TOTVS ou SAP):**
- [ ] Abrir modal de login ERP
- [ ] Selecionar TOTVS ou SAP
- [ ] Informar credenciais válidas
- [ ] Clicar em "Conectar e Buscar"
- [ ] Verificar lista de colaboradores
- [ ] Selecionar alguns colaboradores
- [ ] Gerar convites em massa
- [ ] Confirmar criação dos convites

### **Teste Oracle:**
- [ ] Fazer login no Oracle Cloud
- [ ] Copiar URL do ambiente (`https://...oraclecloud.com`)
- [ ] Abrir modal no HumaniQ
- [ ] Selecionar "Oracle Cloud ERP (requer URL)"
- [ ] Verificar aparecimento do campo de URL
- [ ] Ler instruções na caixa azul
- [ ] Colar URL copiada
- [ ] Informar usuário e senha Oracle
- [ ] Conectar e buscar
- [ ] Verificar colaboradores encontrados

### **Teste Microsoft:**
- [ ] Fazer login no Dynamics 365
- [ ] Copiar URL da organização (`https://...dynamics.com`)
- [ ] Abrir modal no HumaniQ
- [ ] Selecionar "Microsoft Dynamics 365 (requer URL)"
- [ ] Verificar aparecimento do campo de URL
- [ ] Ler instruções na caixa azul
- [ ] Colar URL copiada
- [ ] Informar email e senha Microsoft
- [ ] Conectar e buscar
- [ ] Verificar colaboradores encontrados

---

## ⚠️ PROBLEMAS COMUNS

### **"Falha na autenticação com o ERP"**

**Causas:**
- ❌ Usuário ou senha incorretos
- ❌ Conta bloqueada/inativa
- ❌ URL incorreta (Oracle/Microsoft)

**Soluções:**
1. Verifique credenciais fazendo login direto no ERP
2. Confirme que a conta está ativa
3. Para Oracle/Microsoft, verifique se a URL está completa e correta

---

### **"Tempo limite excedido"**

**Causas:**
- ⏱️ ERP não respondeu em 30 segundos
- 🌐 Problemas de rede

**Soluções:**
1. Tente novamente em alguns minutos
2. Verifique sua conexão com internet
3. Confirme que o ERP está online

---

### **"Nenhum colaborador encontrado"**

**Causas:**
- 📋 ERP sem funcionários cadastrados
- 🔒 Usuário sem permissão de leitura

**Soluções:**
1. Confirme que existem funcionários no ERP
2. Use usuário com permissões de administrador
3. Verifique permissões do usuário no ERP

---

### **Oracle: "Domínio não encontrado"**

**Causas:**
- 🔗 URL incompleta ou incorreta
- 🌐 Nome do ambiente errado

**Soluções:**
1. Verifique se a URL termina com `.oraclecloud.com`
2. Confirme o nome do ambiente (cliente)
3. Verifique o datacenter (us2, em2, etc.)

**Exemplo de URL Correta:**
```
✅ https://acme.fa.us2.oraclecloud.com
❌ https://oracle.com
❌ https://acme.oraclecloud.com  (falta .fa.us2)
```

---

### **Microsoft: "Domínio não encontrado"**

**Causas:**
- 🔗 URL incompleta ou incorreta
- 🌐 Nome da organização errado

**Soluções:**
1. Verifique se a URL termina com `.dynamics.com`
2. Confirme o nome da organização
3. Verifique a região (crm, crm2, crm4, etc.)

**Exemplo de URL Correta:**
```
✅ https://contoso.crm2.dynamics.com
❌ https://dynamics.com
❌ https://contoso.dynamics.com  (falta .crm2)
```

---

## 📊 ENDPOINTS PARA TESTE DIRETO (Avançado)

Se quiser testar via API diretamente:

### **Teste de Conectividade:**
```bash
curl http://localhost:3001/api/erp/test-connections
```

### **Informações de Configuração:**
```bash
curl http://localhost:3001/api/erp/config-info
```

### **Login e Busca (TOTVS exemplo):**
```bash
curl -X POST http://localhost:3001/api/erp/login-and-fetch \
  -H "Content-Type: application/json" \
  -d '{
    "empresaId": "sua-empresa-id",
    "erpType": "TOTVS",
    "username": "seu-usuario",
    "password": "sua-senha"
  }'
```

### **Login e Busca (Oracle com URL customizada):**
```bash
curl -X POST http://localhost:3001/api/erp/login-and-fetch \
  -H "Content-Type: application/json" \
  -d '{
    "empresaId": "sua-empresa-id",
    "erpType": "ORACLE",
    "customUrl": "https://acme.fa.us2.oraclecloud.com",
    "username": "seu-usuario-oracle",
    "password": "sua-senha-oracle"
  }'
```

### **Login e Busca (Microsoft com URL customizada):**
```bash
curl -X POST http://localhost:3001/api/erp/login-and-fetch \
  -H "Content-Type: application/json" \
  -d '{
    "empresaId": "sua-empresa-id",
    "erpType": "MICROSOFT",
    "customUrl": "https://contoso.crm2.dynamics.com",
    "username": "usuario@empresa.com",
    "password": "sua-senha-microsoft"
  }'
```

---

## 📞 SUPORTE

Se encontrar problemas durante os testes:

1. 📧 Verifique os logs do console do navegador (F12)
2. 📋 Consulte o `GUIA_INTEGRACAO_ERP.md` para detalhes
3. 🔍 Teste conectividade com `GET /api/erp/test-connections`

---

**Boa sorte com os testes!** 🎉

Se conseguir conectar e importar colaboradores com sucesso, o sistema está funcionando perfeitamente!
