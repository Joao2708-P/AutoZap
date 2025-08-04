#!/usr/bin/env tsx

/**
 * Script para gerar tipos TypeScript do Supabase
 * 
 * Para usar este script:
 * 1. Instale a CLI do Supabase: npm install -g supabase
 * 2. Execute: npm run generate-types
 * 
 * Ou gere manualmente:
 * supabase gen types typescript --project-id lsmkhaqzizgydlvvyzfx > database.types.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateTypes() {
  console.log('🔧 Gerando tipos TypeScript do Supabase...');
  console.log('─'.repeat(50));

  try {
    // Tentar gerar tipos automaticamente
    const projectId = 'lsmkhaqzizgydlvvyzfx'; // Seu project ID
    const command = `supabase gen types typescript --project-id ${projectId}`;
    
    console.log('📡 Executando comando...');
    console.log(`$ ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.log('⚠️ Avisos:', stderr);
    }
    
    // Salvar no arquivo
    const fs = require('fs');
    fs.writeFileSync('database.types.ts', stdout);
    
    console.log('✅ Tipos gerados com sucesso!');
    console.log('📄 Arquivo: database.types.ts');
    console.log('🔄 Tipos atualizados do schema atual do Supabase');
    
  } catch (error: any) {
    console.log('❌ Erro ao gerar tipos automaticamente');
    console.log('💡 Solução alternativa:');
    console.log('');
    console.log('1. Instale a CLI do Supabase:');
    console.log('   npm install -g supabase');
    console.log('');
    console.log('2. Execute manualmente:');
    console.log('   supabase gen types typescript --project-id lsmkhaqzizgydlvvyzfx > database.types.ts');
    console.log('');
    console.log('3. Ou copie do Dashboard Supabase:');
    console.log('   Settings → API → TypeScript');
    console.log('');
    console.log('Erro detalhado:', error.message);
  }
}

generateTypes();