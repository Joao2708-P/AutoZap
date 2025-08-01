import { whatsappSimple } from '../lib/whatsapp-simple';
import db from '../lib/FDM';

interface Lead {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  primeiro_contato_enviado: number;
}

interface Mensagem {
  id: number;
  texto_mensagem: string;
  tag: string;
}

export async function enviarPrimeiroContato(leadId: number) {
  try {
    console.log(`🚀 Iniciando primeiro contato para lead ${leadId}`);

    // Buscar lead
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as Lead | undefined;
    if (!lead) {
      console.error('❌ Lead não encontrado');
      return false;
    }

    // Buscar primeira mensagem
    const primeiraMensagem = db.prepare('SELECT * FROM mensagens WHERE tag = "primeiro_contato" LIMIT 1').get() as Mensagem | undefined;
    
    if (!primeiraMensagem) {
      console.log('⚠️ Nenhuma mensagem de primeiro contato configurada');
      return false;
    }

    // Enviar mensagem
    const resultado = await whatsappSimple.sendMessage(
      lead.telefone,
      primeiraMensagem.texto_mensagem || 'Primeiro contato enviado'
    );

    if (resultado) {
      // Atualizar status do lead
      db.prepare('UPDATE leads SET primeiro_contato_enviado = 1 WHERE id = ?').run(leadId);
      console.log('✅ Primeiro contato enviado com sucesso');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro ao enviar primeiro contato:', error);
    return false;
  }
}

export async function verificarStatusWhatsApp(): Promise<boolean> {
  return whatsappSimple.getConnectionStatus();
}

export async function enviarMensagemManual(telefone: string, mensagem: string): Promise<boolean> {
  return await whatsappSimple.sendMessage(telefone, mensagem);
}

export async function processarDisparosAutomaticos() {
  try {
    console.log('🔄 Processando disparos automáticos...');

    // Buscar leads que ainda não receberam primeiro contato
    const leads = db.prepare(`
      SELECT * FROM leads 
      WHERE primeiro_contato_enviado = 0 
      AND telefone IS NOT NULL 
      AND telefone != ''
    `).all() as Lead[];

    console.log(`📊 Encontrados ${leads.length} leads para contato`);

    for (const lead of leads) {
      console.log(`📤 Processando lead ${lead.id}: ${lead.nome}`);
      await enviarPrimeiroContato(lead.id);
      
      // Aguardar 2 segundos entre envios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('✅ Processamento de disparos concluído');
  } catch (error) {
    console.error('❌ Erro no processamento de disparos:', error);
  }
}
