const Database = require('better-sqlite3');
const path = require('path');

console.log('🗄️ Preenchendo tabelas...');

const dbPath = path.join(process.cwd(), 'src', 'app', 'data', 'automatize.sqlite');
const db = new Database(dbPath);

// Inserir perguntas
console.log('📝 Inserindo perguntas...');
const perguntas = [
  { texto: 'Qual é o seu principal objetivo com nossos serviços?', ordem: 1 },
  { texto: 'Qual é o seu orçamento disponível?', ordem: 2 },
  { texto: 'Quando pretende começar o projeto?', ordem: 3 },
  { texto: 'Qual é o tamanho da sua empresa?', ordem: 4 },
  { texto: 'Você já trabalha com automação?', ordem: 5 }
];

perguntas.forEach(pergunta => {
  try {
    db.prepare(`
      INSERT INTO perguntas (texto_pergunta, ordem, ativa)
      VALUES (?, ?, 1)
    `).run(pergunta.texto, pergunta.ordem);
    console.log(`✅ Pergunta inserida: ${pergunta.texto}`);
  } catch (error) {
    console.log(`⚠️ Pergunta já existe: ${pergunta.texto}`);
  }
});

// Inserir mensagens
console.log('💬 Inserindo mensagens...');
const mensagens = [
  { texto: 'Olá! Vi que você se interessou pelos nossos serviços. Como posso te ajudar?', tag: 'disparo_automatico', ordem: 1 },
  { texto: 'Oi! Tudo bem? Não vi sua resposta. Posso te ajudar com alguma dúvida?', tag: 'disparo_automatico', ordem: 2 },
  { texto: 'Olá! Estou aqui para te ajudar. Tem alguma pergunta sobre nossos serviços?', tag: 'disparo_automatico', ordem: 3 },
  { texto: 'Oi! Ainda estou disponível para te ajudar. O que você gostaria de saber?', tag: 'disparo_automatico', ordem: 4 },
  { texto: 'Olá! Não desista, estou aqui para te auxiliar. Vamos conversar?', tag: 'disparo_automatico', ordem: 5 },
  { texto: 'Oi! Última tentativa de contato. Posso te ajudar com algo?', tag: 'disparo_automatico', ordem: 6 },
  { texto: 'Olá! Esta é nossa última mensagem. Se precisar, estarei aqui!', tag: 'disparo_automatico', ordem: 7 }
];

mensagens.forEach(mensagem => {
  try {
    db.prepare(`
      INSERT INTO mensagens (texto_mensagem, tag, ordermensagem)
      VALUES (?, ?, ?)
    `).run(mensagem.texto, mensagem.tag, mensagem.ordem);
    console.log(`✅ Mensagem inserida: ${mensagem.texto.substring(0, 50)}...`);
  } catch (error) {
    console.log(`⚠️ Mensagem já existe: ${mensagem.texto.substring(0, 50)}...`);
  }
});

console.log('✅ Tabelas preenchidas com sucesso!');
console.log('📊 Estatísticas:');
console.log(`- Perguntas: ${db.prepare('SELECT COUNT(*) as total FROM perguntas').get().total}`);
console.log(`- Mensagens: ${db.prepare('SELECT COUNT(*) as total FROM mensagens').get().total}`);

process.exit(0); 