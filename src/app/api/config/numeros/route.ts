import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';

// GET - Listar números configurados
export async function GET() {
    try {
        // Buscar números de atendentes únicos
        const atendentes = db.prepare(`
            SELECT DISTINCT atendente_telefone
            FROM leads_finais 
            WHERE atendente_telefone IS NOT NULL
            ORDER BY atendente_telefone
        `).all() as Array<{ atendente_telefone: string }>;

        return NextResponse.json({
            success: true,
            message: 'Números de atendentes encontrados',
            atendentes: atendentes.map(a => a.atendente_telefone)
        });

    } catch (error) {
        console.error('❌ Erro ao buscar números:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar números' },
            { status: 500 }
        );
    }
}

// POST - Configurar número padrão
export async function POST(request: NextRequest) {
    try {
        const { numero_padrao, tipo } = await request.json();

        if (!numero_padrao || !tipo) {
            return NextResponse.json(
                { message: 'Número e tipo são obrigatórios' },
                { status: 400 }
            );
        }

        // Registrar configuração na tabela mensagens
        db.prepare(`
            INSERT INTO mensagens (texto_mensagem, tag, ordermensagem)
            VALUES (?, 'config_numero', ?)
        `).run(`${tipo}: ${numero_padrao}`, 1);

        return NextResponse.json({
            success: true,
            message: 'Número configurado com sucesso',
            numero: numero_padrao,
            tipo: tipo
        });

    } catch (error) {
        console.error('❌ Erro ao configurar número:', error);
        return NextResponse.json(
            { message: 'Erro ao configurar número' },
            { status: 500 }
        );
    }
} 