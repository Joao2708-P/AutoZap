import { NextRequest, NextResponse } from 'next/server';
import { whatsappSimple } from '@/app/lib/whatsapp-simple';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Teste do WhatsApp iniciado...');
    
    const resultado = await whatsappSimple.sendMessage(
      '19995357442',
      '🧪 TESTE: Esta é uma mensagem de teste do sistema FDM!'
    );

    if (resultado) {
      console.log('✅ Teste do WhatsApp bem-sucedido!');
      return NextResponse.json({ 
        success: true, 
        message: 'Mensagem de teste enviada com sucesso!' 
      });
    } else {
      console.log('❌ Teste do WhatsApp falhou');
      return NextResponse.json({ 
        success: false, 
        message: 'Falha no envio da mensagem de teste' 
      });
    }
  } catch (error) {
    console.error('❌ Erro no teste do WhatsApp:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno no teste' 
    }, { status: 500 });
  }
} 