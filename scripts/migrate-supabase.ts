#!/usr/bin/env tsx

import { Pool } from 'pg';

// Script de migração para Supabase
async function migrarParaSupabase() {
  console.log('🐘 Iniciando migração para Supabase...');
  console.log('─'.repeat(50));

  // URL do seu Supabase (substitua pela sua)
  const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.lsmkhaqzizgydlvvyzfx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
  
  if (!DATABASE_URL || DATABASE_URL.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Configure a DATABASE_URL no .env.local primeiro!');
    console.log('📝 Exemplo: echo "DATABASE_URL=postgresql://postgres.abc:senha@aws-0-us-east-1.pooler.supabase.com:6543/postgres" > .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Conectando no Supabase...');
    
    // Teste de conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida!');

    console.log('📋 Criando tabela: leads...');
    await pool.query(`
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

    console.log('❓ Criando tabela: perguntas...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perguntas (
        id SERIAL PRIMARY KEY,
        texto_pergunta TEXT NOT NULL,
        ativa BOOLEAN DEFAULT true,
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('💭 Criando tabela: respostas...');
    await pool.query(`
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

    console.log('📞 Criando tabela: contatos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contatos (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER,
        numero_de_tentativas INTEGER,
        ultima_tentativa TIMESTAMP,
        status_resposta TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      )
    `);

    console.log('💬 Criando tabela: mensagens...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensagens (
        id SERIAL PRIMARY KEY,
        texto_mensagem TEXT,
        tag TEXT,
        ordermensagem INTEGER   
      )
    `);

    console.log('📤 Criando tabela: leads_finais...');
    await pool.query(`
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

    // Verificar tabelas criadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('─'.repeat(50));
    console.log('✅ Migração concluída com sucesso!');
    console.log(`📊 Tabelas criadas: ${result.rows.length}`);
    
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('─'.repeat(50));
    console.log('🚀 Agora você pode fazer o deploy no Vercel!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar migração
migrarParaSupabase();