#!/usr/bin/env tsx

import { migrateSqliteToPostgres } from '../src/app/lib/migration-script';

console.log('🚀 Executando migração SQLite → PostgreSQL');
console.log('─'.repeat(50));

migrateSqliteToPostgres()
  .then(() => {
    console.log('─'.repeat(50));
    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('─'.repeat(50));
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  });