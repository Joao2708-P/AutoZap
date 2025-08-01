import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// POST - Enviar relatório diário via WhatsApp
export async function POST(request: NextRequest) {
    try {
        const { data_hoje } = await request.json();
        
        // Buscar leads do dia
        const leadsDoDia = db.prepare(`
            SELECT * FROM leads 
            WHERE DATE(data_envio) = DATE(?)
            ORDER BY data_envio ASC
        `).all(data_hoje || new Date().toISOString().split('T')[0]);

        if (leadsDoDia.length === 0) {
            return NextResponse.json({ 
                message: 'Nenhum lead encontrado para hoje',
                leads_count: 0
            });
        }

        // Formatar relatório para WhatsApp
        const relatorio = `
📊 RELATÓRIO DIÁRIO - ${new Date().toLocaleDateString('pt-BR')}

🎯 TOTAL DE LEADS: ${leadsDoDia.length}

📋 LEADS DO DIA:
${leadsDoDia.map((lead, index) => {
    const respostas = JSON.parse(lead.respostas_json);
    return `
${index + 1}. ${lead.nome}
   📞 ${lead.telefone}
   📧 ${lead.email}
   💼 ${lead.modelo_de_negocio}
   ⏰ ${new Date(lead.data_envio).toLocaleTimeString('pt-BR')}
   📝 ${respostas.length} respostas`;
}).join('\n')}

📈 STATUS:
✅ Enviados para Sheet: ${leadsDoDia.filter(l => l.enviado_para_sheet).length}
⏳ Pendentes: ${leadsDoDia.filter(l => !l.enviado_para_sheet).length}

🔗 Google Sheets atualizado automaticamente!
        `;

        // Aqui você integraria com WhatsApp Business API
        // Por enquanto, vou retornar o relatório formatado

        return NextResponse.json({ 
            message: 'Relatório diário preparado para envio via WhatsApp',
            relatorio: relatorio,
            leads_count: leadsDoDia.length,
            leads_data: leadsDoDia
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao gerar relatório diário' },
            { status: 500 }
        );
    }
} 