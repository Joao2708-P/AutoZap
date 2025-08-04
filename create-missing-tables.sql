-- ⚠️ TABELAS FALTANDO - Execute no SQL Editor do Supabase

-- Verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Se alguma tabela estiver faltando, execute:

-- Respostas (para guardar respostas das perguntas)
CREATE TABLE IF NOT EXISTS respostas (
  id SERIAL PRIMARY KEY,
  pergunta_id INTEGER REFERENCES perguntas(id),
  lead_id INTEGER REFERENCES leads(id),
  resposta_usuario TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contatos (para controle de tentativas)
CREATE TABLE IF NOT EXISTS contatos (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  numero_de_tentativas INTEGER,
  ultima_tentativa TIMESTAMP,
  status_resposta TEXT
);

-- Leads finais (para envio aos atendentes)
CREATE TABLE IF NOT EXISTS leads_finais (
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

-- Desabilitar RLS em todas as tabelas
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE respostas DISABLE ROW LEVEL SECURITY;
ALTER TABLE contatos DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads_finais DISABLE ROW LEVEL SECURITY;

-- Verificar novamente
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;