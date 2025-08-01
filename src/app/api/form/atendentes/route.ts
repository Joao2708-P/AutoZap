import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar atendentes e seus leads
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const atendente = searchParams.get('atendente');
        const data = searchParams.get('data') || new Date().toISOString().split('T')[0];

        let query = `
            SELECT 
                lf.atendente_telefone,
                COUNT(*) as total_leads,
                SUM(CASE WHEN lf.status = 'respondido' THEN 1 ELSE 0 END) as leads_respondidos,
                SUM(CASE WHEN lf.status = 'em_atendimento' THEN 1 ELSE 0 END) as leads_em_atendimento,
                SUM(CASE WHEN lf.status = 'pendente' THEN 1 ELSE 0 END) as leads_pendentes
            FROM leads_finais lf
            WHERE DATE(lf.data_envio) = ?
        `;

        const params = [data];
        
        if (atendente) {
            query += ' AND lf.atendente_telefone = ?';
            params.push(atendente);
        }

        query += ' GROUP BY lf.atendente_telefone';

        const atendentes = db.prepare(query).all(...params);

        // Buscar leads detalhados se atendente específico
        let leadsDetalhados: Array<any> = [];
        if (atendente) {
            leadsDetalhados = db.prepare(`
                SELECT 
                    lf.*,
                    l.nome,
                    l.telefone,
                    l.email,
                    l.modelo_de_negocio
                FROM leads_finais lf
                JOIN leads l ON lf.lead_id = l.id
                WHERE lf.atendente_telefone = ?
                AND DATE(lf.data_envio) = ?
                ORDER BY lf.data_envio DESC
            `).all(atendente, data) as Array<any>;
        }

        return NextResponse.json({
            success: true,
            message: 'Atendentes encontrados',
            data: data,
            atendentes: atendentes,
            leads_detalhados: leadsDetalhados
        });

    } catch (error) {
        console.error('❌ Erro ao buscar atendentes:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar atendentes' },
            { status: 500 }
        );
    }
}

// POST - Atribuir leads para atendente
export async function POST(request: NextRequest) {
    try {
        const { atendente_telefone, lead_ids } = await request.json();

        if (!atendente_telefone || !lead_ids || !Array.isArray(lead_ids)) {
            return NextResponse.json(
                { message: 'Atendente e IDs dos leads são obrigatórios' },
                { status: 400 }
            );
        }

        // Atualizar leads para o atendente
        const stmt = db.prepare(`
            UPDATE leads_finais 
            SET atendente_telefone = ?,
                status = 'enviado_para_atendente',
                data_envio = ?
            WHERE lead_id = ?
        `);

        let atualizados = 0;
        for (const leadId of lead_ids) {
            stmt.run(atendente_telefone, new Date().toISOString(), leadId);
            atualizados++;
        }

        // Registrar mensagem
        db.prepare(`
            INSERT INTO mensagens (texto_mensagem, tag, ordermensagem)
            VALUES (?, 'leads_atribuidos', ?)
        `).run(`${atualizados} leads atribuídos para ${atendente_telefone}`, atualizados);

        return NextResponse.json({
            success: true,
            message: 'Leads atribuídos com sucesso',
            atendente: atendente_telefone,
            leads_atribuidos: atualizados
        });

    } catch (error) {
        console.error('❌ Erro ao atribuir leads:', error);
        return NextResponse.json(
            { message: 'Erro ao atribuir leads' },
            { status: 500 }
        );
    }
} 