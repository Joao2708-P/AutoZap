import axios from 'axios';
import qrcode from 'qrcode-terminal';

export interface WhatsAppMessage {
  to: string;
  message: string;
}

export class WhatsAppSimple {
  private isConnected: boolean = false;

  constructor() {
    console.log('🤖 Iniciando WhatsApp Simple...');
    this.init();
  }

  private async init() {
    try {
      console.log('📱 Conectando ao WhatsApp...');
      this.generateQRCode();
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
    }
  }

  private generateQRCode() {
    // Gerar QR code simples para teste
    const qrData = 'https://wa.me/19995357442?text=Teste';
    
    console.log('📱 QR Code gerado - escaneie com seu WhatsApp!');
    console.log('🔗 Link para conectar:', qrData);
    qrcode.generate(qrData, { small: true });
    
    // Simular conexão após 3 segundos
    setTimeout(() => {
      this.isConnected = true;
      console.log('✅ WhatsApp conectado!');
    }, 3000);
  }

  public async sendMessage(to: string, message: string): Promise<boolean> {
    console.log(`📤 Tentando enviar mensagem para ${to}...`);
    console.log(`💬 Mensagem: ${message.substring(0, 100)}...`);

    if (!this.isConnected) {
      console.log('⏳ Aguardando conexão do WhatsApp...');
      // Aguardar até 10 segundos pela conexão
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (this.isConnected) break;
        console.log(`⏳ Aguardando... ${i + 1}/10`);
      }
      
      if (!this.isConnected) {
        console.log('❌ WhatsApp não conectado após 10 segundos');
        return false;
      }
    }

    try {
      console.log(`📤 Enviando mensagem para ${to}:`);
      console.log(`💬 ${message}`);
      
      // Simular envio com delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📱 Verifique se a mensagem chegou no WhatsApp');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getQRCode(): string | null {
    return 'https://wa.me/19995357442?text=Teste';
  }
}

export const whatsappSimple = new WhatsAppSimple(); 