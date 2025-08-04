import { Pool } from 'pg';

// Configuração da conexão PostgreSQL com Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para executar queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Função para executar transações
export async function transaction(callback: (client: any) => Promise<any>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função para inicializar as tabelas
export async function initializeTables() {
  console.log('🔧 Inicializando tabelas PostgreSQL...');
  
  // Leads (ao invés de usuarios)
  await query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      modelo_de_negocio TEXT NOT NULL,
      primeiro_contato BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Perguntas (criadas pelo chefe/admin)
  await query(`
    CREATE TABLE IF NOT EXISTS perguntas (
      id SERIAL PRIMARY KEY,
      texto_pergunta TEXT NOT NULL,
      ativa BOOLEAN DEFAULT true,
      ordem INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Respostas (respostas dos leads)
  await query(`
    CREATE TABLE IF NOT EXISTS respostas (
      id SERIAL PRIMARY KEY,
      pergunta_id INTEGER NOT NULL,
      lead_id INTEGER NOT NULL,
      resposta_usuario TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pergunta_id) REFERENCES perguntas(id),
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    )
  `);

  // Contato
  await query(`
    CREATE TABLE IF NOT EXISTS contatos (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER,
      numero_de_tentativas INTEGER,
      ultima_tentativa TIMESTAMP,
      status_resposta TEXT,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    )
  `);

  // Mensagem
  await query(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id SERIAL PRIMARY KEY,
      texto_mensagem TEXT,
      tag TEXT,
      ordermensagem INTEGER   
    )
  `);

  // Leads finais (para enviar aos atendentes)
  await query(`
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
    )
  `);

  console.log('✅ Tabelas PostgreSQL inicializadas com sucesso!');
}

export default pool;