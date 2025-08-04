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

async function seedPerguntas() {
  console.log('🌱 Adicionando perguntas de exemplo...');
  console.log('─'.repeat(50));

  // Carregar .env
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Perguntas de exemplo
  const perguntasExemplo = [
    {
      texto_pergunta: "Qual é o principal desafio do seu negócio atualmente?",
      ativa: true,
      ordem: 1
    },
    {
      texto_pergunta: "Qual é o seu faturamento mensal atual?",
      ativa: true,
      ordem: 2
    },
    {
      texto_pergunta: "Quantos funcionários você tem?",
      ativa: true,
      ordem: 3
    },
    {
      texto_pergunta: "Há quanto tempo sua empresa existe?",
      ativa: true,
      ordem: 4
    },
    {
      texto_pergunta: "Qual é o seu principal objetivo para os próximos 12 meses?",
      ativa: true,
      ordem: 5
    }
  ];

  try {
    // Verificar se já existem perguntas
    const { data: existing } = await supabase
      .from('perguntas')
      .select('count')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('ℹ️ Já existem perguntas no banco. Pulando...');
      return;
    }

    // Inserir perguntas
    console.log('📝 Inserindo perguntas...');
    
    for (let i = 0; i < perguntasExemplo.length; i++) {
      const pergunta = perguntasExemplo[i];
      
      const { data, error } = await supabase
        .from('perguntas')
        .insert(pergunta)
        .select()
        .single();

      if (error) {
        console.log(`❌ Erro ao inserir pergunta ${i + 1}: ${error.message}`);
      } else {
        console.log(`✅ Pergunta ${i + 1} inserida: ID ${data.id}`);
      }
    }

    // Verificar total
    const { data: total } = await supabase
      .from('perguntas')
      .select('count');

    console.log('─'.repeat(50));
    console.log(`🎉 Seed concluído! Total de perguntas: ${total?.length || 0}`);
    console.log('');
    console.log('🧪 Agora você pode testar:');
    console.log('1. Acesse seu site');
    console.log('2. Vá na página de perguntas');
    console.log('3. Deve mostrar as 5 perguntas');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  }
}

seedPerguntas();