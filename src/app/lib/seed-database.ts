import db from './FDM';

// Script para inserir apenas perguntas de teste
const seedDatabase = () => {
  try {
    console.log('🌱 Iniciando seed das perguntas...');

    // Verificar se já existem perguntas
    const perguntasExistentes = db.prepare('SELECT COUNT(*) as count FROM perguntas').get();
    
    if (perguntasExistentes.count > 0) {
      console.log('⚠️  Já existem perguntas no banco. Pulando inserção...');
      return;
    }

    // Inserir perguntas de teste
    const perguntas = [
      {
        texto_pergunta: 'Qual o seu principal objetivo com automações?',
        ordem: 1
      },
      {
        texto_pergunta: 'Você já usa alguma ferramenta de automação hoje? Qual?',
        ordem: 2
      },
      {
        texto_pergunta: 'Qual seu modelo de negócio?',
        ordem: 3
      },
      {
        texto_pergunta: 'Quantos funcionários sua empresa possui?',
        ordem: 4
      },
      {
        texto_pergunta: 'Qual área você gostaria de automatizar primeiro?',
        ordem: 5
      },
      {
        texto_pergunta: 'Qual seu faturamento mensal aproximado?',
        ordem: 6
      }
    ];

    console.log('📝 Inserindo perguntas...');
    perguntas.forEach(pergunta => {
      db.prepare(
        'INSERT INTO perguntas (texto_pergunta, ordem) VALUES (?, ?)'
      ).run(pergunta.texto_pergunta, pergunta.ordem);
    });

    console.log('✅ Perguntas inseridas com sucesso!');
    console.log(`📊 ${perguntas.length} perguntas adicionadas`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
};

// Executar o script
seedDatabase(); 