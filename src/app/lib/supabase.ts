import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../database.types';

// Configuração otimizada do Supabase seguindo as melhores práticas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null
  ].filter(Boolean).join(', ');
  throw new Error(`Variáveis de ambiente do Supabase ausentes: ${missing}`);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Helper functions tipadas para uso mais fácil
export const supabaseHelpers = {
  // Leads
  async createLead(leadData: Database['public']['Tables']['leads']['Insert']) {
    return await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();
  },

  async getLeads() {
    return await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async getLeadByEmail(email: string) {
    return await supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();
  },

  // Perguntas
  async createPergunta(perguntaData: Database['public']['Tables']['perguntas']['Insert']) {
    return await supabase
      .from('perguntas')
      .insert(perguntaData)
      .select()
      .single();
  },

  async getPerguntas() {
    return await supabase
      .from('perguntas')
      .select('*')
      .eq('ativa', true)
      .order('ordem', { ascending: true });
  },

  // Mensagens
  async createMensagem(mensagemData: Database['public']['Tables']['mensagens']['Insert']) {
    return await supabase
      .from('mensagens')
      .insert(mensagemData)
      .select()
      .single();
  },

  async getMensagens() {
    return await supabase
      .from('mensagens')
      .select('*')
      .order('ordermensagem', { ascending: true });
  },

  // Respostas
  async createResposta(respostaData: Database['public']['Tables']['respostas']['Insert']) {
    return await supabase
      .from('respostas')
      .insert(respostaData)
      .select()
      .single();
  },

  async getRespostasByLead(leadId: number) {
    return await supabase
      .from('respostas')
      .select(`
        *,
        perguntas (
          id,
          texto_pergunta
        )
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
  }
};

export default supabase;