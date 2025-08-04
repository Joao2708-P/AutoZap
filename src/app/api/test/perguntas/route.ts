import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// API de teste simples para perguntas
export async function GET() {
    try {
        console.log('🧪 API Test: Testando conexão direta com Supabase...');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Teste 1: Buscar todas as perguntas
        const { data: todasPerguntas, error: erro1 } = await supabase
            .from('perguntas')
            .select('*');
        
        console.log('📊 Total perguntas na tabela:', todasPerguntas?.length || 0);
        
        if (erro1) {
            console.error('❌ Erro ao buscar todas:', erro1);
            return NextResponse.json({
                success: false,
                error: 'Erro ao buscar todas as perguntas',
                details: erro1
            }, { status: 500 });
        }
        
        // Teste 2: Buscar apenas ativas
        const { data: perguntasAtivas, error: erro2 } = await supabase
            .from('perguntas')
            .select('id, texto_pergunta, ordem, ativa')
            .eq('ativa', true)
            .order('ordem', { ascending: true });
        
        console.log('📋 Perguntas ativas:', perguntasAtivas?.length || 0);
        
        if (erro2) {
            console.error('❌ Erro ao buscar ativas:', erro2);
            return NextResponse.json({
                success: false,
                error: 'Erro ao buscar perguntas ativas',
                details: erro2
            }, { status: 500 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Teste de perguntas realizado com sucesso',
            data: {
                total_perguntas: todasPerguntas?.length || 0,
                perguntas_ativas: perguntasAtivas?.length || 0,
                todas_perguntas: todasPerguntas,
                perguntas_para_exibir: perguntasAtivas
            }
        });
        
    } catch (error) {
        console.error('❌ API Test: Erro geral:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}