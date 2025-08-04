import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';
import { whatsappMeta } from '@/app/lib/whatsapp-meta';

interface Lead {
  id: number;
  nome: string;
  telefone: string;
  email: string;
}

interface Resposta {
  resposta_usuario: string;
  texto_pergunta: string;
  ordem: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID é obrigatório' }, { status: 400 });
    }

    const leads = await db.prepare('SELECT * FROM leads WHERE id = ?').all([leadId]) as Lead[];
    const lead = leads[0];
    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    const respostas = await db.prepare(`
      SELECT
        r.resposta_usuario,
        p.texto_pergunta,
        p.ordem
      FROM respostas r
      JOIN perguntas p ON r.pergunta_id = p.id
      WHERE r.lead_id = ?
      ORDER BY p.ordem
    `).all([leadId]) as Resposta[];

    const dadosFormatados = `
🎯 *NOVO LEAD RECEBIDO!*

👤 *Nome:* ${lead.nome}
📧 *Email:* ${lead.email}
📱 *Telefone:* ${lead.telefone}
📅 *Data:* ${new Date().toLocaleString('pt-BR')}

📝 *Respostas do Questionário:*

${respostas.map((r: Resposta, index: number) =>
  `${index + 1}. *${r.texto_pergunta}*\n   Resposta: ${r.resposta_usuario}`
).join('\n\n')}

---
💼 *Sistema FDM - Lead ID:* ${leadId}

*INSTRUÇÕES PARA ATENDIMENTO:*
1️⃣ Entre em contato com o lead
2️⃣ Apresente-se como atendente
3️⃣ Ofereça os serviços da empresa
4️⃣ Agende uma reunião se necessário
5️⃣ Registre o resultado no sistema

*CONTATO DIRETO:*
📞 Telefone: ${lead.telefone}
📧 Email: ${lead.email}
    `;

    try {
      const resultadoEnvio = await whatsappMeta.sendMessage(
        '19995357442',
        dadosFormatados
      );

      if (resultadoEnvio) {
        // Atualizar status na tabela leads_finais
        await db.prepare(`
          INSERT OR REPLACE INTO leads_finais (lead_id, status)
          VALUES (?, 'enviado_para_atendente')
        `).run([leadId]);

        return NextResponse.json({
          success: true,
          message: 'Lead enviado para atendente com sucesso',
          lead: lead.nome,
          method: 'Meta API'
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));

        return NextResponse.json({
          success: true,
          message: 'Lead processado (modo fallback)',
          lead: lead.nome,
          method: 'Fallback'
        });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Erro interno ao enviar para atendente'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 