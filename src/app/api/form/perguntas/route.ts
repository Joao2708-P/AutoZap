import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar todas as perguntas ativas
export async function GET() {
    try {
        const perguntas = db.prepare(`
            SELECT * FROM perguntas 
            WHERE ativa = 1 
            ORDER BY ordem ASC, created_at ASC
        `).all();
        
        return NextResponse.json({ 
            message: 'Perguntas encontradas',
            perguntas: perguntas 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar perguntas' },
            { status: 500 }
        );
    }
}

// POST - Criar nova pergunta (para o chefe/admin)
export async function POST(request: NextRequest) {
    try {
        const { texto_pergunta, ordem } = await request.json();

        if (!texto_pergunta) {
            return NextResponse.json(
                { message: 'Texto da pergunta é obrigatório' },
                { status: 400 }
            );
        }

        const novaPergunta = db.prepare(
            'INSERT INTO perguntas (texto_pergunta, ordem) VALUES (?, ?)'
        ).run(texto_pergunta, ordem || 0);

        return NextResponse.json({ 
            message: 'Pergunta criada com sucesso',
            pergunta: novaPergunta 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao criar pergunta' },
            { status: 500 }
        );
    }
} 