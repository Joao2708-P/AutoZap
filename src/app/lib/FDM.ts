import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'app', 'data', 'automatize.sqlite');

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
        primeiro_contato BOOLEAN DEFAULT 1
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
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT NOT NULL,
        modelo_de_negocio TEXT NOT NULL,
        respostas_json TEXT NOT NULL,
        data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pendente',
        atendente_telefone TEXT,
        enviado_para_sheet BOOLEAN DEFAULT 0,
        sheet_id TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
    )
`).run();

export default db