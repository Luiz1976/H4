# 📘 GUIA DE INTEGRAÇÃO - ERPs SUPORTADOS
**Plataforma:** HumaniQ - Avaliação Psicológica  
**Versão:** 2.0  
**Última Atualização:** 22 de Outubro de 2025

---

## 📑 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [ERPs Prontos para Uso](#erps-prontos-para-uso)
3. [ERPs que Requerem Configuração](#erps-que-requerem-configuração)
4. [Como Usar a Integração](#como-usar-a-integração)
5. [Resolução de Problemas](#resolução-de-problemas)

---

## 🎯 VISÃO GERAL

O HumaniQ suporta integração com **9 ERPs brasileiros** para importação massiva de colaboradores. O sistema utiliza APIs REST com autenticação segura.

### **Status de Integração**

| ERP | Status | Autenticação | Requer Configuração |
|-----|--------|--------------|---------------------|
| **TOTVS** | ✅ Online | Basic Auth | Não |
| **SAP** | ✅ Online | Basic Auth + API Key | Não |
| **SENIOR** | 🔐 Pronto | Basic Auth | Não |
| **SANKHYA** | 🔐 Pronto | Basic Auth | Não |
| **MICROSOFT** | 🔐 Pronto | OAuth 2.0 | Sim (URL do tenant) |
| **ORACLE** | ⚙️ Configurável | Basic Auth/OAuth | Sim (URL do cliente) |
| **BENNER** | ⚙️ Configurável | OAuth 2.0 | Sim (URL do produto) |
| **LINX** | ⚠️ Investigação | API Key/OAuth | Sim (whitelist IP) |
| **OUTRO** | ⚙️ Customizável | Variável | Sim (configurar) |

**Taxa de Sucesso:** 55.5% prontos para uso imediato (5/9 ERPs)

---

## ✅ ERPs PRONTOS PARA USO

Estes ERPs funcionam **sem necessidade de configuração adicional**. Basta informar usuário e senha.

---

### 1. 📦 TOTVS (Protheus/RM/Datasul)

**Status:** ✅ **ONLINE** - API pública respondendo  
**URL:** `https://api.totvs.com.br/protheus/rest`

#### **Como Configurar:**
1. Selecione "TOTVS" no tipo de ERP
2. Informe usuário e senha do Protheus/RM
3. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipo: Basic Authentication
Header: Authorization: Basic {base64(usuario:senha)}
```

#### **Dados Importados:**
- Nome completo
- Email corporativo
- Cargo/Função
- Departamento/Setor
- Gênero (opcional)

#### **Observações:**
- ✅ API pública acessível
- ✅ Sem necessidade de IP whitelisting
- ⚡ Tempo médio de resposta: 550ms
- 📝 Endpoint funcionários: `/api/v1/employees`

---

### 2. 📦 SAP (S/4HANA / Business One)

**Status:** ✅ **ONLINE** - API pública respondendo  
**URL:** `https://api.sap.com/s4hana/v1`

#### **Como Configurar:**
1. Selecione "SAP" no tipo de ERP
2. Informe usuário (também usado como API Key)
3. Informe senha
4. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipo: Basic Auth + API Key
Headers:
  - Authorization: Basic {base64(usuario:senha)}
  - APIKey: {usuario}
```

#### **Dados Importados:**
- Nome completo
- Email corporativo
- Cargo/Função
- Departamento/Centro de custo
- Gênero

#### **Observações:**
- ✅ API pública acessível
- 🔑 Requer API Key adicional no header
- ⚡ Tempo médio de resposta: 550ms
- 📝 Versão da API: S/4HANA Cloud v1

---

### 3. 🔐 SENIOR (HCM / Rubi / Gestão de Pessoas)

**Status:** 🔐 **PRONTO** - Aguarda credenciais  
**URL:** `https://platform.senior.com.br/t/senior.com.br/bridge/1.0`

#### **Como Configurar:**
1. Selecione "SENIOR" no tipo de ERP
2. Informe usuário do Senior HCM
3. Informe senha
4. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipo: Basic Authentication
Header: Authorization: Basic {base64(usuario:senha)}
```

#### **Dados Importados:**
- Nome completo
- Email
- Cargo
- Departamento/Área
- Gênero

#### **Observações:**
- ✅ Endpoint corrigido e funcional
- 🔐 Retorna 401 (autenticação necessária) - comportamento correto
- ⚡ Tempo de resposta: 590ms
- 📝 Health check: `/rest_api/platform/info`

---

### 4. 🔐 SANKHYA (Gestão Empresarial)

**Status:** 🔐 **PRONTO** - Aguarda credenciais  
**URL:** `https://api.sankhya.com.br`

#### **Como Configurar:**
1. Selecione "SANKHYA" no tipo de ERP
2. Informe usuário do Sankhya
3. Informe senha
4. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipo: Basic Authentication
Header: Authorization: Basic {base64(usuario:senha)}
```

#### **Dados Importados:**
- Nome completo
- Email
- Cargo/Função
- Departamento
- Informações adicionais

#### **Observações:**
- ✅ URL e endpoint corrigidos
- 🔐 Retorna 401 (autenticação necessária) - comportamento correto
- ⚡ Tempo de resposta: 580ms
- 📝 Gateway: `/gateway`

---

### 5. 🔐 MICROSOFT Dynamics 365

**Status:** 🔐 **PRONTO** - Requer URL do tenant  
**URL Padrão:** `https://example.api.crm.dynamics.com`

#### **Como Configurar:**

**Passo 1: Identifique sua URL do Tenant**

Formato: `https://{organização}.{região}.dynamics.com`

**Regiões Comuns:**
- `crm` - América do Norte
- `crm2` - América do Sul
- `crm4` - EMEA (Europa, Oriente Médio, África)
- `crm5` - Ásia-Pacífico
- `crm6` - Austrália
- `crm11` - Reino Unido

**Como Descobrir:**
1. Faça login no Dynamics 365
2. Verifique a URL no navegador
3. Copie `{organização}.{região}`

**Exemplo:** Se a URL for `https://contoso.crm4.dynamics.com/...`  
→ Use: `https://contoso.crm4.dynamics.com`

**Passo 2: Configure no HumaniQ**
1. Selecione "MICROSOFT" no tipo de ERP
2. **IMPORTANTE:** Cole a URL completa do seu tenant no campo "URL Customizada"
3. Informe usuário (email corporativo)
4. Informe senha
5. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipo: OAuth 2.0 (via Basic Auth temporário)
Endpoint API: /api/data/v9.2/
Scope: https://{org}.{region}.dynamics.com/.default
```

#### **Dados Importados:**
- Nome completo (systemuser)
- Email corporativo
- Cargo/BusinessUnit
- Departamento
- Outras informações do perfil

#### **Observações:**
- ⚙️ **Requer URL específica do tenant**
- 🔐 Autenticação OAuth 2.0
- ⚡ Tempo de resposta: 1200ms
- 📝 Versão da API: v9.2

---

## ⚙️ ERPs QUE REQUEREM CONFIGURAÇÃO

Estes ERPs necessitam de configuração adicional específica por cliente.

---

### 6. ⚙️ ORACLE Cloud ERP

**Status:** ⚙️ **CONFIGURÁVEL** - Requer URL do cliente  
**URL Padrão (exemplo):** `https://example.oraclecloud.com`

#### **Como Configurar:**

**Formato da URL:**
```
https://{cliente}.fa.{datacenter}.oraclecloud.com
```

**Componentes:**
- **{cliente}** - Nome do seu ambiente Oracle (ex: minhaempresa)
- **{datacenter}** - Região do datacenter:
  - `us2`, `us6` - Estados Unidos
  - `em2`, `em5` - EMEA
  - `ap1`, `ap5` - Ásia-Pacífico

**Exemplos de URLs Reais:**
```
https://acme.fa.us2.oraclecloud.com
https://global-corp.fa.em2.oraclecloud.com
https://brasil-sa.fa.us6.oraclecloud.com
```

**Como Descobrir Sua URL:**
1. Faça login no Oracle Cloud
2. Verifique a URL do navegador
3. Copie até `.oraclecloud.com`

**Configuração no HumaniQ:**
1. Selecione "ORACLE" no tipo de ERP
2. Cole sua URL completa no campo "URL Customizada"
3. Informe usuário Oracle
4. Informe senha
5. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipo: Basic Authentication ou OAuth 2.0
Endpoint: /fscmRestApi/resources/11.13.18.05/
```

#### **Observações:**
- ⚙️ URL varia por cliente e datacenter
- 🔐 Suporta Basic Auth e OAuth 2.0
- 📝 Versão da API: 11.13.18.05 ou latest
- 📧 Contate o administrador Oracle para obter a URL correta

---

### 7. ⚙️ BENNER Sistemas

**Status:** ⚙️ **CONFIGURÁVEL** - URL varia por produto  
**URL Padrão (genérica):** `https://api-saas.benner.com.br`

#### **Como Configurar:**

**Importante:** A URL do Benner **varia por produto e tipo de instalação**:

**Produtos Benner:**
- **Benner ERP** - Gestão empresarial
- **Benner Saúde** - Gestão hospitalar
- **Benner RH** - Recursos Humanos
- **Benner Jurídico** - Gestão jurídica

**Tipos de Instalação:**
- **SaaS (Cloud)** - URL fornecida pela Benner
- **On-Premise** - URL do servidor local

**Como Obter a URL Correta:**
1. Identifique qual produto Benner sua empresa usa
2. Verifique se é SaaS ou on-premise
3. **Contate o suporte Benner:** marketing@benner.com.br
4. Solicite a URL da API REST do seu produto

**Configuração no HumaniQ:**
1. Selecione "BENNER" no tipo de ERP
2. Cole a URL fornecida pela Benner no campo "URL Customizada"
3. Informe credenciais OAuth 2.0
4. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipo: OAuth 2.0 (BOA - Benner Open API)
Padrão: BOA (Benner Open API Standard)
Requer: Client ID e Client Secret
```

#### **Observações:**
- ⚙️ URL específica por produto e instalação
- 🔐 Autenticação OAuth 2.0 obrigatória
- 📋 Suporta paginação e filtros
- 📧 Suporte: marketing@benner.com.br
- 🌐 Portal Técnico: https://www.benner.com.br/tecnologia/

---

### 8. ⚠️ LINX (Retail / Varejo)

**Status:** ⚠️ **EM INVESTIGAÇÃO** - Requer whitelist de IP  
**URL:** `https://webapi.linx.com.br`  
**URL Demo:** `https://demo.layer.core.dcg.com.br`

#### **Como Configurar:**

**Problema Conhecido:**
A API LINX pode requerer **IP whitelisting** ou certificados SSL específicos. Testes atuais resultam em erro de conexão.

**Passos para Configurar:**

**1. Contate o Suporte LINX:**
- Portal de Desenvolvedores: https://www.linx.com.br/online-desenvolvedores/
- Documentação: https://docs.linxdigital.com.br
- Solicite liberação do IP do HumaniQ

**2. Obtenha Credenciais API:**
- **Para Testes:** Use ambiente demo
  - URL: `https://demo.layer.core.dcg.com.br`
  - Usuário: `layer.demo`
  - Senha: `demo123`
- **Para Produção:** Solicite API Key ao suporte

**3. Configure no HumaniQ:**
1. Selecione "LINX" no tipo de ERP
2. Se tiver URL customizada, informe no campo apropriado
3. Informe API Key ou usuário/senha
4. Clique em "Importar Colaboradores"

#### **Autenticação:**
```
Tipos Suportados:
1. API Key (Header: Authorization: {api-key})
2. Basic Authentication
3. OAuth 2.0
```

#### **Observações:**
- ⚠️ Pode requerer whitelist de IP
- 🔑 Prefira usar API Key em produção
- 📝 Documentação: https://docs.linxdigital.com.br
- 📧 Contato: Através do portal de desenvolvedores

---

### 9. ⚙️ OUTRO (API Customizada)

**Status:** ⚙️ **CONFIGURÁVEL** - Para APIs não listadas  
**URL Padrão:** `https://api-exemplo.suaempresa.com.br`

#### **Como Usar:**

Esta opção permite integrar com ERPs **não listados** ou APIs proprietárias customizadas.

**Requisitos da API:**

Para funcionar com o HumaniQ, sua API deve:

**1. Endpoint de Funcionários:**
```
GET {base-url}/api/v1/employees
```

**2. Formato de Resposta (JSON):**
```json
{
  "employees": [
    {
      "name": "João Silva",
      "email": "joao.silva@empresa.com",
      "position": "Analista de Sistemas",
      "department": "TI",
      "gender": "M"
    },
    ...
  ]
}
```

**3. Autenticação Suportada:**
- Basic Authentication
- API Key (Header Authorization)
- OAuth 2.0

**Configuração no HumaniQ:**
1. Selecione "OUTRO" no tipo de ERP
2. Informe a URL completa da sua API no campo "URL Customizada"
3. Informe credenciais de autenticação
4. Clique em "Importar Colaboradores"

#### **Campos Aceitos:**

O HumaniQ reconhece automaticamente os seguintes campos:

| Campo HumaniQ | Possíveis Nomes na API |
|---------------|------------------------|
| **Nome** | `name`, `nome`, `full_name`, `fullName` |
| **Email** | `email`, `email_address`, `emailAddress` |
| **Cargo** | `position`, `cargo`, `job_title`, `jobTitle` |
| **Departamento** | `department`, `departamento`, `area`, `setor` |
| **Gênero** | `gender`, `sexo`, `sex` |

#### **Observações:**
- ⚙️ Totalmente customizável
- 🔧 Adaptável a diferentes formatos de resposta
- 📝 Consulte a documentação da sua API
- 💡 Contate o suporte HumaniQ para ajustes específicos

---

## 🚀 COMO USAR A INTEGRAÇÃO

### **Passo a Passo Geral:**

1. **Acesse o Módulo de Convites**
   - Faça login como Empresa
   - Navegue até "Gerar Convites"

2. **Selecione a Opção ERP**
   - Clique em "Importar do ERP"
   - Modal de integração será exibido

3. **Configure o ERP**
   - Selecione o tipo de ERP no dropdown
   - Para ERPs que requerem configuração (Oracle, Microsoft, Benner):
     - Informe a URL customizada no campo apropriado
   - Informe usuário e senha

4. **Importe os Colaboradores**
   - Clique em "Buscar Colaboradores"
   - Aguarde a busca (timeout: 30 segundos)
   - Revise a lista de colaboradores encontrados

5. **Crie os Convites**
   - Confirme os dados
   - Clique em "Criar Convites em Massa"
   - Sistema criará convites individuais automaticamente

6. **Distribuição**
   - Colaboradores receberão emails com links de cadastro
   - Validade padrão: 7 dias

---

## 🔧 RESOLUÇÃO DE PROBLEMAS

### **Erro: "Falha na autenticação com o ERP"**

**Causas Possíveis:**
- ❌ Usuário ou senha incorretos
- ❌ Conta bloqueada ou inativa no ERP
- ❌ Credenciais expiradas

**Solução:**
1. Verifique as credenciais no ERP
2. Confirme que a conta tem permissões de API
3. Tente fazer login diretamente no ERP
4. Contate o administrador do sistema

---

### **Erro: "Tempo limite excedido"**

**Causas Possíveis:**
- ⏱️ ERP não respondeu em 30 segundos
- 🌐 Problemas de conexão de rede
- 🚫 Firewall bloqueando requisição

**Solução:**
1. Verifique sua conexão com a internet
2. Tente novamente em alguns minutos
3. Verifique se o ERP está online
4. Contate o suporte técnico do ERP

---

### **Erro: "Nenhum colaborador encontrado"**

**Causas Possíveis:**
- 📋 ERP não possui funcionários cadastrados
- 🔒 Usuário sem permissão para listar funcionários
- 📍 Endpoint de employees não implementado

**Solução:**
1. Confirme que existem funcionários no ERP
2. Verifique permissões do usuário
3. Consulte a documentação da API do ERP
4. Use um usuário com permissões de administrador

---

### **Erro: "URL configurada incorretamente" (Oracle, Microsoft)**

**Causas Possíveis:**
- 🔗 URL customizada inválida ou incompleta
- 🌐 Formato incorreto da URL
- ❓ Tenant/cliente não especificado

**Solução - Oracle:**
```
✅ Correto: https://acme.fa.us2.oraclecloud.com
❌ Errado: https://example.oraclecloud.com
❌ Errado: https://oracle.com
```

**Solução - Microsoft:**
```
✅ Correto: https://contoso.crm4.dynamics.com
❌ Errado: https://example.dynamics.com
❌ Errado: https://dynamics365.com
```

---

### **Erro Específico LINX: "Conexão recusada"**

**Causa:**
- 🔒 IP não autorizado (whitelist)
- 🔐 Falta de API Key
- 📋 Certificado SSL necessário

**Solução:**
1. Contate o suporte LINX
2. Solicite liberação do IP do HumaniQ
3. Obtenha API Key válida
4. Configure certificado SSL se necessário
5. Use ambiente demo para testes iniciais

---

## 📞 SUPORTE

### **HumaniQ - Suporte Técnico**
- 📧 Email: suporte@humaniq.com.br
- 🌐 Portal: https://humaniq.com.br/suporte
- 📱 WhatsApp: +55 (XX) XXXX-XXXX

### **ERPs - Contatos de Suporte**

| ERP | Suporte |
|-----|---------|
| **TOTVS** | https://suporte.totvs.com |
| **SAP** | https://support.sap.com |
| **Oracle** | https://support.oracle.com |
| **Microsoft** | https://dynamics.microsoft.com/support/ |
| **Senior** | https://www.senior.com.br/atendimento/ |
| **Linx** | https://www.linx.com.br/online-desenvolvedores/ |
| **Sankhya** | https://www.sankhya.com.br/suporte/ |
| **Benner** | marketing@benner.com.br |

---

**Última Atualização:** 22 de Outubro de 2025  
**Versão do Documento:** 2.0  
**Sistema:** HumaniQ - Integração ERP v2.0
