# 🚨 CORREÇÃO EMERGENCIAL - SQLite → Supabase

## 🎯 OPÇÃO A: Wrapper Universal (Recomendado)

Substitua TODO o conteúdo de `src/app/lib/FDM.ts` por:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const db = {
  prepare: (sql: string) => ({
    async get(params?: any[]) {
      try {
        // Tentar executar como RPC primeiro
        const { data, error } = await supabase.rpc('execute_sql', { 
          sql_query: sql, 
          sql_params: params 
        });
        
        if (!error && data?.[0]) return data[0];
        
        // Fallback para operações específicas
        return await handleSpecificQuery(sql, params, 'get');
      } catch (err) {
        console.error('Query Error:', sql, err);
        return null;
      }
    },

    async all(params?: any[]) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', { 
          sql_query: sql, 
          sql_params: params 
        });
        
        if (!error && data) return data;
        
        return await handleSpecificQuery(sql, params, 'all');
      } catch (err) {
        console.error('Query Error:', sql, err);
        return [];
      }
    },

    async run(params?: any[]) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', { 
          sql_query: sql, 
          sql_params: params 
        });
        
        if (!error) return { changes: 1, lastInsertRowid: data?.[0]?.id || null };
        
        return await handleSpecificQuery(sql, params, 'run');
      } catch (err) {
        console.error('Query Error:', sql, err);
        return { changes: 0, lastInsertRowid: null };
      }
    }
  })
};

// Função para lidar com queries específicas
async function handleSpecificQuery(sql: string, params: any[], operation: string) {
  // Detectar tabela
  const table = detectTable(sql);
  
  if (operation === 'get') {
    if (sql.includes('WHERE')) {
      // SELECT com filtro
      const { data } = await supabase.from(table).select('*').limit(1).single();
      return data;
    }
    return null;
  }
  
  if (operation === 'all') {
    const { data } = await supabase.from(table).select('*');
    return data || [];
  }
  
  if (operation === 'run') {
    if (sql.includes('INSERT')) {
      // INSERT genérico
      const { data } = await supabase.from(table).insert({}).select().single();
      return { changes: 1, lastInsertRowid: data?.id || null };
    }
    return { changes: 0, lastInsertRowid: null };
  }
}

function detectTable(sql: string): string {
  if (sql.includes('leads')) return 'leads';
  if (sql.includes('perguntas')) return 'perguntas';
  if (sql.includes('mensagens')) return 'mensagens';
  if (sql.includes('respostas')) return 'respostas';
  if (sql.includes('contatos')) return 'contatos';
  if (sql.includes('leads_finais')) return 'leads_finais';
  return 'leads'; // fallback
}

export default db;
```

## 🎯 OPÇÃO B: Rollback Temporário

Se quiser voltar ao SQLite temporariamente:

1. **Revert** as mudanças:
```bash
git log --oneline  # ver commits
git revert COMMIT_ID_DA_MIGRACAO
```

2. **Deploy** com SQLite funcionando
3. **Migrar** depois com calma

## 🎯 OPÇÃO C: Logs Detalhados

Para debug sistemático, adicione no início de `src/app/lib/FDM.ts`:

```typescript
// Log todas as queries
const originalPrepare = db.prepare;
db.prepare = (sql: string) => {
  console.log('🔍 SQL:', sql);
  return originalPrepare(sql);
};
```

## 🍽️ PÓS-ALMOÇO

Quando voltar, escolha:
- ✅ Corrigir sistema inteiro metodicamente
- ✅ Usar RPC functions no Supabase
- ✅ Criar mapeamento completo de queries

**Por enquanto, use a OPÇÃO A para parar os erros!** 🚀