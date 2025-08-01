import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Exibir perguntas para o usuário
export async function GET() {
    try {
        const perguntas = db.prepare(`
            SELECT id, texto_pergunta, ordem
            FROM perguntas 
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