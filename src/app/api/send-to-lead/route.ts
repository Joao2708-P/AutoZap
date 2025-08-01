import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';
import { whatsappMeta } from '@/app/lib/whatsapp-meta';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, message } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID é obrigatório' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as { nome: string; telefone: string } | undefined;
    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    const resultadoEnvio = await whatsappMeta.sendMessage(lead.telefone, message);

    if (resultadoEnvio) {
      return NextResponse.json({
        success: true,
        message: 'Mensagem enviada com sucesso para o lead',
        lead: lead.nome,
        telefone: lead.telefone
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Falha ao enviar mensagem'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 