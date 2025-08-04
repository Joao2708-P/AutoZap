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
    console.log('🚀 [API] Iniciando processamento novo-lead...');
    
    const body = await request.json();
    const { leadId } = body;
    console.log('📝 [API] Lead ID recebido:', leadId);

    if (!leadId) {
      console.log('❌ [API] Lead ID não fornecido');
      return NextResponse.json({ error: 'Lead ID é obrigatório' }, { status: 400 });
    }

    console.log('🔍 [API] Buscando lead no banco de dados...');
    const leads = await db.prepare('SELECT * FROM leads WHERE id = ?').all([leadId]) as Lead[];
    const lead = leads[0];
    console.log('📊 [API] Lead encontrado:', lead ? 'Sim' : 'Não');
    
    if (!lead) {
      console.log('❌ [API] Lead não encontrado no banco');
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    console.log('🔍 [API] Buscando respostas do questionário...');
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
    console.log('📊 [API] Respostas encontradas:', respostas?.length || 0);

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
      console.log('📱 [API] Iniciando envio via WhatsApp...');
      const resultadoEnvio = await whatsappMeta.sendMessage(
        '19995357442',
        dadosFormatados
      );
      console.log('📊 [API] Resultado do envio WhatsApp:', resultadoEnvio);

      if (resultadoEnvio) {
        console.log('✅ [API] WhatsApp enviado, atualizando status...');
        
        // Preparar respostas em JSON
        const respostasJson = JSON.stringify(respostas.map(r => ({
          pergunta: r.texto_pergunta,
          resposta: r.resposta_usuario,
          ordem: r.ordem
        })));
        
        // Inserir todos os dados obrigatórios na tabela leads_finais
        await db.prepare(`
          INSERT OR REPLACE INTO leads_finais (
            lead_id, nome, telefone, email, modelo_de_negocio, respostas_json, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'enviado_para_atendente')
        `).run([
          leadId, 
          lead.nome, 
          lead.telefone, 
          lead.email, 
          lead.modelo_de_negocio || 'Não informado', 
          respostasJson
        ]);
        console.log('✅ [API] Status atualizado no banco');

        return NextResponse.json({
          success: true,
          message: 'Lead enviado para atendente com sucesso',
          lead: lead.nome,
          method: 'Meta API'
        });
      } else {
        console.log('⚠️ [API] WhatsApp falhou, usando fallback...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        return NextResponse.json({
          success: true,
          message: 'Lead processado (modo fallback)',
          lead: lead.nome,
          method: 'Fallback'
        });
      }
    } catch (error) {
      console.error('❌ [API] Erro no envio WhatsApp:', error);
      return NextResponse.json({
        success: false,
        message: 'Erro interno ao enviar para atendente',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ [API] Erro geral na rota novo-lead:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
} 