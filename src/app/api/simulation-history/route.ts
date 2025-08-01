import { NextResponse } from 'next/server';
import { whatsappMeta } from '@/app/lib/whatsapp-meta';

export async function GET() {
  try {
    // Obter o histórico de mensagens da simulação
    const messageHistory = (whatsappMeta as any).messageHistory || [];
    
    // Formatar as mensagens para a interface
    const formattedMessages = messageHistory.map((msg: any, index: number) => ({
      id: index.toString(),
      text: msg.message,
      sender: msg.type === 'sent' ? 'system' : 'user',
      timestamp: msg.timestamp,
      status: msg.type === 'sent' ? 'delivered' : undefined
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      total: formattedMessages.length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao obter histórico',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 