import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Buscar respostas de um lead específico
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verificar se o lead existe
        const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
        if (!lead) {
            return NextResponse.json(
                { message: 'Lead não encontrado' },
                { status: 404 }
            );
        }

        // Buscar respostas com perguntas
        const respostas = db.prepare(`
            SELECT 
                r.id,
                r.resposta_usuario,
                r.created_at,
                p.texto_pergunta,
                p.ordem
            FROM respostas r
            JOIN perguntas p ON r.pergunta_id = p.id
            WHERE r.lead_id = ?
            ORDER BY p.ordem
        `).all(id);

        return NextResponse.json({ 
            message: 'Respostas encontradas',
            respostas: respostas 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar respostas' },
            { status: 500 }
        );
    }
}

// POST - Registrar resposta do atendente
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const leadId = params.id;
        const { atendente_telefone, resposta_atendente, status_atendimento } = await request.json();

        // Verificar se o lead existe
        const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
        if (!lead) {
            return NextResponse.json(
                { message: 'Lead não encontrado' },
                { status: 404 }
            );
        }

        // Registrar resposta do atendente na tabela mensagens
        db.prepare(`
            INSERT INTO mensagens (texto_mensagem, tag, ordermensagem)
            VALUES (?, 'resposta_atendente', ?)
        `).run(resposta_atendente, leadId);

        // Atualizar status do lead final
        db.prepare(`
            UPDATE leads_finais 
            SET status = ?,
                atendente_telefone = ?
            WHERE lead_id = ?
        `).run(status_atendimento || 'em_atendimento', atendente_telefone, leadId);

        // Se o atendente respondeu, parar os disparos automáticos
        if (status_atendimento === 'respondido') {
            db.prepare(`
                UPDATE contatos 
                SET status_resposta = 'respondido'
                WHERE lead_id = ?
            `).run(leadId);
        }

        return NextResponse.json({ 
            message: 'Resposta do atendente registrada com sucesso',
            lead_id: leadId,
            atendente: atendente_telefone,
            status: status_atendimento
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao registrar resposta do atendente' },
            { status: 500 }
        );
    }
} 