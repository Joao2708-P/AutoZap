import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'app', 'data', 'automatize.sqlite');

console.log('🔍 Verificando estrutura do banco de dados...');
console.log('📁 Caminho:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('\n📋 Estrutura da tabela leads:');
  const leadsInfo = db.prepare("PRAGMA table_info(leads)").all() as Array<{ name: string; type: string }>;
  leadsInfo.forEach((column) => {
    console.log(`  - ${column.name} (${column.type})`);
  });

  console.log('\n📋 Estrutura da tabela leads_finais:');
  const tableInfo = db.prepare("PRAGMA table_info(leads_finais)").all() as Array<{ name: string; type: string }>;
  tableInfo.forEach((column) => {
    console.log(`  - ${column.name} (${column.type})`);
  });

  console.log('\n📊 Dados na tabela leads_finais:');
  const leadsFinais = db.prepare('SELECT * FROM leads_finais').all();
  console.log(leadsFinais);

  console.log('\n👥 Leads existentes:');
  const leads = db.prepare('SELECT id, nome, telefone FROM leads').all() as Array<{ id: number; nome: string; telefone: string }>;
  leads.forEach((lead) => {
    console.log(`  - ID: ${lead.id}, Nome: ${lead.nome}, Telefone: ${lead.telefone}`);
  });

  db.close();
  console.log('\n✅ Verificação concluída!');

} catch (error) {
  console.error('❌ Erro ao verificar banco:', error);
} 