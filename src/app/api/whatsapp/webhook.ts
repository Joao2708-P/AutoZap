import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';
import { whatsappMeta } from '@/app/lib/whatsapp-meta';

// GET - Verificação do webhook pelo Meta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('\n🔗 WEBHOOK VERIFICATION...');
    console.log('─'.repeat(50));
    console.log('📡 Meta está verificando o webhook...');
    console.log(`🔍 Mode: ${mode}`);
    console.log(`🔑 Token: ${token}`);
    console.log(`🎯 Challenge: ${challenge}`);

    // Verificar se é uma verificação do Meta
    if (mode === 'subscribe' && token === 'fdm_webhook_token') {
      console.log('✅ Webhook verificado com sucesso!');
      console.log('🔗 URL confirmada pelo Meta');
      console.log('📱 Webhook ativo para receber mensagens');
      console.log('─'.repeat(50));
      return new NextResponse(challenge, { status: 200 });
    }

    console.log('❌ Verificação do webhook falhou');
    console.log('🔒 Token inválido ou mode incorreto');
    console.log('─'.repeat(50));
    return new NextResponse('Forbidden', { status: 403 });
  } catch (error) {
    console.error('❌ Erro na verificação do webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST - Receber mensagens do WhatsApp
export async function POST(request: NextRequest) {
  try {
    console.log('\n📨 WEBHOOK MESSAGE RECEIVED...');
    console.log('─'.repeat(50));
    
    const body = await request.json();
    console.log('📋 Dados recebidos do Meta:');
    console.log(JSON.stringify(body, null, 2));

    // Verificar se é uma mensagem válida
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages?.[0]) {
        const message = value.messages[0];
        const from = message.from;
        const messageType = message.type;
        const timestamp = message.timestamp;

        console.log('\n📱 MENSAGEM DETECTADA:');
        console.log('─'.repeat(50));
        console.log(`📞 De: ${from}`);
        console.log(`📝 Tipo: ${messageType}`);
        console.log(`⏰ Timestamp: ${new Date(timestamp * 1000).toLocaleString('pt-BR')}`);

        // Simular recebimento da mensagem
        await whatsappMeta.receiveMessage(from, message.text?.body || 'Mensagem sem texto');

        // Processar diferentes tipos de mensagem
        if (messageType === 'text') {
          const text = message.text?.body;
          console.log('💬 Texto recebido:', text);
          
          await processTextMessage(from, text);
        } else if (messageType === 'interactive') {
          const buttonText = message.interactive?.button_reply?.title;
          console.log('🔘 Botão clicado:', buttonText);
          
          await processButtonMessage(from, buttonText);
        }

        console.log('✅ Mensagem processada com sucesso!');
        console.log('─'.repeat(50));
        return NextResponse.json({ status: 'ok' });
      }
    }

    console.log('⚠️ Mensagem ignorada (não é uma mensagem válida)');
    console.log('─'.repeat(50));
    return NextResponse.json({ status: 'ignored' });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Processar mensagem de texto
async function processTextMessage(from: string, text: string) {
  try {
    console.log(`\n💬 PROCESSANDO MENSAGEM DE TEXTO...`);
    console.log('─'.repeat(50));
    console.log(`📱 De: ${from}`);
    console.log(`💬 Texto: "${text}"`);

    // Buscar lead pelo telefone
    const lead = db.prepare('SELECT * FROM leads WHERE telefone = ?').get(from) as { nome: string } | undefined;
    
    if (lead) {
      console.log('✅ Lead encontrado:', lead.nome);
      
      // Salvar mensagem recebida
      db.prepare(`
        INSERT INTO mensagens (texto_mensagem, tag, ordermensagem)
        VALUES (?, 'mensagem_recebida', ?)
      `).run(text, Date.now());

      // Lógica de resposta automática baseada no texto
      let response = '';
      
      if (text.toLowerCase().includes('oi') || text.toLowerCase().includes('olá')) {
        response = `Olá ${lead.nome}! 👋\n\nObrigado por entrar em contato conosco!\n\nComo posso ajudá-lo hoje?`;
      } else if (text.toLowerCase().includes('preço') || text.toLowerCase().includes('valor')) {
        response = `Olá ${lead.nome}! 💰\n\nTemos diferentes planos disponíveis:\n\n📋 Plano Básico: R$ 97/mês\n📋 Plano Pro: R$ 197/mês\n📋 Plano Enterprise: R$ 497/mês\n\nQual plano te interessa?`;
      } else if (text.toLowerCase().includes('agendar') || text.toLowerCase().includes('reunião')) {
        response = `Perfeito ${lead.nome}! 📅\n\nVou agendar uma reunião para você!\n\nDisponível:\n🕐 Segunda a Sexta: 9h às 18h\n🕐 Sábado: 9h às 12h\n\nQual horário prefere?`;
      } else {
        response = `Obrigado pela mensagem ${lead.nome}! 🙏\n\nUm de nossos atendentes entrará em contato em breve.\n\nEnquanto isso, que tal conhecer nossos serviços?\n\n💼 Automação de Marketing\n📊 Relatórios Avançados\n🎯 Segmentação Inteligente`;
      }

      // Enviar resposta automática
      console.log('📤 Enviando resposta automática...');
      await whatsappMeta.sendMessage(from, response);
      
    } else {
      console.log('❌ Lead não encontrado para o telefone:', from);
      console.log('📝 Criando novo contato...');
      
      // Resposta para desconhecidos
      const response = `Olá! 👋\n\nObrigado por entrar em contato!\n\nComo posso ajudá-lo hoje?`;
      await whatsappMeta.sendMessage(from, response);
    }

  } catch (error) {
    console.error('❌ Erro ao processar mensagem de texto:', error);
  }
}

// Processar mensagem de botão
async function processButtonMessage(from: string, buttonText: string) {
  try {
    console.log(`\n🔘 PROCESSANDO MENSAGEM DE BOTÃO...`);
    console.log('─'.repeat(50));
    console.log(`📱 De: ${from}`);
    console.log(`🔘 Botão: "${buttonText}"`);

    // Buscar lead pelo telefone
    const lead = db.prepare('SELECT * FROM leads WHERE telefone = ?').get(from) as { nome: string } | undefined;
    
    if (lead) {
      console.log('✅ Lead encontrado:', lead.nome);
      
      let response = '';
      
      switch (buttonText.toLowerCase()) {
        case 'quero conhecer':
          response = `Ótimo ${lead.nome}! 🚀\n\nVou te mostrar como nossa solução pode transformar seu negócio!\n\n📈 Aumente suas vendas\n⏰ Economize tempo\n💰 Reduza custos\n\nQuer agendar uma demonstração?`;
          break;
        case 'agendar demo':
          response = `Perfeito ${lead.nome}! 📅\n\nVou agendar uma demonstração personalizada para você!\n\nDisponível:\n🕐 Segunda a Sexta: 9h às 18h\n🕐 Sábado: 9h às 12h\n\nQual horário prefere?`;
          break;
        case 'preços':
          response = `Aqui estão nossos planos ${lead.nome}! 💰\n\n📋 *Plano Básico:* R$ 97/mês\n- Até 1.000 contatos\n- Automações básicas\n- Suporte por email\n\n📋 *Plano Pro:* R$ 197/mês\n- Até 10.000 contatos\n- Automações avançadas\n- Suporte prioritário\n\n📋 *Plano Enterprise:* R$ 497/mês\n- Contatos ilimitados\n- Recursos exclusivos\n- Suporte 24/7\n\nQual plano te interessa?`;
          break;
        default:
          response = `Obrigado ${lead.nome}! 🙏\n\nUm de nossos atendentes entrará em contato em breve.`;
      }

      console.log('📤 Enviando resposta para botão...');
      await whatsappMeta.sendMessage(from, response);
      
    } else {
      console.log('❌ Lead não encontrado para o telefone:', from);
      const response = `Obrigado! 🙏\n\nUm de nossos atendentes entrará em contato em breve.`;
      await whatsappMeta.sendMessage(from, response);
    }

  } catch (error) {
    console.error('❌ Erro ao processar mensagem de botão:', error);
  }
}
