# 🚀 Setup Supabase API REST - Muito Mais Simples!

## ✅ **Adaptação Concluída!**

Agora o sistema usa a **API REST do Supabase** - muito mais simples e é o método recomendado!

---

## 🔧 **Configure as Variáveis (da sua tela):**

### 1️⃣ **Atualize seu `.env`:**
```bash
# Copie da tela que você mostrou:
NEXT_PUBLIC_SUPABASE_URL=https://lsmkhaqzizgydlvvyzfx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzbmtoqzizgydlvvyzfx.supabase.co...
```

### 2️⃣ **Configure no Vercel também:**
- Dashboard Vercel → Settings → Environment Variables
- Adicione as mesmas 2 variáveis

---

## 🛠️ **Criar Tabelas (Última vez manual):**

### **Opção A: Via Script (Tentar primeiro)**
```bash
npm install
npm run create-tables
```

### **Opção B: SQL Editor Manual (Garantido)**
1. Dashboard Supabase → **SQL Editor**
2. Cole e execute:

```sql
-- Leads
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  modelo_de_negocio TEXT NOT NULL,
  primeiro_contato BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Perguntas
CREATE TABLE perguntas (
  id SERIAL PRIMARY KEY,
  texto_pergunta TEXT NOT NULL,
  ativa BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mensagens
CREATE TABLE mensagens (
  id SERIAL PRIMARY KEY,
  texto_mensagem TEXT,
  tag TEXT,
  ordermensagem INTEGER   
);

-- Respostas
CREATE TABLE respostas (
  id SERIAL PRIMARY KEY,
  pergunta_id INTEGER REFERENCES perguntas(id),
  lead_id INTEGER REFERENCES leads(id),
  resposta_usuario TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contatos
CREATE TABLE contatos (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  numero_de_tentativas INTEGER,
  ultima_tentativa TIMESTAMP,
  status_resposta TEXT
);

-- Leads Finais
CREATE TABLE leads_finais (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  modelo_de_negocio TEXT NOT NULL,
  respostas_json TEXT NOT NULL,
  data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pendente',
  atendente_telefone TEXT,
  enviado_para_sheet BOOLEAN DEFAULT false,
  sheet_id TEXT
);
```

---

## 🎯 **Vantagens da API REST:**

✅ **Sem conexões complexas** - só HTTP requests  
✅ **Gerenciamento automático** - pooling, cache, etc  
✅ **Segurança built-in** - Row Level Security  
✅ **Real-time** - subscriptions automáticas  
✅ **Dashboard integrado** - ver dados facilmente  

---

## 🚀 **Deploy Final:**

```bash
npm install  # Nova dependência @supabase/supabase-js
git add .
git commit -m "Migração para Supabase API REST"
git push
```

**Agora vai funcionar perfeitamente!** 🎉