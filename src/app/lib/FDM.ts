import { createClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert } from '../../database.types';

// Configuração do Supabase com TypeScript tipado
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsmkhaqzizgydlvvyzfx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Wrapper para compatibilidade com o código existente
const db = {
  // Método para SELECT com parâmetros
  prepare: (sql: string) => ({
    get: async (params?: any[]) => {
      // Converter SQL para operação Supabase
      if (sql.includes('SELECT * FROM leads')) {
        const { data, error } = await supabase.from('leads').select('*').limit(1).single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
      }
      
      if (sql.includes('SELECT id FROM leads WHERE email')) {
        const email = params?.[0];
        const { data, error } = await supabase.from('leads').select('id').eq('email', email).single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }
      
      return null;
    },
    
    all: async (params?: any[]) => {
      // Converter SQL para operação Supabase
      if (sql.includes('SELECT * FROM leads')) {
        const { data, error } = await supabase.from('leads').select('*');
        if (error) throw error;
        return data || [];
      }
      
      if (sql.includes('SELECT * FROM perguntas')) {
        const { data, error } = await supabase.from('perguntas').select('*');
        if (error) throw error;
        return data || [];
      }
      
      if (sql.includes('SELECT * FROM mensagens')) {
        const { data, error } = await supabase.from('mensagens').select('*');
        if (error) throw error;
        return data || [];
      }
      
      return [];
    },
    
    run: async (params?: any[]) => {
      // Converter SQL para operação Supabase tipada
      if (sql.includes('INSERT INTO leads')) {
        const [nome, telefone, email, modelo_de_negocio] = params || [];
        const leadData: TablesInsert<'leads'> = {
          nome,
          telefone,
          email,
          modelo_de_negocio
        };
        
        const { data, error } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          changes: 1,
          lastInsertRowid: data?.id || null
        };
      }
      
      if (sql.includes('INSERT INTO perguntas')) {
        const [texto_pergunta, ativa, ordem] = params || [];
        const perguntaData: TablesInsert<'perguntas'> = {
          texto_pergunta,
          ativa: ativa ?? true,
          ordem: ordem ?? 0
        };
        
        const { data, error } = await supabase
          .from('perguntas')
          .insert(perguntaData)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          changes: 1,
          lastInsertRowid: data?.id || null
        };
      }
      
      if (sql.includes('INSERT INTO mensagens')) {
        const [texto_mensagem, tag, ordermensagem] = params || [];
        const mensagemData: TablesInsert<'mensagens'> = {
          texto_mensagem,
          tag,
          ordermensagem
        };
        
        const { data, error } = await supabase
          .from('mensagens')
          .insert(mensagemData)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          changes: 1,
          lastInsertRowid: data?.id || null
        };
      }
      
      return { changes: 0, lastInsertRowid: null };
    }
  }),
  
  // Para queries diretas
  query: async (sql: string, params?: any[]) => {
    return [];
  }
};

export default db