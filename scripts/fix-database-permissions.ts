import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'src', 'app', 'data', 'automatize.sqlite');

console.log('🔧 Verificando permissões do banco de dados...');
console.log('📁 Caminho do banco:', dbPath);

try {
  // Verificar se o diretório existe
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    console.log('📁 Criando diretório data...');
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Verificar se o arquivo do banco existe
  if (!fs.existsSync(dbPath)) {
    console.log('📄 Arquivo do banco não existe, será criado...');
  } else {
    console.log('✅ Arquivo do banco existe');
    
    // Verificar permissões
    const stats = fs.statSync(dbPath);
    console.log('📊 Permissões atuais:', stats.mode.toString(8));
  }

  // Tentar abrir o banco com permissões de escrita
  console.log('🔓 Abrindo banco com permissões de escrita...');
  
  const db = new Database(dbPath, {
    verbose: console.log,
    fileMustExist: false
  });

  // Configurar WAL mode
  console.log('⚙️ Configurando WAL mode...');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // Testar escrita
  console.log('✍️ Testando escrita no banco...');
  
  // Criar tabela de teste se não existir
  db.prepare(`
    CREATE TABLE IF NOT EXISTS test_permissions (
      id INTEGER PRIMARY KEY,
      test_value TEXT
    )
  `).run();

  // Inserir dados de teste
  const result = db.prepare('INSERT INTO test_permissions (test_value) VALUES (?)').run('test');
  
  console.log('✅ Escrita funcionando! ID inserido:', result.lastInsertRowid);

  // Limpar dados de teste
  db.prepare('DELETE FROM test_permissions WHERE test_value = ?').run('test');
  
  console.log('🧹 Dados de teste removidos');

  db.close();
  
  console.log('✅ Banco de dados configurado corretamente!');
  console.log('🚀 Agora você pode criar leads normalmente');

} catch (error) {
  console.error('❌ Erro ao configurar banco:', error);
  
  if (error.code === 'SQLITE_READONLY_DBMOVED') {
    console.log('💡 Solução:');
    console.log('1. Pare o servidor (Ctrl+C)');
    console.log('2. Delete o arquivo do banco: rm src/app/data/automatize.sqlite');
    console.log('3. Reinicie o servidor: npm run dev');
  }
  
  process.exit(1);
} 