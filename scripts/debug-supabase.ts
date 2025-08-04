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

async function debugSupabase() {
  console.log('🔍 Debug Supabase Configuration...');
  console.log('─'.repeat(50));

  // Carregar .env
  loadEnv();

  // Verificar variáveis
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔗 Variáveis de Ambiente:');
  console.log(`URL: ${supabaseUrl ? '✅ Configurada' : '❌ Não encontrada'}`);
  console.log(`KEY: ${supabaseKey ? '✅ Configurada' : '❌ Não encontrada'}`);
  
  if (supabaseUrl) {
    console.log(`   URL: ${supabaseUrl}`);
  }
  if (supabaseKey) {
    console.log(`   KEY: ${supabaseKey.substring(0, 50)}...`);
  }

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Configure as variáveis primeiro!');
    console.log('');
    console.log('Crie arquivo .env com:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://lsmkhaqzizgydlvvyzfx.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...');
    process.exit(1);
  }

  // Testar conexão
  console.log('');
  console.log('🧪 Testando Conexão...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Teste 1: Listar tabelas
    console.log('1. Verificando tabelas...');
    const { data: tables, error: tablesError } = await supabase
      .from('leads')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.log(`❌ Erro ao acessar tabela leads: ${tablesError.message}`);
      console.log(`   Code: ${tablesError.code}`);
      console.log(`   Details: ${tablesError.details}`);
    } else {
      console.log('✅ Tabela leads acessível!');
    }

    // Teste 2: Inserir lead de teste
    console.log('2. Testando inserção...');
    const { data: insertData, error: insertError } = await supabase
      .from('leads')
      .insert({
        nome: 'Teste Debug',
        telefone: '(11) 99999-9999',
        email: `debug-${Date.now()}@test.com`,
        modelo_de_negocio: 'Teste'
      })
      .select()
      .single();

    if (insertError) {
      console.log(`❌ Erro ao inserir: ${insertError.message}`);
      console.log(`   Code: ${insertError.code}`);
      console.log(`   Details: ${insertError.details}`);
      
      // Verificar se é problema de RLS
      if (insertError.code === '42501') {
        console.log('');
        console.log('🔒 PROBLEMA: Row Level Security bloqueando inserção');
        console.log('💡 SOLUÇÃO: Execute no SQL Editor do Supabase:');
        console.log('');
        console.log('ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.perguntas DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.mensagens DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.respostas DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.contatos DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.leads_finais DISABLE ROW LEVEL SECURITY;');
      }
    } else {
      console.log('✅ Inserção funcionou!');
      console.log(`   ID criado: ${insertData.id}`);
    }

    // Teste 3: Buscar dados
    console.log('3. Testando busca...');
    const { data: selectData, error: selectError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (selectError) {
      console.log(`❌ Erro ao buscar: ${selectError.message}`);
    } else {
      console.log(`✅ Busca funcionou! Encontrados: ${selectData?.length || 0} registros`);
    }

  } catch (error) {
    console.log('❌ Erro geral:', error);
  }

  console.log('');
  console.log('─'.repeat(50));
  console.log('🎯 DIAGNÓSTICO COMPLETO!');
}

debugSupabase();