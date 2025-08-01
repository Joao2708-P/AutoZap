import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';

// GET - Relatório diário de disparos
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const data = searchParams.get('data') || new Date().toISOString().split('T')[0];

        // Relatório de disparos do dia
        const disparosHoje = db.prepare(`
            SELECT 
                m.ordermensagem as lead_id,
                l.nome,
                l.telefone,
                m.texto_mensagem,
                m.tag
            FROM mensagens m
            JOIN leads l ON m.ordermensagem = l.id
            WHERE m.tag = 'disparo_enviado'
            ORDER BY m.id DESC
        `).all();

        // Estatísticas do dia
        const totalDisparos = disparosHoje.length;
        const respostasHoje = db.prepare(`
            SELECT COUNT(*) as total FROM mensagens 
            WHERE tag = 'resposta_lead' 
            AND DATE('now') = DATE('now')
        `).get() as any;
        const taxaResposta = totalDisparos > 0 ? (respostasHoje.total / totalDisparos * 100).toFixed(2) : '0';

        // Leads ativos no sistema
        const leadsAtivos = db.prepare(`
            SELECT 
                l.nome,
                l.telefone,
                c.numero_de_tentativas,
                c.status_resposta
            FROM leads l
            JOIN contatos c ON l.id = c.lead_id
            WHERE c.status_resposta != 'finalizado'
            ORDER BY c.id DESC
        `).all();

        // Leads que responderam hoje
        const leadsRespondidosHoje = db.prepare(`
            SELECT 
                l.nome,
                l.telefone
            FROM leads l
            JOIN mensagens m ON l.id = m.ordermensagem
            WHERE m.tag = 'resposta_lead'
            GROUP BY l.id
        `).all();

        const relatorio = {
            data: data,
            estatisticas: {
                total_disparos: totalDisparos,
                disparos_respondidos: respostasHoje.total,
                taxa_resposta: `${taxaResposta}%`,
                leads_ativos: leadsAtivos.length,
                leads_respondidos_hoje: leadsRespondidosHoje.length
            },
            disparos: disparosHoje,
            leads_ativos: leadsAtivos,
            leads_respondidos_hoje: leadsRespondidosHoje
        };

        return NextResponse.json({
            success: true,
            message: 'Relatório gerado com sucesso',
            relatorio: relatorio
        });

    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        return NextResponse.json(
            { message: 'Erro ao gerar relatório' },
            { status: 500 }
        );
    }
}

// POST - Configurar sistema de disparos
export async function POST(request: NextRequest) {
    try {
        const { max_disparos, intervalo_horas, mensagens } = await request.json();

        // Atualizar mensagens se fornecidas
        if (mensagens && Array.isArray(mensagens)) {
            mensagens.forEach((mensagem, index) => {
                if (mensagem) {
                    db.prepare(`
                        UPDATE mensagens 
                        SET texto_mensagem = ?
                        WHERE tag = 'disparo_automatico' AND ordermensagem = ?
                    `).run(mensagem, index + 1);
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Configurações atualizadas com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar configurações:', error);
        return NextResponse.json(
            { message: 'Erro ao atualizar configurações' },
            { status: 500 }
        );
    }
} 