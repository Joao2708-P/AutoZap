#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Função para carregar .env
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

async function testPerguntasAPI() {
  console.log('🧪 Testando API de Perguntas...');
  console.log('─'.repeat(50));

  // Carregar .env
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('1️⃣ Testando query direta no Supabase...');
    
    // Teste 1: Buscar todas as perguntas
    const { data: todasPerguntas, error: erro1 } = await supabase
      .from('perguntas')
      .select('*');
    
    if (erro1) {
      console.log(`❌ Erro ao buscar todas: ${erro1.message}`);
    } else {
      console.log(`✅ Total de perguntas na tabela: ${todasPerguntas?.length || 0}`);
      todasPerguntas?.forEach((p, i) => {
        console.log(`   ${i + 1}. [ID:${p.id}] ${p.texto_pergunta} (ativa: ${p.ativa})`);
      });
    }

    console.log('\n2️⃣ Testando query específica (ativas + ordenadas)...');
    
    // Teste 2: Query que a API deveria usar
    const { data: perguntasAtivas, error: erro2 } = await supabase
      .from('perguntas')
      .select('id, texto_pergunta, ordem')
      .eq('ativa', true)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (erro2) {
      console.log(`❌ Erro na query específica: ${erro2.message}`);
    } else {
      console.log(`✅ Perguntas ativas encontradas: ${perguntasAtivas?.length || 0}`);
      perguntasAtivas?.forEach((p, i) => {
        console.log(`   ${i + 1}. [ID:${p.id}, Ordem:${p.ordem}] ${p.texto_pergunta}`);
      });
    }

    console.log('\n3️⃣ Testando a API real...');
    
    // Teste 3: Chamar a API como o frontend faz
    try {
      const response = await fetch('http://localhost:3000/api/form/perguntas/exibir');
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log(`✅ API funcionou! Perguntas retornadas: ${data.perguntas?.length || 0}`);
      } else {
        console.log(`❌ API falhou: ${data.message}`);
      }
    } catch (err) {
      console.log(`❌ Erro ao chamar API: ${err}`);
      console.log('ℹ️ Certifique-se que o servidor está rodando: npm run dev');
    }

    console.log('\n4️⃣ Verificando RLS (Row Level Security)...');
    
    // Teste 4: Verificar se RLS está bloqueando
    const { data: rlsCheck, error: rlsError } = await supabase
      .rpc('has_table_privilege', { 
        table_name: 'perguntas', 
        privilege: 'SELECT' 
      });
    
    if (rlsError) {
      console.log('⚠️ Não foi possível verificar RLS (normal)');
    } else {
      console.log(`RLS Status: ${rlsCheck ? 'Permitido' : 'Bloqueado'}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  console.log('\n─'.repeat(50));
  console.log('🎯 DIAGNÓSTICO COMPLETO PERGUNTAS!');
}

testPerguntasAPI();