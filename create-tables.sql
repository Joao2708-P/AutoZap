-- 🐘 SQL para criar tabelas no Supabase manualmente
-- Execute no SQL Editor do Supabase se quiser criar as tabelas antes do deploy

-- Leads (ao invés de usuarios)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  modelo_de_negocio TEXT NOT NULL,
  primeiro_contato BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Perguntas (criadas pelo chefe/admin)
CREATE TABLE IF NOT EXISTS perguntas (
  id SERIAL PRIMARY KEY,
  texto_pergunta TEXT NOT NULL,
  ativa BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Respostas (respostas dos leads)
CREATE TABLE IF NOT EXISTS respostas (
  id SERIAL PRIMARY KEY,
  pergunta_id INTEGER NOT NULL,
  lead_id INTEGER NOT NULL,
  resposta_usuario TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pergunta_id) REFERENCES perguntas(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Contato
CREATE TABLE IF NOT EXISTS contatos (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER,
  numero_de_tentativas INTEGER,
  ultima_tentativa TIMESTAMP,
  status_resposta TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Mensagem
CREATE TABLE IF NOT EXISTS mensagens (
  id SERIAL PRIMARY KEY,
  texto_mensagem TEXT,
  tag TEXT,
  ordermensagem INTEGER   
);

-- Leads finais (para enviar aos atendentes)
CREATE TABLE IF NOT EXISTS leads_finais (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  modelo_de_negocio TEXT NOT NULL,
  respostas_json TEXT NOT NULL,
  data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pendente',
  atendente_telefone TEXT,
  enviado_para_sheet BOOLEAN DEFAULT false,
  sheet_id TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- 🎉 Pronto! Todas as tabelas criadas