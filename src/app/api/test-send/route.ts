import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';
import { notificationService } from '@/app/lib/notification-service';

export async function GET() {
  return await sendLead();
}

export async function POST() {
  return await sendLead();
}

async function sendLead() {
  try {
    console.log('🧪 Teste de envio manual iniciado...');
    
    // Buscar o último lead criado
    const lead = db.prepare('SELECT * FROM leads ORDER BY id DESC LIMIT 1').get() as any;
    
    if (!lead) {
      return NextResponse.json({ error: 'Nenhum lead encontrado' }, { status: 404 });
    }

    console.log('✅ Lead encontrado:', lead.nome);

    // Buscar respostas do lead
    const respostas = db.prepare(`
      SELECT 
        r.resposta_usuario,
        p.texto_pergunta,
        p.ordem
      FROM respostas r
      JOIN perguntas p ON r.pergunta_id = p.id
      WHERE r.lead_id = ?
      ORDER BY p.ordem
    `).all(lead.id) as any[];

    console.log('📝 Respostas encontradas:', respostas.length);

    // Preparar dados para notificação
    const notificationData = {
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      respostas: respostas.map((r: any) => ({
        pergunta: r.texto_pergunta,
        resposta: r.resposta_usuario
      })),
      leadId: lead.id
    };

    console.log('📱 Enviando notificação do lead...');
    
    const resultadoEnvio = await notificationService.sendLeadNotification(notificationData);

    if (resultadoEnvio) {
      console.log('✅ Notificação enviada com sucesso!');
      return NextResponse.json({ 
        success: true, 
        message: 'Lead enviado para atendente com sucesso',
        lead: lead.nome
      });
    } else {
      console.log('❌ Falha no envio da notificação');
      return NextResponse.json({ 
        success: false, 
        message: 'Erro ao enviar para atendente' 
      });
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno' 
    }, { status: 500 });
  }
} 