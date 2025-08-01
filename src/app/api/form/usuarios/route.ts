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
        return NextResponse.json(
            { message: 'Erro ao buscar leads' },
            { status: 500 }
        );
    }
}

// POST - Criar novo lead
export async function POST(request: NextRequest) {
    try {
        const { nome, telefone, email, modelo_de_negocio } = await request.json();

        if (!nome || !telefone || !email || !modelo_de_negocio) {
            return NextResponse.json(
                { message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        const novoLead = db.prepare(
            'INSERT INTO leads (nome, telefone, email, modelo_de_negocio) VALUES (?, ?, ?, ?)'
        ).run(nome, telefone, email, modelo_de_negocio);

        return NextResponse.json({ 
            message: 'Lead criado com sucesso',
            leadId: novoLead.lastInsertRowid 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao criar lead' },
            { status: 500 }
        );
    }
}
