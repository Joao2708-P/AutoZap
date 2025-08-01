import axios from 'axios';

export interface WhatsAppMessage {
  to: string;
  message: string;
}

export interface MetaConfig {
  phoneNumberId: string;
  accessToken: string;
  version: string;
}

export class WhatsAppMeta {
  private config: MetaConfig;
  private isConnected: boolean = true;
  private messageHistory: Array<{
    from: string;
    to: string;
    message: string;
    timestamp: Date;
    type: 'sent' | 'received';
  }> = [];

  constructor(config: MetaConfig) {
    this.config = config;
    console.log('🤖 Iniciando WhatsApp Meta API (SIMULAÇÃO)...');
    this.showSimulationHeader();
  }

  private showSimulationHeader() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 SIMULAÇÃO WHATSAPP BUSINESS API');
    console.log('='.repeat(80));
    console.log('📱 Sistema: WhatsApp Business API');
    console.log('🔗 Status: Conectado (Simulado)');
    console.log('📞 Número: +55 19 99535-7442');
    console.log('⏰ Iniciado:', new Date().toLocaleString('pt-BR'));
    console.log('='.repeat(80) + '\n');
  }

  public async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const timestamp = new Date();
      
      // Adicionar à história
      this.messageHistory.push({
        from: 'SISTEMA',
        to: to,
        message: message,
        timestamp: timestamp,
        type: 'sent'
      });

      // Simular envio com delay realista
      console.log('\n📤 ENVIANDO MENSAGEM...');
      console.log('─'.repeat(50));
      console.log(`📱 Para: ${to}`);
      console.log(`⏰ ${timestamp.toLocaleString('pt-BR')}`);
      console.log(`💬 Mensagem:`);
      console.log('┌' + '─'.repeat(48) + '┐');
      
      // Quebrar mensagem em linhas
      const lines = message.split('\n');
      lines.forEach(line => {
        console.log(`│ ${line.padEnd(46)} │`);
      });
      console.log('└' + '─'.repeat(48) + '┘');
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ Mensagem enviada com sucesso!');
      console.log('📊 Status: Entregue');
      console.log('─'.repeat(50));

      return true;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  public async receiveMessage(from: string, message: string): Promise<void> {
    const timestamp = new Date();
    
    // Adicionar à história
    this.messageHistory.push({
      from: from,
      to: 'SISTEMA',
      message: message,
      timestamp: timestamp,
      type: 'received'
    });

    console.log('\n📨 MENSAGEM RECEBIDA...');
    console.log('─'.repeat(50));
    console.log(`📱 De: ${from}`);
    console.log(`⏰ ${timestamp.toLocaleString('pt-BR')}`);
    console.log(`💬 Mensagem:`);
    console.log('┌' + '─'.repeat(48) + '┐');
    
    const lines = message.split('\n');
    lines.forEach(line => {
      console.log(`│ ${line.padEnd(46)} │`);
    });
    console.log('└' + '─'.repeat(48) + '┘');
    
    console.log('🔍 Processando...');
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('✅ Processada com sucesso!');
    console.log('─'.repeat(50));
  }

  public async testConnection(): Promise<boolean> {
    try {
      console.log('\n🧪 TESTANDO CONEXÃO...');
      console.log('─'.repeat(50));
      console.log('📡 Conectando ao Meta API...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Conexão estabelecida!');
      console.log('📱 Phone Number ID: Simulado');
      console.log('🔑 Access Token: Válido');
      console.log('📊 Status: Online');
      console.log('─'.repeat(50));
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
  }

  public showMessageHistory(): void {
    console.log('\n📋 HISTÓRICO DE MENSAGENS');
    console.log('='.repeat(80));
    
    if (this.messageHistory.length === 0) {
      console.log('📭 Nenhuma mensagem ainda');
      return;
    }

    this.messageHistory.forEach((msg, index) => {
      const direction = msg.type === 'sent' ? '📤' : '📨';
      const time = msg.timestamp.toLocaleTimeString('pt-BR');
      
      console.log(`${direction} [${time}] ${msg.from} → ${msg.to}`);
      console.log(`   ${msg.message.substring(0, 60)}${msg.message.length > 60 ? '...' : ''}`);
      if (index < this.messageHistory.length - 1) console.log('');
    });
    
    console.log('='.repeat(80));
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\D/g, '');
    if (!formatted.startsWith('55')) {
      formatted = '55' + formatted;
    }
    return formatted;
  }
}

// Configuração simulada
export const defaultMetaConfig: MetaConfig = {
  phoneNumberId: 'SIMULATED_PHONE_ID',
  accessToken: 'SIMULATED_ACCESS_TOKEN',
  version: 'v17.0'
};

export const whatsappMeta = new WhatsAppMeta(defaultMetaConfig); 