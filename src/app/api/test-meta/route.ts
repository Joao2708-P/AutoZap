import { NextRequest, NextResponse } from 'next/server';
import { whatsappMeta } from '@/app/lib/whatsapp-meta';

export async function GET() {
  try {
    console.log('🧪 TESTANDO SISTEMA WHATSAPP...');

    const connectionTest = await whatsappMeta.testConnection();

    if (connectionTest) {
      console.log('✅ Conexão com sistema OK!');

      const messageTest = await whatsappMeta.sendMessage(
        '19995357442',
        '🧪 TESTE: Esta é uma mensagem de teste do sistema FDM via WhatsApp Business API!'
      );

      if (messageTest) {
        console.log('✅ Mensagem de teste enviada com sucesso!');
        
        // Simular resposta do atendente
        await whatsappMeta.receiveMessage('19995357442', '✅ Teste recebido! Sistema funcionando perfeitamente.');
        
        // Mostrar histórico
        whatsappMeta.showMessageHistory();
        
        return NextResponse.json({
          success: true,
          message: 'Sistema funcionando perfeitamente!',
          connection: 'OK',
          simulation: 'Ativa'
        });
      } else {
        console.log('❌ Falha no envio da mensagem de teste');
        return NextResponse.json({
          success: false,
          message: 'Conexão OK, mas falha no envio',
          connection: 'OK'
        });
      }
    } else {
      console.log('❌ Falha na conexão com sistema');
      return NextResponse.json({
        success: false,
        message: 'Falha na conexão com sistema',
        connection: 'FAIL'
      });
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno no teste',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 