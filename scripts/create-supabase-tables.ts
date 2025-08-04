#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Função para carregar .env manualmente
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  let envFile = '';
  if (fs.existsSync(envLocalPath)) {
    envFile = envLocalPath;
  } else if (fs.existsSync(envPath)) {
    envFile = envPath;
  }
  
  if (envFile) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    console.log(`📁 Carregado: ${envFile}`);
  }
}

async function criarTabelasSupabase() {
  console.log('🐘 Criando tabelas no Supabase via API REST...');
  console.log('─'.repeat(50));

  // Carregar arquivo .env
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsmkhaqzizgydlvvyzfx.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseKey) {
    console.error('❌ SUPABASE_ANON_KEY não encontrada!');
    console.log('📝 Configure no .env:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://lsmkhaqzizgydlvvyzfx.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...');
    process.exit(1);
  }

  console.log('🔗 Conectando no Supabase...');
  console.log(`📡 URL: ${supabaseUrl}`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Executar SQL direto via RPC (se disponível) ou Edge Functions
    const sqlCommands = [
      `CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        modelo_de_negocio TEXT NOT NULL,
        primeiro_contato BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS perguntas (
        id SERIAL PRIMARY KEY,
        texto_pergunta TEXT NOT NULL,
        ativa BOOLEAN DEFAULT true,
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS mensagens (
        id SERIAL PRIMARY KEY,
        texto_mensagem TEXT,
        tag TEXT,
        ordermensagem INTEGER   
      )`,
      `CREATE TABLE IF NOT EXISTS respostas (
        id SERIAL PRIMARY KEY,
        pergunta_id INTEGER NOT NULL,
        lead_id INTEGER NOT NULL,
        resposta_usuario TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pergunta_id) REFERENCES perguntas(id),
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      )`,
      `CREATE TABLE IF NOT EXISTS contatos (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER,
        numero_de_tentativas INTEGER,
        ultima_tentativa TIMESTAMP,
        status_resposta TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      )`,
      `CREATE TABLE IF NOT EXISTS leads_finais (
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
      )`
    ];

    console.log('📋 Executando comandos SQL...');
    
    for (let i = 0; i < sqlCommands.length; i++) {
      console.log(`${i + 1}/6 Executando...`);
      
      // Tentar executar via RPC se disponível
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sqlCommands[i] });
        if (error) {
          console.log(`⚠️ RPC não disponível, use SQL Editor manual: ${error.message}`);
        }
      } catch (err) {
        console.log(`⚠️ Comando ${i + 1} deve ser executado manualmente no SQL Editor`);
      }
    }

    // Testar se pode inserir dados (verificar se tabelas existem)
    console.log('🧪 Testando conexão...');
    
    try {
      const { data, error } = await supabase.from('leads').select('count').limit(1);
      if (!error) {
        console.log('✅ Tabela "leads" acessível!');
      }
    } catch (err) {
      console.log('ℹ️ Tabelas precisam ser criadas manualmente no SQL Editor');
    }

    console.log('─'.repeat(50));
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('1. Vá no Dashboard Supabase → SQL Editor');
    console.log('2. Execute os comandos SQL listados acima');
    console.log('3. Ou use o arquivo create-tables.sql que já criei');
    console.log('4. Teste o sistema depois');
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

criarTabelasSupabase();