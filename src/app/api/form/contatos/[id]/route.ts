import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Buscar contato específico por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumber = Number(id);
        const contato = db.prepare('SELECT * FROM contatos WHERE id = ?').get(idNumber);

        if (!contato) {
            return NextResponse.json(
                { message: 'Contato não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Contato encontrado',
            contato: contato 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar contato' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar contato específico
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumber = Number(id);
        const { usuario_id, numero_de_tentativas, ultima_tentativa, status_resposta } = await request.json();

        const contatoExistente = db.prepare('SELECT * FROM contatos WHERE id = ?').get(idNumber);
        
        if (!contatoExistente) {
            return NextResponse.json(
                { message: 'Contato não encontrado' },
                { status: 404 }
            );
        }

        // Se usuario_id foi fornecido, verificar se existe
        if (usuario_id) {
            const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuario_id);
            if (!usuario) {
                return NextResponse.json(
                    { message: 'Usuário não encontrado' },
                    { status: 404 }
                );
            }
        }

        const contatoAtualizado = db.prepare(
            'UPDATE contatos SET usuario_id = ?, numero_de_tentativas = ?, ultima_tentativa = ?, status_resposta = ? WHERE id = ?'
        ).run(
            usuario_id || contatoExistente.usuario_id,
            numero_de_tentativas || contatoExistente.numero_de_tentativas,
            ultima_tentativa || contatoExistente.ultima_tentativa,
            status_resposta || contatoExistente.status_resposta,
            idNumber
        );

        return NextResponse.json({ 
            message: 'Contato atualizado com sucesso',
            contato: contatoAtualizado 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao atualizar contato' },
            { status: 500 }
        );
    }
}

// DELETE - Deletar contato específico
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumber = Number(id);
        
        const contatoExistente = db.prepare('SELECT * FROM contatos WHERE id = ?').get(idNumber);
        
        if (!contatoExistente) {
            return NextResponse.json(
                { message: 'Contato não encontrado' },
                { status: 404 }
            );
        }

        db.prepare('DELETE FROM contatos WHERE id = ?').run(idNumber);

        return NextResponse.json({ 
            message: 'Contato deletado com sucesso' 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao deletar contato' },
            { status: 500 }
        );
    }
} 