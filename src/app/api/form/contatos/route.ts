import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar todos os contatos
export async function GET() {
    try {
        const contatos = db.prepare('SELECT * FROM contatos').all();
        
        return NextResponse.json({ 
            message: 'Contatos encontrados',
            contatos: contatos 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar contatos' },
            { status: 500 }
        );
    }
}

// POST - Criar novo contato
export async function POST(request: NextRequest) {
    try {
        const { usuario_id, numero_de_tentativas, ultima_tentativa, status_resposta } = await request.json();

        if (!usuario_id) {
            return NextResponse.json(
                { message: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se o usuário existe
        const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuario_id);
        if (!usuario) {
            return NextResponse.json(
                { message: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const novoContato = db.prepare(
            'INSERT INTO contatos (usuario_id, numero_de_tentativas, ultima_tentativa, status_resposta) VALUES (?, ?, ?, ?)'
        ).run(usuario_id, numero_de_tentativas || 0, ultima_tentativa || null, status_resposta || 'pendente');

        return NextResponse.json({ 
            message: 'Contato criado com sucesso',
            contato: novoContato 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao criar contato' },
            { status: 500 }
        );
    }
} 