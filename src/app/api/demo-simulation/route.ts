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

interface Resposta {
  resposta_usuario: string;
  texto_pergunta: string;
  ordem: number;
}

export async function GET() {
  try {
    const leads = await db.prepare('SELECT * FROM leads ORDER BY id DESC LIMIT 1').all() as Lead[];
    
    if (leads.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum lead encontrado. Cadastre um lead primeiro!',
        suggestion: 'Acesse http://localhost:3000/Form'
      });
    }

    const lead = leads[0];

    const respostas = await db.prepare(`
      SELECT
        r.resposta_usuario,
        p.texto_pergunta,
        p.ordem
      FROM respostas r
      JOIN perguntas p ON r.pergunta_id = p.id
      WHERE r.lead_id = ?
      ORDER BY p.ordem
    `).all([lead.id]) as Resposta[];

    // Enviar primeiro contato sempre
    const primeiroContato = `Olá ${lead.nome}! 👋\n\nObrigado por se cadastrar em nosso sistema!\n\nVou analisar suas respostas e um de nossos especialistas entrará em contato em breve.\n\nEnquanto isso, que tal conhecer nossos serviços?\n\n💼 Automação de Marketing\n📊 Relatórios Avançados\n🎯 Segmentação Inteligente`;
    
    await whatsappMeta.sendMessage(lead.telefone, primeiroContato);

    await simulatePositiveResponse(lead);
    await simulateNoResponse(lead);
    await simulateLeadExit(lead);

    whatsappMeta.showMessageHistory();

    return NextResponse.json({
      success: true,
      message: 'Simulação de fluxo completo concluída!',
      lead: {
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        id: lead.id
      },
      respostas: respostas.length,
      cenarios: ['Resposta positiva', 'Sem resposta', 'Saída do fluxo'],
      status: 'Fluxo completo simulado'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro na simulação',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function simulatePositiveResponse(lead: Lead) {
  await whatsappMeta.receiveMessage(lead.telefone, 'Oi! Quero saber mais sobre os planos!');
  
  await whatsappMeta.sendMessage(lead.telefone, `Perfeito ${lead.nome}! 💰\n\nTemos diferentes planos disponíveis:\n\n📋 Plano Básico: R$ 97/mês\n- Até 1.000 contatos\n- Automações básicas\n- Suporte por email\n\n📋 Plano Pro: R$ 197/mês\n- Até 10.000 contatos\n- Automações avançadas\n- Suporte prioritário\n\n📋 Plano Enterprise: R$ 497/mês\n- Contatos ilimitados\n- Recursos exclusivos\n- Suporte 24/7\n\nQual plano te interessa?`);
  
  await whatsappMeta.receiveMessage(lead.telefone, 'Quero o Plano Pro! Como faço para contratar?');
  
  await whatsappMeta.sendMessage(lead.telefone, `Excelente escolha ${lead.nome}! 🎉\n\nVou agendar uma reunião para você conhecer o Plano Pro!\n\nDisponível:\n🕐 Segunda a Sexta: 9h às 18h\n🕐 Sábado: 9h às 12h\n\nQual horário prefere?`);
  
  db.prepare(`
    INSERT OR REPLACE INTO leads_finais (lead_id, nome, telefone, email, modelo_de_negocio, respostas_json, status)
    VALUES (?, ?, ?, ?, ?, ?, 'qualificado')
  `).run(lead.id, lead.nome, lead.telefone, lead.email, lead.modelo_de_negocio, '[]');
}

async function simulateNoResponse(lead: Lead) {
  await whatsappMeta.receiveMessage(lead.telefone, 'Oi! Quero saber mais...');
  
  await whatsappMeta.sendMessage(lead.telefone, `Olá ${lead.nome}! 👋\n\nComo posso ajudá-lo hoje?`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await whatsappMeta.sendMessage(lead.telefone, `Oi ${lead.nome}! 👋\n\nNão esqueça que estamos aqui para ajudar!\n\nQue tal agendar uma demonstração gratuita?\n\n📅 Disponível hoje mesmo!`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await whatsappMeta.sendMessage(lead.telefone, `${lead.nome}, última chance!\n\n🎁 Oferecemos 7 dias grátis!\n\nQuer experimentar?`);
  
  db.prepare(`
    INSERT OR REPLACE INTO leads_finais (lead_id, nome, telefone, email, modelo_de_negocio, respostas_json, status)
    VALUES (?, ?, ?, ?, ?, ?, 'inativo_sem_resposta')
  `).run(lead.id, lead.nome, lead.telefone, lead.email, lead.modelo_de_negocio, '[]');
}

async function simulateLeadExit(lead: Lead) {
  await whatsappMeta.receiveMessage(lead.telefone, 'Não tenho interesse, obrigado');
  
  await whatsappMeta.sendMessage(lead.telefone, `Entendemos ${lead.nome}! 🙏\n\nObrigado pelo seu tempo.\n\nSe mudar de ideia, estamos aqui!\n\nBoa sorte em seus projetos! 👋`);
  
  db.prepare(`
    INSERT OR REPLACE INTO leads_finais (lead_id, nome, telefone, email, modelo_de_negocio, respostas_json, status)
    VALUES (?, ?, ?, ?, ?, ?, 'nao_interessado')
  `).run(lead.id, lead.nome, lead.telefone, lead.email, lead.modelo_de_negocio, '[]');
} 