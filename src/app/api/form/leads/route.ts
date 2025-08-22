import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/FDM";

// GET - Listar todos os leads
export async function GET() {
    try {
        const leads = await db.prepare('SELECT * FROM leads').all();
        
        return NextResponse.json({ 
            message: 'Leads encontrados',
            leads: leads 
        });
    } catch (error) {
        console.error('❌ Erro GET /api/form/leads:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar leads', error: error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Erro desconhecido' },
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

        // Normalização
        const nomeTrim = String(nome).trim();
        const emailTrim = String(email).trim();
        const modeloTrim = String(modelo_de_negocio).trim();
        const telefoneDigits = String(telefone).replace(/\D/g, '');

        // Regras simples
        if (nomeTrim.length < 3) {
            return NextResponse.json({ message: 'Nome deve ter pelo menos 3 caracteres' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrim)) {
            return NextResponse.json({ message: 'Email inválido' }, { status: 400 });
        }

        if (telefoneDigits.length < 10 || telefoneDigits.length > 13) {
            return NextResponse.json({ message: 'Telefone deve ter entre 10 e 13 dígitos' }, { status: 400 });
        }

        if (modeloTrim.length < 3) {
            return NextResponse.json({ message: 'Modelo de negócio deve ter pelo menos 3 caracteres' }, { status: 400 });
        }

        console.log('💾 Inserindo lead no banco...');
        
        // Verificar se o email já existe
        const leadExistente = await db.prepare('SELECT id FROM leads WHERE email = $1').get([emailTrim]);
        if (leadExistente) {
            console.log('⚠️ Email já cadastrado:', email);
            return NextResponse.json(
                { message: 'Email já cadastrado' },
                { status: 400 }
            );
        }

        const novoLead = await db.prepare(
            'INSERT INTO leads (nome, telefone, email, modelo_de_negocio) VALUES ($1, $2, $3, $4) RETURNING id'
        ).run([nomeTrim, telefoneDigits, emailTrim, modeloTrim]);

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
                error: error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Erro desconhecido',
                stack: error && typeof error === 'object' && 'stack' in error ? (error as any).stack : undefined
            },
            { status: 500 }
        );
    }
} 