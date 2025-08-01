import { NextRequest, NextResponse } from 'next/server';
import { whatsappMeta } from '@/app/lib/whatsapp-meta';
import db from '@/app/lib/FDM';

interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  modelo_de_negocio: string;
  primeiro_contato: boolean;
}



interface SimulationMessage {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = parseInt(params.id);
    
    if (isNaN(leadId)) {
      return NextResponse.json({
        success: false,
        message: 'ID do lead inválido'
      }, { status: 400 });
    }

    const leads = db.prepare('SELECT * FROM leads WHERE id = ?').all(leadId) as Lead[];
    
    if (leads.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Lead com ID ${leadId} não encontrado.`,
        suggestion: 'Verifique se o lead existe no sistema'
      }, { status: 404 });
    }

    const lead = leads[0];

    // Verificar se os campos obrigatórios existem
    if (!lead.nome || !lead.telefone || !lead.email) {
      return NextResponse.json({
        success: false,
        message: 'Dados do lead incompletos',
        error: 'Nome, telefone ou email estão faltando'
      }, { status: 400 });
    }

    // Buscar perguntas e respostas reais do lead (removido - não usado na simulação)
    const respostas = [] as any[];

    // Array para armazenar todas as mensagens da simulação
    const simulationMessages: SimulationMessage[] = [];

    // Função para adicionar mensagem à simulação
    const addSimulationMessage = (text: string, sender: 'user' | 'system') => {
      simulationMessages.push({
        id: Date.now().toString() + Math.random(),
        text,
        sender,
        timestamp: new Date(),
        status: sender === 'system' ? 'delivered' : undefined
      });
    };

    // Função para enviar mensagem WhatsApp com proteção de erro
    const sendWhatsAppMessage = async (phone: string, message: string) => {
      try {
        await whatsappMeta.sendMessage(phone, message);
      } catch (error) {
        console.error('Erro ao enviar mensagem WhatsApp:', error);
      }
    };

    // Função para receber mensagem WhatsApp com proteção de erro
    const receiveWhatsAppMessage = async (phone: string, message: string) => {
      try {
        await whatsappMeta.receiveMessage(phone, message);
      } catch (error) {
        console.error('Erro ao receber mensagem WhatsApp:', error);
      }
    };

    // PRIMEIRA MENSAGEM - Primeiro contato (atendente envia)
    const modeloNegocio = lead.modelo_de_negocio || 'automação de marketing';
    const primeiroContato = `Olá ${lead.nome}! 👋\n\nObrigado por se cadastrar em nosso sistema!\n\nAnalisando suas respostas, vejo que você trabalha com ${modeloNegocio}.\n\nVou preparar uma proposta personalizada para você!\n\nEnquanto isso, que tal conhecer nossos serviços?\n\n💼 Automação de Marketing\n📊 Relatórios Avançados\n🎯 Segmentação Inteligente`;
    
    addSimulationMessage(primeiroContato, 'system');
    await sendWhatsAppMessage(lead.telefone, primeiroContato);

    // RESPOSTA DO USUÁRIO 1
    const respostaUsuario1 = 'Oi! Quero saber mais sobre os planos!';
    addSimulationMessage(respostaUsuario1, 'user');
    await receiveWhatsAppMessage(lead.telefone, respostaUsuario1);

    // SEGUNDA MENSAGEM - Apresentação dos planos (atendente envia)
    const planosMessage = `Perfeito ${lead.nome}! 💰\n\nBaseado no seu modelo de negócio (${modeloNegocio}), temos planos ideais para você:\n\n📋 Plano Básico: R$ 97/mês\n- Até 1.000 contatos\n- Automações básicas\n- Suporte por email\n\n📋 Plano Pro: R$ 197/mês\n- Até 10.000 contatos\n- Automações avançadas\n- Suporte prioritário\n\n📋 Plano Enterprise: R$ 497/mês\n- Contatos ilimitados\n- Recursos exclusivos\n- Suporte 24/7\n\nQual plano te interessa?`;
    addSimulationMessage(planosMessage, 'system');
    await sendWhatsAppMessage(lead.telefone, planosMessage);

    // RESPOSTA DO USUÁRIO 2
    const respostaUsuario2 = 'Quero o Plano Pro! Como faço para contratar?';
    addSimulationMessage(respostaUsuario2, 'user');
    await receiveWhatsAppMessage(lead.telefone, respostaUsuario2);

    // TERCEIRA MENSAGEM - Agendamento (atendente envia)
    const agendamentoMessage = `Excelente escolha ${lead.nome}! 🎉\n\nVou agendar uma reunião para você conhecer o Plano Pro!\n\nDisponível:\n🕐 Segunda a Sexta: 9h às 18h\n🕐 Sábado: 9h às 12h\n\nQual horário prefere?`;
    addSimulationMessage(agendamentoMessage, 'system');
    await sendWhatsAppMessage(lead.telefone, agendamentoMessage);

    // RESPOSTA DO USUÁRIO 3
    const respostaUsuario3 = 'Perfeito! Quero segunda às 14h';
    addSimulationMessage(respostaUsuario3, 'user');
    await receiveWhatsAppMessage(lead.telefone, respostaUsuario3);

    // QUARTA MENSAGEM - Confirmação (atendente envia)
    const confirmacao = `Perfeito ${lead.nome}! ✅\n\nReunião agendada para segunda-feira às 14h.\n\nVou enviar um link do Google Meet 30 minutos antes.\n\nAté lá! 👋`;
    addSimulationMessage(confirmacao, 'system');
    await sendWhatsAppMessage(lead.telefone, confirmacao);

    // AGORA COMEÇA O FLUXO DE FOLLOW-UP (usuário não responde mais)

    // QUINTA MENSAGEM - Follow-up 1 (24h depois)
    const followUp1 = `Oi ${lead.nome}! 👋\n\nPassou 24h e não vi sua confirmação...\n\nAinda tem interesse na reunião de segunda?\n\nSe sim, confirme aqui! 👍`;
    addSimulationMessage(followUp1, 'system');
    await sendWhatsAppMessage(lead.telefone, followUp1);

    // SEXTA MENSAGEM - Follow-up 2 (48h depois)
    const followUp2 = `${lead.nome}, tudo bem? 🤔\n\nEstou aqui para ajudar!\n\nQue tal uma demonstração gratuita?\n\n🎁 7 dias grátis para experimentar!`;
    addSimulationMessage(followUp2, 'system');
    await sendWhatsAppMessage(lead.telefone, followUp2);

    // SÉTIMA MENSAGEM - Follow-up 3 (72h depois)
    const followUp3 = `Oi ${lead.nome}! 👋\n\nÚltima chance de conhecer nossa plataforma!\n\n📅 Disponível hoje mesmo\n🎁 7 dias grátis\n💰 50% de desconto no primeiro mês\n\nQuer experimentar?`;
    addSimulationMessage(followUp3, 'system');
    await sendWhatsAppMessage(lead.telefone, followUp3);

    // OITAVA MENSAGEM - Follow-up 4 (96h depois)
    const followUp4 = `${lead.nome}, última tentativa! 🎯\n\n🎁 14 dias grátis\n💰 70% de desconto\n📞 Suporte prioritário\n\nNão perca essa oportunidade!`;
    addSimulationMessage(followUp4, 'system');
    await sendWhatsAppMessage(lead.telefone, followUp4);

    // NONA MENSAGEM - Follow-up 5 (120h depois)
    const followUp5 = `Oi ${lead.nome}! 👋\n\nVejo que você não respondeu...\n\nTalvez não seja o momento certo?\n\nSe mudar de ideia, estamos aqui!\n\nBoa sorte! 🍀`;
    addSimulationMessage(followUp5, 'system');
    await sendWhatsAppMessage(lead.telefone, followUp5);

    // DÉCIMA MENSAGEM - Follow-up 6 (144h depois)
    const followUp6 = `${lead.nome}, última chance mesmo! 🚨\n\n🎁 30 dias grátis\n💰 90% de desconto\n🎯 Garantia de 30 dias\n\nÚltima oportunidade!`;
    addSimulationMessage(followUp6, 'system');
    await sendWhatsAppMessage(lead.telefone, followUp6);

    // DÉCIMA PRIMEIRA MENSAGEM - Follow-up 7 (168h depois) - REMOÇÃO DO FLUXO
    const followUp7 = `Entendemos ${lead.nome}! 🙏\n\nVocê será removido do nosso fluxo de contato.\n\nObrigado pelo seu tempo!\n\nSe precisar, estamos aqui!\n\nBoa sorte em seus projetos! 👋`;
    addSimulationMessage(followUp7, 'system');
    await sendWhatsAppMessage(lead.telefone, followUp7);

    whatsappMeta.showMessageHistory();

    // Salvar no banco como lead inativo (não respondeu)
    try {
      db.prepare(`
        INSERT OR REPLACE INTO leads_finais (lead_id, nome, telefone, email, modelo_de_negocio, status)
        VALUES (?, ?, ?, ?, ?, 'inativo_sem_resposta')
      `).run(lead.id, lead.nome, lead.telefone, lead.email, modeloNegocio);
    } catch (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      // Continua mesmo se der erro no banco
    }

    return NextResponse.json({
      success: true,
      message: 'Simulação de fluxo completo com follow-up concluída!',
      lead: {
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        id: lead.id
      },
      respostas: respostas.length,
      cenarios: ['Primeiro contato', 'Resposta usuário', 'Apresentação', 'Resposta usuário', 'Agendamento', 'Resposta usuário', 'Follow-up 1', 'Follow-up 2', 'Follow-up 3', 'Follow-up 4', 'Follow-up 5', 'Follow-up 6', 'Remoção do fluxo'],
      status: 'Lead removido do fluxo - Sem resposta',
      leadId: lead.id,
      messages: simulationMessages,

      totalMensagens: simulationMessages.length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro na simulação',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 