# 🤖 AutoZap - Sistema de Automação WhatsApp

Sistema completo para automatizar contatos no WhatsApp com inteligência, incluindo cadastro de leads, questionários e disparos automáticos.

## 🚀 Funcionalidades

- ✅ **Cadastro de Leads** - Formulário para captura de leads
- ✅ **Questionários Dinâmicos** - Sistema de perguntas personalizáveis
- ✅ **Disparos Automáticos** - Sequência de mensagens automáticas
- ✅ **Integração WhatsApp** - Via Baileys (estável) ou Meta API (oficial)
- ✅ **Relatórios** - Acompanhamento de conversões
- ✅ **Banco PostgreSQL** - Supabase para armazenamento em nuvem

## 📋 Pré-requisitos

- Node.js  
- npm ou yarn
- WhatsApp Business (para Meta API)

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd from_fdm
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env.local com:
META_ACCESS_TOKEN=your_access_token_here
META_PHONE_NUMBER_ID=your_phone_number_id_here
META_BUSINESS_ACCOUNT_ID=your_business_account_id_here
META_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
```

4. **Execute o projeto:**
```bash
npm run dev
```

## 🔧 Configuração

### Opção 1: Baileys (Recomendado para testes)

O Baileys já está configurado e funcionará automaticamente. Na primeira execução, você verá um QR Code no terminal para conectar ao WhatsApp.

### Opção 2: Meta API (Recomendado para produção)

1. **Crie uma conta no Meta for Developers**
2. **Configure um app do WhatsApp Business**
3. **Obtenha as credenciais necessárias:**
   - Access Token
   - Phone Number ID
   - Business Account ID
   - Webhook Verify Token

4. **Configure o webhook:**
   - URL: `https://seu-dominio.com/api/whatsapp/webhook`
   - Verify Token: (use o mesmo do .env)

## 📊 Fluxo da Aplicação

### 1. Landing Page (`/`)
- Apresentação do sistema
- Botão para cadastro de leads

### 2. Formulário de Cadastro (`/Form`)
- Captura dados do lead:
  - Nome
  - Telefone
  - Email
  - Modelo de negócio

### 3. Questionário (`/perguntas?lead_id=X`)
- Perguntas personalizáveis
- Respostas salvas no banco
- Processamento automático

### 4. Sistema de Disparos
- **Primeiro contato:** Enviado automaticamente após cadastro
- **Sequência:** Até 7 mensagens com intervalo de 24h
- **Respostas:** Processadas automaticamente

## 🗄️ Estrutura do Banco

### Tabelas Principais:
- **leads** - Dados dos clientes
- **perguntas** - Questionário configurável
- **respostas** - Respostas dos leads
- **contatos** - Status dos disparos
- **mensagens** - Histórico de mensagens
- **leads_finais** - Leads prontos para atendentes

## 🔌 APIs Disponíveis

### Formulários:
- `POST /api/form/leads` - Cadastrar lead
- `GET /api/form/leads` - Listar leads
- `GET /api/form/leads/[id]` - Buscar lead específico

### Perguntas:
- `GET /api/form/perguntas/exibir` - Listar perguntas ativas
- `POST /api/form/perguntas` - Criar pergunta
- `PUT /api/form/perguntas/[id]` - Atualizar pergunta

### Respostas:
- `POST /api/form/respostas` - Salvar resposta
- `GET /api/form/respostas/lead/[id]` - Buscar respostas do lead

### WhatsApp:
- `GET /api/whatsapp/webhook` - Verificação do webhook
- `POST /api/whatsapp/webhook` - Receber mensagens

## 🚀 Como Usar

### 1. Configurar Perguntas
```sql
INSERT INTO perguntas (texto_pergunta, ordem) VALUES 
('Qual é o seu principal objetivo?', 1),
('Qual é o seu orçamento?', 2),
('Quando pretende começar?', 3);
```

### 2. Cadastrar Lead
Acesse `/Form` e preencha os dados do cliente.

### 3. Acompanhar Disparos
O sistema automaticamente:
- Envia primeiro contato
- Agenda próximos disparos
- Processa respostas
- Gera relatórios

## 📈 Relatórios

### Endpoints disponíveis:
- `/api/form/whatsapp/relatorio-diario` - Relatório diário
- `/api/form/sheets/enviar-leads` - Enviar para Google Sheets

## 🔧 Configurações Avançadas

### Personalizar Mensagens
```sql
UPDATE mensagens SET texto_mensagem = 'Sua mensagem personalizada' 
WHERE tag = 'disparo_automatico' AND ordermensagem = 1;
```

### Ajustar Intervalos
Edite as constantes em `src/app/lib/whatsapp-baileys.ts`:
```typescript
const MAX_DISPAROS = 7;        // Máximo de tentativas
const INTERVALO_HORAS = 24;     // Intervalo entre disparos
```

## 🐛 Solução de Problemas

### QR Code não aparece
- Feche o Chrome completamente
- Execute como administrador
- Verifique se não há outras sessões ativas

### Mensagens não são enviadas
- Verifique se o WhatsApp está conectado
- Confirme se o número está no formato correto
- Verifique os logs no terminal

### Erro de import
- Execute `npm install` novamente
- Verifique se o TypeScript está configurado corretamente
- Reinicie o servidor de desenvolvimento

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no terminal
2. Confirme as configurações do banco
3. Teste a conexão WhatsApp
4. Verifique as variáveis de ambiente

## 🔄 Próximas Atualizações

- [ ] Integração com Google Sheets
- [ ] Dashboard administrativo
- [ ] Templates de mensagens
- [ ] Relatórios avançados
- [ ] Integração com CRM

---

**Desenvolvido com ❤️ para automatizar seus contatos no WhatsApp!**
