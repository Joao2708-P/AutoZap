import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar perguntas para o usuário responder
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const usuarioId = searchParams.get('usuario_id');

        if (!usuarioId) {
            return NextResponse.json(
                { message: 'ID do usuário é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se o usuário existe
        const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuarioId);
        if (!usuario) {
            return NextResponse.json(
                { message: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Buscar perguntas que o usuário ainda não respondeu
        const perguntasNaoRespondidas = db.prepare(`
            SELECT p.id, p.texto_pergunta, p.ordem
            FROM perguntas p 
            WHERE p.ativa = 1 
            AND p.id NOT IN (
                SELECT r.pergunta_id 
                FROM respostas r 
                WHERE r.usuario_id = ?
            )
            ORDER BY p.ordem ASC, p.created_at ASC
        `).all(usuarioId);

        // Buscar perguntas já respondidas pelo usuário
        const perguntasRespondidas = db.prepare(`
            SELECT p.id, p.texto_pergunta, p.ordem, r.resposta_usuario, r.id as resposta_id
            FROM perguntas p 
            JOIN respostas r ON p.id = r.pergunta_id
            WHERE r.usuario_id = ?
            ORDER BY p.ordem ASC, r.created_at ASC
        `).all(usuarioId);
        
        return NextResponse.json({ 
            message: 'Perguntas encontradas',
            usuario: {
                id: usuario.id,
                nome: usuario.nome
            },
            perguntas_nao_respondidas: perguntasNaoRespondidas,
            perguntas_respondidas: perguntasRespondidas
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar perguntas' },
            { status: 500 }
        );
    }
} 