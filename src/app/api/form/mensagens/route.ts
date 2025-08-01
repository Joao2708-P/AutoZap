import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar todas as mensagens
export async function GET() {
    try {
        const mensagens = db.prepare('SELECT * FROM mensagens ORDER BY ordermensagem').all();
        
        return NextResponse.json({ 
            message: 'Mensagens encontradas',
            mensagens: mensagens 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar mensagens' },
            { status: 500 }
        );
    }
}

// POST - Criar nova mensagem
export async function POST(request: NextRequest) {
    try {
        const { texto_mensagem, tag, ordermensagem } = await request.json();

        if (!texto_mensagem) {
            return NextResponse.json(
                { message: 'Texto da mensagem é obrigatório' },
                { status: 400 }
            );
        }

        const novaMensagem = db.prepare(
            'INSERT INTO mensagens (texto_mensagem, tag, ordermensagem) VALUES (?, ?, ?)'
        ).run(texto_mensagem, tag || null, ordermensagem || 0);

        return NextResponse.json({ 
            message: 'Mensagem criada com sucesso',
            mensagem: novaMensagem 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao criar mensagem' },
            { status: 500 }
        );
    }
} 