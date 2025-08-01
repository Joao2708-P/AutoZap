import fs from 'fs';
import path from 'path';

console.log('🧹 Limpando cache do Next.js...');

const cacheDirs = [
  '.next',
  'node_modules/.cache',
  '.turbo'
];

cacheDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️ Removendo: ${dir}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('✅ Cache limpo!');
console.log('🔄 Reinicie o servidor: npm run dev'); 