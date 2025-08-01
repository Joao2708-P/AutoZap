import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Buscar lead específico
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);

        if (!lead) {
            return NextResponse.json(
                { message: 'Lead não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Lead encontrado',
            lead: lead 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar lead' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar lead específico
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { nome, telefone, email, modelo_de_negocio } = await request.json();

        if (!nome || !telefone || !email || !modelo_de_negocio) {
            return NextResponse.json(
                { message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        const leadExistente = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
        
        if (!leadExistente) {
            return NextResponse.json(
                { message: 'Lead não encontrado' },
                { status: 404 }
            );
        }

        const leadAtualizado = db.prepare(
            'UPDATE leads SET nome = ?, telefone = ?, email = ?, modelo_de_negocio = ? WHERE id = ?'
        ).run(nome, telefone, email, modelo_de_negocio, id);

        return NextResponse.json({ 
            message: 'Lead atualizado com sucesso',
            lead: leadAtualizado 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao atualizar lead' },
            { status: 500 }
        );
    }
}

// DELETE - Deletar lead específico
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const leadExistente = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
        
        if (!leadExistente) {
            return NextResponse.json(
                { message: 'Lead não encontrado' },
                { status: 404 }
            );
        }

        db.prepare('DELETE FROM leads WHERE id = ?').run(id);

        return NextResponse.json({ 
            message: 'Lead deletado com sucesso' 
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao deletar lead' },
            { status: 500 }
        );
    }
} 