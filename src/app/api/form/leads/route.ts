import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar todos os leads
export async function GET() {
    try {
        const leads = db.prepare('SELECT * FROM leads').all();
        
        return NextResponse.json({ 
            message: 'Leads encontrados',
            leads: leads 
        });
    } catch (error) {
        console.error('❌ Erro GET /api/form/leads:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar leads', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Criar novo lead
export async function POST(request: NextRequest) {
    try {
        console.log('📝 Recebendo dados do formulário...');
        
        const body = await request.json();
        console.log('📋 Dados recebidos:', body);
        
        const { nome, telefone, email, modelo_de_negocio } = body;

        // Validação dos campos
        if (!nome || !telefone || !email || !modelo_de_negocio) {
            console.log('❌ Campos obrigatórios faltando:', { nome, telefone, email, modelo_de_negocio });
            return NextResponse.json(
                { message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        console.log('💾 Inserindo lead no banco...');
        
        // Verificar se o email já existe
        const leadExistente = db.prepare('SELECT id FROM leads WHERE email = ?').get(email);
        if (leadExistente) {
            console.log('⚠️ Email já cadastrado:', email);
            return NextResponse.json(
                { message: 'Email já cadastrado' },
                { status: 400 }
            );
        }

        const novoLead = db.prepare(
            'INSERT INTO leads (nome, telefone, email, modelo_de_negocio) VALUES (?, ?, ?, ?)'
        ).run(nome, telefone, email, modelo_de_negocio);

        console.log('✅ Lead criado com sucesso! ID:', novoLead.lastInsertRowid);

        return NextResponse.json({ 
            message: 'Lead criado com sucesso',
            leadId: novoLead.lastInsertRowid 
        });
    } catch (error) {
        console.error('❌ Erro POST /api/form/leads:', error);
        return NextResponse.json(
            { 
                message: 'Erro ao criar lead', 
                error: error.message,
                stack: error.stack 
            },
            { status: 500 }
        );
    }
} 