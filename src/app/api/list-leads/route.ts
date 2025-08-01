import { NextRequest, NextResponse } from 'next/server';
import db from '@/app/lib/FDM';

export async function GET() {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY id DESC').all() as Array<{
      id: number;
      nome: string;
      email: string;
      telefone: string;
      modelo_de_negocio: string;
      primeiro_contato_enviado: boolean;
    }>;
    
    return NextResponse.json({
      success: true,
      leads: leads.map(lead => ({
        id: lead.id,
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        modelo_de_negocio: lead.modelo_de_negocio,
        primeiro_contato_enviado: lead.primeiro_contato_enviado
      }))
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao listar leads'
    }, { status: 500 });
  }
} 