import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Buscar pergunta específica por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumber = Number(id);
        const pergunta = db.prepare('SELECT * FROM perguntas WHERE id = ?').get(idNumber);

        if (!pergunta) {
            return NextResponse.json(
                { message: 'Pergunta não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Pergunta encontrada',
            pergunta: pergunta 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar pergunta' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar pergunta específica
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumber = Number(id);
        const { texto_pergunta, resposta_usuario, usuario_id } = await request.json();

        if (!texto_pergunta) {
            return NextResponse.json(
                { message: 'Texto da pergunta é obrigatório' },
                { status: 400 }
            );
        }

        const perguntaExistente = db.prepare('SELECT * FROM perguntas WHERE id = ?').get(idNumber);
        
        if (!perguntaExistente) {
            return NextResponse.json(
                { message: 'Pergunta não encontrada' },
                { status: 404 }
            );
        }

        const perguntaAtualizada = db.prepare(
            'UPDATE perguntas SET texto_pergunta = ?, resposta_usuario = ?, usuario_id = ? WHERE id = ?'
        ).run(texto_pergunta, resposta_usuario || null, usuario_id, idNumber);

        return NextResponse.json({ 
            message: 'Pergunta atualizada com sucesso',
            pergunta: perguntaAtualizada 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao atualizar pergunta' },
            { status: 500 }
        );
    }
}

// DELETE - Deletar pergunta específica
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumber = Number(id);
        
        const perguntaExistente = db.prepare('SELECT * FROM perguntas WHERE id = ?').get(idNumber);
        
        if (!perguntaExistente) {
            return NextResponse.json(
                { message: 'Pergunta não encontrada' },
                { status: 404 }
            );
        }

        db.prepare('DELETE FROM perguntas WHERE id = ?').run(idNumber);

        return NextResponse.json({ 
            message: 'Pergunta deletada com sucesso' 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao deletar pergunta' },
            { status: 500 }
        );
    }
} 