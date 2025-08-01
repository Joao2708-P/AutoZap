import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Buscar resposta específica por ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const resposta = db.prepare(`
            SELECT r.*, p.texto_pergunta, l.nome as nome_lead 
            FROM respostas r 
            JOIN perguntas p ON r.pergunta_id = p.id 
            JOIN leads l ON r.lead_id = l.id
            WHERE r.id = ?
        `).get(id);

        if (!resposta) {
            return NextResponse.json(
                { message: 'Resposta não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Resposta encontrada',
            resposta: resposta 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar resposta' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar resposta específica
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const { resposta_usuario } = await request.json();

        if (!resposta_usuario) {
            return NextResponse.json(
                { message: 'Resposta do lead é obrigatória' },
                { status: 400 }
            );
        }

        const respostaExistente = db.prepare('SELECT * FROM respostas WHERE id = ?').get(id);
        
        if (!respostaExistente) {
            return NextResponse.json(
                { message: 'Resposta não encontrada' },
                { status: 404 }
            );
        }

        const respostaAtualizada = db.prepare(
            'UPDATE respostas SET resposta_usuario = ? WHERE id = ?'
        ).run(resposta_usuario, id);

        return NextResponse.json({ 
            message: 'Resposta atualizada com sucesso',
            resposta: respostaAtualizada 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao atualizar resposta' },
            { status: 500 }
        );
    }
}

// DELETE - Deletar resposta específica
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        
        const respostaExistente = db.prepare('SELECT * FROM respostas WHERE id = ?').get(id);
        
        if (!respostaExistente) {
            return NextResponse.json(
                { message: 'Resposta não encontrada' },
                { status: 404 }
            );
        }

        db.prepare('DELETE FROM respostas WHERE id = ?').run(id);

        return NextResponse.json({ 
            message: 'Resposta deletada com sucesso' 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao deletar resposta' },
            { status: 500 }
        );
    }
}
