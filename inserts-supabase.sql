-- 🌱 INSERTS para Supabase - Perguntas e Mensagens
-- Cole e execute no SQL Editor do Supabase

-- ═══════════════════════════════════════════════════════════════
-- 📝 PERGUNTAS (5 perguntas estratégicas para qualificação de leads)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO perguntas (texto_pergunta, ativa, ordem) VALUES
('Qual é o principal desafio do seu negócio atualmente?', true, 1),
('Qual é o seu faturamento mensal atual?', true, 2),
('Quantos funcionários você tem na sua empresa?', true, 3),
('Há quanto tempo sua empresa existe no mercado?', true, 4),
('Qual é o seu principal objetivo para os próximos 12 meses?', true, 5);

-- ═══════════════════════════════════════════════════════════════
-- 💬 MENSAGENS (Sequência de mensagens automáticas para WhatsApp)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO mensagens (texto_mensagem, tag, ordermensagem) VALUES

-- Mensagem 1: Boas-vindas
('Olá! 👋 Muito obrigado por se cadastrar no nosso sistema! 

Eu sou o assistente virtual da empresa e vou te ajudar a conectar com nossa equipe especializada.

Suas informações foram recebidas com sucesso! ✅', 'boas_vindas', 1),

-- Mensagem 2: Próximos passos
('Para continuarmos, você precisa responder algumas perguntas estratégicas sobre seu negócio. 📋

Isso nos ajuda a entender melhor seu perfil e conectar você com o especialista certo para sua situação.

Clique no link abaixo para responder (são apenas 5 perguntas rápidas): 
{{LINK_PERGUNTAS}}', 'perguntas_link', 2),

-- Mensagem 3: Lembrete (caso não responda)
('Oi! 📱 Notei que você ainda não respondeu nossas perguntas estratégicas.

São apenas 5 perguntas rápidas que vão nos ajudar a entender melhor seu negócio e te conectar com o especialista ideal.

Link para responder: {{LINK_PERGUNTAS}}

Qualquer dúvida, é só responder aqui! 😊', 'lembrete', 3),

-- Mensagem 4: Agradecimento + próximos passos
('Perfeito! ✅ Recebi suas respostas.

Agora vou encaminhar suas informações para nosso especialista que tem mais experiência com empresas do seu perfil.

Em breve você receberá o contato dele para uma conversa personalizada! 🚀

Muito obrigado pela confiança! 💙', 'finalizacao', 4),

-- Mensagem 5: Encaminhamento para especialista
('🎯 NOVO LEAD QUALIFICADO

Nome: {{NOME}}
Telefone: {{TELEFONE}}
Email: {{EMAIL}}
Modelo de Negócio: {{MODELO_NEGOCIO}}

📋 Respostas das perguntas estratégicas:
{{RESPOSTAS_JSON}}

Lead está pronto para atendimento! 🚀', 'especialista', 5);

-- ═══════════════════════════════════════════════════════════════
-- ✅ VERIFICAÇÃO - Execute para confirmar se foi inserido
-- ═══════════════════════════════════════════════════════════════

-- Verificar perguntas inseridas
SELECT 'PERGUNTAS INSERIDAS:' as tipo, count(*) as total FROM perguntas;
SELECT ordem, texto_pergunta FROM perguntas ORDER BY ordem;

-- Verificar mensagens inseridas  
SELECT 'MENSAGENS INSERIDAS:' as tipo, count(*) as total FROM mensagens;
SELECT ordermensagem, tag, LEFT(texto_mensagem, 50) || '...' as preview FROM mensagens ORDER BY ordermensagem;