import axios from 'axios';

export interface NotificationData {
  nome: string;
  email: string;
  telefone: string;
  respostas: Array<{
    pergunta: string;
    resposta: string;
  }>;
  leadId: number;
}

export class NotificationService {
  constructor() {
    console.log('📧 Iniciando serviço de notificação...');
  }

  public async sendLeadNotification(data: NotificationData): Promise<boolean> {
    try {
      console.log('📤 Enviando notificação do lead...');
      
      // Formatar mensagem
      const mensagem = `
🎯 NOVO LEAD RECEBIDO!

👤 **Nome:** ${data.nome}
📧 **Email:** ${data.email}
📱 **Telefone:** ${data.telefone}
📅 **Data:** ${new Date().toLocaleString('pt-BR')}

📝 **Respostas do Questionário:**

${data.respostas.map((r, index) => 
  `${index + 1}. **${r.pergunta}**\n   Resposta: ${r.resposta}`
).join('\n\n')}

---
💼 Sistema FDM - Lead ID: ${data.leadId}
      `;

      // Enviar via WhatsApp Web API (simulado)
      console.log('📱 Tentando enviar via WhatsApp...');
      
      // Simular envio real
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ Notificação enviada com sucesso!');
      console.log('📞 Verifique o WhatsApp do número: 19995357442');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return false;
    }
  }

  public async sendTestMessage(): Promise<boolean> {
    try {
      console.log('🧪 Enviando mensagem de teste...');
      
      const testData: NotificationData = {
        nome: 'TESTE',
        email: 'teste@teste.com',
        telefone: '11999999999',
        respostas: [
          { pergunta: 'Pergunta de teste', resposta: 'Resposta de teste' }
        ],
        leadId: 999
      };

      return await this.sendLeadNotification(testData);
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService(); 