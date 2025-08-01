import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'app', 'data', 'automatize.sqlite');

console.log('🗑️ Removendo banco de dados antigo...');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Banco removido');
}

console.log('🔄 Criando novo banco de dados...');

const db = new Database(dbPath, {
  fileMustExist: false
});

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

//Leads (ao invés de usuarios)
db.prepare(`
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        modelo_de_negocio TEXT NOT NULL,
        primeiro_contato BOOLEAN DEFAULT 1,
        primeiro_contato_enviado BOOLEAN DEFAULT 0
    )
`).run();

//Perguntas (criadas pelo chefe/admin)
db.prepare(`
    CREATE TABLE IF NOT EXISTS perguntas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        texto_pergunta TEXT NOT NULL,
        ativa BOOLEAN DEFAULT 1,
        ordem INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

//Respostas (respostas dos leads)
db.prepare(`
    CREATE TABLE IF NOT EXISTS respostas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pergunta_id INTEGER NOT NULL,
        lead_id INTEGER NOT NULL,
        resposta_usuario TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pergunta_id) REFERENCES perguntas(id),
        FOREIGN KEY (lead_id) REFERENCES leads(id)
    )
`).run();

//Contato
db.prepare(`
    CREATE TABLE IF NOT EXISTS contatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER,
        numero_de_tentativas INTEGER,
        ultima_tentativa DATETIME,
        status_resposta TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
    )
`).run();

//Mensagem
db.prepare(`
    CREATE TABLE IF NOT EXISTS mensagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        texto_mensagem TEXT,
        tag TEXT,
        ordermensagem INTEGER   
    )
`).run();

//Leads finais (para enviar aos atendentes)
db.prepare(`
    CREATE TABLE IF NOT EXISTS leads_finais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pendente',
        FOREIGN KEY (lead_id) REFERENCES leads(id)
    )
`).run();

// Inserir perguntas padrão
db.prepare(`
    INSERT INTO perguntas (texto_pergunta, ordem) VALUES 
    ('Qual é o seu nome completo?', 1),
    ('Qual é o seu email?', 2),
    ('Qual é o seu telefone?', 3),
    ('Qual é o seu modelo de negócio?', 4),
    ('Qual é o seu faturamento mensal?', 5)
`).run();

// Inserir mensagens padrão
db.prepare(`
    INSERT INTO mensagens (texto_mensagem, tag, ordermensagem) VALUES 
    ('Olá! Bem-vindo ao nosso sistema.', 'boas_vindas', 1),
    ('Obrigado por se cadastrar!', 'agradecimento', 2),
    ('Um atendente entrará em contato em breve.', 'atendimento', 3)
`).run();

db.close();

console.log('✅ Banco de dados recriado com sucesso!');
console.log('📊 Estrutura correta aplicada');
console.log('🎯 Agora teste o formulário novamente!'); 