import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar todas as respostas
export async function GET() {
    try {
        const respostas = db.prepare(`
            SELECT r.*, p.texto_pergunta, l.nome as nome_lead 
            FROM respostas r 
            JOIN perguntas p ON r.pergunta_id = p.id 
            JOIN leads l ON r.lead_id = l.id
            ORDER BY r.created_at DESC
        `).all();
        
        return NextResponse.json({ 
            message: 'Respostas encontradas',
            respostas: respostas 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar respostas' },
            { status: 500 }
        );
    }
}

// POST - Criar ou atualizar resposta
export async function POST(request: NextRequest) {
    try {
        console.log('📝 Recebendo dados da resposta...');
        
        const body = await request.json();
        console.log('📋 Dados recebidos:', body);
        
        const { pergunta_id, lead_id, resposta_usuario } = body;

        console.log('🔍 Validando dados:', { pergunta_id, lead_id, resposta_usuario });

        if (!pergunta_id || !lead_id) {
            console.log('❌ Campos obrigatórios faltando');
            return NextResponse.json(
                { message: 'ID da pergunta e ID do lead são obrigatórios' },
                { status: 400 }
            );
        }

        const respostaTrim = (resposta_usuario ?? '').toString().trim();
        if (!respostaTrim) {
            return NextResponse.json(
                { message: 'Resposta do usuário é obrigatória' },
                { status: 400 }
            );
        }

        // Verificar se a pergunta existe e está ativa
        console.log('🔍 Verificando pergunta...');
        const pergunta = db.prepare('SELECT * FROM perguntas WHERE id = ? AND ativa = 1').get(pergunta_id);
        if (!pergunta) {
            console.log('❌ Pergunta não encontrada ou inativa:', pergunta_id);
            return NextResponse.json(
                { message: 'Pergunta não encontrada ou inativa' },
                { status: 404 }
            );
        }

        // Verificar se o lead existe
        console.log('🔍 Verificando lead...');
        const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead_id);
        if (!lead) {
            console.log('❌ Lead não encontrado:', lead_id);
            return NextResponse.json(
                { message: 'Lead não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se já existe uma resposta para esta pergunta e lead
        console.log('🔍 Verificando resposta existente...');
        const respostaExistente = db.prepare(
            'SELECT * FROM respostas WHERE pergunta_id = ? AND lead_id = ?'
        ).get(pergunta_id, lead_id);

        let resultado;
        
        if (respostaExistente) {
            console.log('🔄 Atualizando resposta existente...');
            // Atualizar resposta existente
            resultado = db.prepare(
                'UPDATE respostas SET resposta_usuario = ?, updated_at = CURRENT_TIMESTAMP WHERE pergunta_id = ? AND lead_id = ?'
            ).run(respostaTrim, pergunta_id, lead_id);
            
            console.log('✅ Resposta atualizada com sucesso');
        } else {
            console.log('🆕 Criando nova resposta...');
            // Criar nova resposta
            resultado = db.prepare(
                'INSERT INTO respostas (pergunta_id, lead_id, resposta_usuario) VALUES (?, ?, ?)'
            ).run(pergunta_id, lead_id, respostaTrim);
            
            console.log('✅ Nova resposta criada com sucesso');
        }

        return NextResponse.json({ 
            message: 'Resposta processada com sucesso',
            resposta: resultado 
        });
    } catch (error) {
        console.error('❌ Erro ao processar resposta:', error);
        return NextResponse.json(
            { message: 'Erro ao processar resposta', error: error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Erro desconhecido' },
            { status: 500 }
        );
    }
} 