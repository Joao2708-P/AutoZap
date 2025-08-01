import { NextResponse } from 'next/server';
import db from '@/app/lib/FDM';

interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  modelo_de_negocio: string;
  primeiro_contato: boolean;
  created_at?: string;
}

export async function GET() {
  try {
    const leads = db.prepare(`
      SELECT 
        l.*,
        COUNT(r.id) as total_respostas
      FROM leads l
      LEFT JOIN respostas r ON l.id = r.lead_id
      GROUP BY l.id
      ORDER BY l.id DESC
    `).all() as (Lead & { total_respostas: number })[];

    const formattedLeads = leads.map(lead => ({
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      modelo_de_negocio: lead.modelo_de_negocio,
      primeiro_contato: lead.primeiro_contato,
      total_respostas: lead.total_respostas,
      created_at: lead.created_at
    }));

    return NextResponse.json({
      success: true,
      leads: formattedLeads,
      total: formattedLeads.length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar leads',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 