import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';

// POST - Enviar leads para atendentes e gerar sheet
export async function POST(request: NextRequest) {
    try {
        const { atendente_telefone, data } = await request.json();
        
        const dataHoje = data || new Date().toISOString().split('T')[0];

        // Buscar leads que precisam ser enviados para atendentes
        const leadsParaEnviar = db.prepare(`
            SELECT 
                l.id,
                l.nome,
                l.telefone,
                l.email,
                l.modelo_de_negocio,
                l.primeiro_contato,
                c.numero_de_tentativas,
                c.status_resposta,
                c.ultima_tentativa
            FROM leads l
            LEFT JOIN contatos c ON l.id = c.lead_id
            WHERE l.primeiro_contato = 1
            ORDER BY l.id DESC
        `).all();

        // Buscar respostas dos leads
        const respostasLeads = db.prepare(`
            SELECT 
                r.lead_id,
                p.texto_pergunta,
                r.resposta_usuario
            FROM respostas r
            JOIN perguntas p ON r.pergunta_id = p.id
            ORDER BY r.lead_id, p.ordem
        `).all();

        // Agrupar respostas por lead
        const respostasPorLead = respostasLeads.reduce((acc, resp) => {
            if (!acc[resp.lead_id]) {
                acc[resp.lead_id] = [];
            }
            acc[resp.lead_id].push(`${resp.texto_pergunta}: ${resp.resposta_usuario}`);
            return acc;
        }, {} as any);

        // Preparar dados para o sheet
        const dadosSheet = leadsParaEnviar.map(lead => {
            const respostas = respostasPorLead[lead.id] || [];
            const contato = db.prepare('SELECT * FROM contatos WHERE lead_id = ?').get(lead.id) as any;
            
            return [
                lead.nome,
                lead.telefone,
                lead.email,
                lead.modelo_de_negocio,
                contato?.numero_de_tentativas || 0,
                contato?.status_resposta || 'pendente',
                contato?.ultima_tentativa || '',
                respostas.join(' | '),
                new Date().toLocaleString('pt-BR')
            ];
        });

        // Adicionar cabeçalho
        const cabecalho = [
            'Nome',
            'Telefone',
            'Email',
            'Modelo de Negócio',
            'Tentativas',
            'Status',
            'Última Tentativa',
            'Respostas',
            'Data Envio'
        ];

        const sheetCompleto = [cabecalho, ...dadosSheet];

        // Registrar envio na tabela leads_finais
        leadsParaEnviar.forEach(lead => {
            const respostas = respostasPorLead[lead.id] || [];
            const respostasJson = JSON.stringify(respostas);
            
            // Verificar se já existe
            const existente = db.prepare('SELECT * FROM leads_finais WHERE lead_id = ?').get(lead.id);
            
            if (!existente) {
                db.prepare(`
                    INSERT INTO leads_finais (
                        lead_id, nome, telefone, email, modelo_de_negocio,
                        respostas_json, data_envio, status, atendente_telefone
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    lead.id,
                    lead.nome,
                    lead.telefone,
                    lead.email,
                    lead.modelo_de_negocio,
                    respostasJson,
                    new Date().toISOString(),
                    'enviado_para_atendente',
                    atendente_telefone
                );
            } else {
                db.prepare(`
                    UPDATE leads_finais 
                    SET status = 'enviado_para_atendente',
                        atendente_telefone = ?,
                        data_envio = ?
                    WHERE lead_id = ?
                `).run(atendente_telefone, new Date().toISOString(), lead.id);
            }
        });

        // Registrar mensagem de envio
        db.prepare(`
            INSERT INTO mensagens (texto_mensagem, tag, ordermensagem)
            VALUES (?, 'sheet_enviado', ?)
        `).run(`Sheet enviado para ${atendente_telefone} - ${dataHoje}`, leadsParaEnviar.length);

        return NextResponse.json({
            success: true,
            message: 'Leads enviados para atendente com sucesso',
            atendente: atendente_telefone,
            data: dataHoje,
            total_leads: leadsParaEnviar.length,
            sheet_data: sheetCompleto
        });

    } catch (error) {
        console.error('❌ Erro ao enviar leads:', error);
        return NextResponse.json(
            { message: 'Erro ao enviar leads' },
            { status: 500 }
        );
    }
}

// GET - Buscar sheet do dia
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const data = searchParams.get('data') || new Date().toISOString().split('T')[0];
        const atendente = searchParams.get('atendente');

        // Buscar leads enviados para atendentes no dia
        const leadsEnviados = db.prepare(`
            SELECT 
                lf.*,
                l.nome,
                l.telefone,
                l.email,
                l.modelo_de_negocio
            FROM leads_finais lf
            JOIN leads l ON lf.lead_id = l.id
            WHERE DATE(lf.data_envio) = ?
            ${atendente ? 'AND lf.atendente_telefone = ?' : ''}
            ORDER BY lf.data_envio DESC
        `).all(atendente ? [data, atendente] : [data]);

        // Preparar dados do sheet
        const dadosSheet = leadsEnviados.map(lead => {
            const respostas = JSON.parse(lead.respostas_json || '[]');
            
            return [
                lead.nome,
                lead.telefone,
                lead.email,
                lead.modelo_de_negocio,
                lead.status,
                lead.atendente_telefone,
                respostas.join(' | '),
                new Date(lead.data_envio).toLocaleString('pt-BR')
            ];
        });

        // Adicionar cabeçalho
        const cabecalho = [
            'Nome',
            'Telefone',
            'Email',
            'Modelo de Negócio',
            'Status',
            'Atendente',
            'Respostas',
            'Data Envio'
        ];

        const sheetCompleto = [cabecalho, ...dadosSheet];

        return NextResponse.json({
            success: true,
            message: 'Sheet gerado com sucesso',
            data: data,
            atendente: atendente,
            total_leads: leadsEnviados.length,
            sheet_data: sheetCompleto
        });

    } catch (error) {
        console.error('❌ Erro ao gerar sheet:', error);
        return NextResponse.json(
            { message: 'Erro ao gerar sheet' },
            { status: 500 }
        );
    }
} 