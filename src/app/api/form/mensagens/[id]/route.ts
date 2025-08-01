import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Buscar mensagem específica por ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        const mensagem = db.prepare('SELECT * FROM mensagens WHERE id = ?').get(id);

        if (!mensagem) {
            return NextResponse.json(
                { message: 'Mensagem não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Mensagem encontrada',
            mensagem: mensagem 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar mensagem' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar mensagem específica
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        const { texto_mensagem, tag, ordermensagem } = await request.json();

        if (!texto_mensagem) {
            return NextResponse.json(
                { message: 'Texto da mensagem é obrigatório' },
                { status: 400 }
            );
        }

        const mensagemExistente = db.prepare('SELECT * FROM mensagens WHERE id = ?').get(id);
        
        if (!mensagemExistente) {
            return NextResponse.json(
                { message: 'Mensagem não encontrada' },
                { status: 404 }
            );
        }

        const mensagemAtualizada = db.prepare(
            'UPDATE mensagens SET texto_mensagem = ?, tag = ?, ordermensagem = ? WHERE id = ?'
        ).run(texto_mensagem, tag || null, ordermensagem || 0, id);

        return NextResponse.json({ 
            message: 'Mensagem atualizada com sucesso',
            mensagem: mensagemAtualizada 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao atualizar mensagem' },
            { status: 500 }
        );
    }
}

// DELETE - Deletar mensagem específica
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        
        const mensagemExistente = db.prepare('SELECT * FROM mensagens WHERE id = ?').get(id);
        
        if (!mensagemExistente) {
            return NextResponse.json(
                { message: 'Mensagem não encontrada' },
                { status: 404 }
            );
        }

        db.prepare('DELETE FROM mensagens WHERE id = ?').run(id);

        return NextResponse.json({ 
            message: 'Mensagem deletada com sucesso' 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao deletar mensagem' },
            { status: 500 }
        );
    }
} 