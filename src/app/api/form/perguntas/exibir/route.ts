import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Exibir perguntas para o usuário
export async function GET() {
    try {
        // console.log('🔍 API Perguntas: Iniciando busca...');
        
        const perguntas = await db.prepare(`
            SELECT id, texto_pergunta, ordem
            FROM perguntas 
            WHERE ativa = 1 
            ORDER BY ordem ASC, created_at ASC
        `).all();
        
        // console.log('✅ API Perguntas: Encontradas', perguntas?.length || 0, 'perguntas');
        
        return NextResponse.json({ 
            message: 'Perguntas encontradas',
            perguntas: perguntas 
        });
    } catch (error) {
        console.error('❌ API Perguntas: Erro:', error);
        return NextResponse.json(
            { 
                message: 'Erro ao buscar perguntas',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
} 