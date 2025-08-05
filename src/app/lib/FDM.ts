import { createClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert } from '../../../database.types';

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
      
      // SELECT específicos de leads_finais
      if (sql.includes('SELECT * FROM leads_finais WHERE lead_id')) {
        const leadId = params?.[0];
        const { data, error } = await supabase
          .from('leads_finais')
          .select('*')
          .eq('lead_id', leadId)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }
      
      // SELECT leads específico por ID
      if (sql.includes('SELECT * FROM leads WHERE id')) {
        const leadId = params?.[0];
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }
      
      return null;
    },
    
    all: async (params?: any[]) => {
      // Converter SQL para operação Supabase  
      if (sql.includes('SELECT * FROM leads WHERE id')) {
        const leadId = params?.[0];
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId);
          
        if (error) throw error;
        return data || [];
      }
      
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
      
      // Perguntas específicas para exibir (ativas, ordenadas)
      if (sql.includes('SELECT id, texto_pergunta, ordem') && sql.includes('FROM perguntas')) {
        // console.log('🔍 FDM: Executando query de perguntas...');
        
        const { data, error } = await supabase
          .from('perguntas')
          .select('id, texto_pergunta, ordem')
          .eq('ativa', true)
          .order('ordem', { ascending: true })
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('❌ FDM: Erro na query perguntas:', error);
          throw error;
        }
        
        // console.log('✅ FDM: Perguntas encontradas:', data?.length || 0);
        return data || [];
      }
      
      // Query geral de perguntas com WHERE ativa = 1 (SQLite style)
      if (sql.includes('WHERE ativa = 1') && sql.includes('FROM perguntas')) {
        console.log('🔍 FDM: Query perguntas com ativa = 1...');
        
        const { data, error } = await supabase
          .from('perguntas')
          .select('id, texto_pergunta, ordem')
          .eq('ativa', true)
          .order('ordem', { ascending: true })
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('❌ FDM: Erro na query ativa=1:', error);
          throw error;
        }
        
        console.log('✅ FDM: Perguntas ativas encontradas:', data?.length || 0);
        return data || [];
      }
      
      // JOINs complexos - precisam ser tratados
      if (sql.includes('JOIN') && sql.includes('FROM respostas r')) {
        console.log('🔍 FDM: Query com JOIN respostas...');
        
        // Se tem WHERE r.lead_id = ?, filtrar por lead_id
        const leadId = params?.[0];
        let query = supabase
          .from('respostas')
          .select(`
            *,
            perguntas!inner (
              id,
              texto_pergunta,
              ordem
            )
          `);
          
        // Aplicar filtro se leadId foi fornecido
        if (leadId && sql.includes('WHERE r.lead_id')) {
          query = query.eq('lead_id', leadId);
        }
        
        // Aplicar ordenação se especificada
        if (sql.includes('ORDER BY p.ordem')) {
          query = query.order('ordem', { foreignTable: 'perguntas', ascending: true });
        }
        
        const { data: respostas, error } = await query;
          
        if (error) {
          console.error('❌ FDM: Erro no JOIN respostas:', error);
          throw error;
        }
        
        // Transformar para formato esperado pelo código antigo
        const resultado = respostas?.map(r => ({
          lead_id: r.lead_id,
          texto_pergunta: r.perguntas?.texto_pergunta,
          resposta_usuario: r.resposta_usuario,
          ordem: r.perguntas?.ordem
        })) || [];
        
        console.log('✅ FDM: JOIN respostas processado:', resultado.length);
        return resultado;
      }
      
      // Query leads com LEFT JOIN contatos
      if (sql.includes('LEFT JOIN contatos c') && sql.includes('FROM leads l')) {
        console.log('🔍 FDM: Query leads com contatos...');
        
        const { data: leads, error } = await supabase
          .from('leads')
          .select(`
            *,
            contatos (
              numero_de_tentativas,
              status_resposta,
              ultima_tentativa
            )
          `)
          .eq('primeiro_contato', true)
          .order('id', { ascending: false });
          
        if (error) {
          console.error('❌ FDM: Erro no JOIN leads:', error);
          throw error;
        }
        
        // Transformar para formato esperado
        const resultado = leads?.map(l => ({
          ...l,
          numero_de_tentativas: l.contatos?.[0]?.numero_de_tentativas || null,
          status_resposta: l.contatos?.[0]?.status_resposta || null,
          ultima_tentativa: l.contatos?.[0]?.ultima_tentativa || null
        })) || [];
        
        console.log('✅ FDM: JOIN leads processado:', resultado.length);
        return resultado;
      }
      
      // Query específica da API /api/leads (com COUNT)
      if (sql.includes('COUNT(r.id) as total_respostas') && sql.includes('LEFT JOIN respostas')) {
        console.log('🔍 FDM: Query leads com count respostas...');
        
        // Buscar leads primeiro
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('id', { ascending: false });
          
        if (leadsError) {
          console.error('❌ FDM: Erro ao buscar leads:', leadsError);
          throw leadsError;
        }
        
        // Para cada lead, contar respostas
        const resultado = [];
        for (const lead of leads || []) {
          const { count, error: countError } = await supabase
            .from('respostas')
            .select('*', { count: 'exact', head: true })
            .eq('lead_id', lead.id);
            
          if (countError) {
            console.error('❌ FDM: Erro ao contar respostas:', countError);
          }
          
          resultado.push({
            ...lead,
            total_respostas: count || 0
          });
        }
        
        console.log('✅ FDM: Leads com contagem processados:', resultado.length);
        return resultado;
      }
      
      // Query com agregação (GROUP BY, COUNT, SUM)
      if (sql.includes('GROUP BY') && (sql.includes('COUNT') || sql.includes('SUM'))) {
        console.log('🔍 FDM: Query com agregação...');
        
        // Simulação para atendentes - retornar dados mock se não houver dados reais
        if (sql.includes('leads_finais') && sql.includes('atendente_telefone')) {
          console.log('📊 FDM: Simulando stats de atendentes...');
          return [{
            atendente_telefone: '19995357442',
            total_leads: 0,
            leads_respondidos: 0,
            leads_em_atendimento: 0,
            leads_pendentes: 0
          }];
        }
        
        return [];
      }
      
      // Query com JOINs em leads_finais  
      if (sql.includes('leads_finais lf') && sql.includes('JOIN leads l')) {
        console.log('🔍 FDM: Query leads_finais com JOIN...');
        
        // Buscar de leads_finais primeiro
        const { data: leadsFinais, error: lfError } = await supabase
          .from('leads_finais')
          .select('*');
          
        if (lfError) {
          console.error('❌ FDM: Erro em leads_finais:', lfError);
          throw lfError;
        }
        
        // Para cada lead_final, buscar dados do lead
        const resultado = [];
        for (const lf of leadsFinais || []) {
          const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .select('*')
            .eq('id', lf.lead_id)
            .single();
            
          if (!leadError && leadData) {
            resultado.push({
              ...lf,
              nome: leadData.nome,
              telefone: leadData.telefone,
              email: leadData.email,
              modelo_de_negocio: leadData.modelo_de_negocio
            });
          }
        }
        
        console.log('✅ FDM: JOIN leads_finais processado:', resultado.length);
        return resultado;
      }
      
      // Query simples ORDER BY com LIMIT
      if (sql.includes('ORDER BY') && sql.includes('LIMIT')) {
        console.log('🔍 FDM: Query simples com ORDER BY e LIMIT...');
        
        const table = sql.includes('leads') ? 'leads' : 
                     sql.includes('perguntas') ? 'perguntas' : 
                     sql.includes('mensagens') ? 'mensagens' : 'leads';
        
        let query = supabase.from(table).select('*');
        
        // Parse LIMIT
        const limitMatch = sql.match(/LIMIT (\d+)/i);
        if (limitMatch) {
          query = query.limit(parseInt(limitMatch[1]));
        }
        
        // Parse ORDER BY
        if (sql.includes('ORDER BY id DESC')) {
          query = query.order('id', { ascending: false });
        } else if (sql.includes('ORDER BY')) {
          query = query.order('id', { ascending: true });
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('❌ FDM: Erro na query simples:', error);
          throw error;
        }
        
        console.log('✅ FDM: Query simples processada:', data?.length || 0);
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
      
      // INSERT OR REPLACE (PostgreSQL não suporta)
      if (sql.includes('INSERT OR REPLACE INTO leads_finais')) {
        console.log('🔍 FDM: INSERT OR REPLACE leads_finais...');
        console.log('📝 FDM: SQL recebido:', sql);
        console.log('📋 FDM: Parâmetros recebidos:', params);
        
        // Verificar se é INSERT simples (apenas lead_id e status) ou completo
        if (sql.includes('nome, telefone, email')) {
          console.log('✅ FDM: Detectado INSERT completo');
          // INSERT completo com todos os campos
          const [leadId, nome, telefone, email, modelo_de_negocio, respostasJson] = params || [];
          
          console.log('🔍 FDM: Dados extraídos dos parâmetros:', {
            leadId, nome, telefone, email, modelo_de_negocio, 
            respostasJsonLength: respostasJson?.length
          });
          
          // Status vem hard-coded na query SQL
          const statusMatch = sql.match(/'([^']+)'\s*\)?\s*$/) || ['', 'enviado_para_atendente'];
          const status = statusMatch[1];
          console.log('📊 FDM: Status extraído:', status);
          
          // Validar campos obrigatórios
          if (!leadId) {
            throw new Error('Lead ID é obrigatório para INSERT em leads_finais');
          }
          
          const dadosValidados = {
            lead_id: leadId,
            nome: nome || 'Nome não informado',
            telefone: telefone || 'Telefone não informado',
            email: email || 'Email não informado',
            modelo_de_negocio: modelo_de_negocio || 'Não informado',
            respostas_json: respostasJson || '[]',
            status: status || 'enviado_para_atendente'
          };
          
          console.log('✅ FDM: Dados validados:', dadosValidados);
          
          // Verificar se existe
          console.log('🔍 FDM: Verificando se lead_id já existe...');
          const { data: existing, error: existingError } = await supabase
            .from('leads_finais')
            .select('id')
            .eq('lead_id', leadId)
            .single();
          
          if (existingError && existingError.code !== 'PGRST116') {
            console.error('❌ FDM: Erro ao verificar existência:', existingError);
            throw existingError;
          }
          
          console.log('📊 FDM: Lead existente?', existing ? 'Sim' : 'Não');
          
          if (existing) {
            console.log('🔄 FDM: Executando UPDATE...');
            // UPDATE completo
            const { error } = await supabase
              .from('leads_finais')
              .update({ 
                nome: dadosValidados.nome,
                telefone: dadosValidados.telefone,
                email: dadosValidados.email,
                modelo_de_negocio: dadosValidados.modelo_de_negocio,
                respostas_json: dadosValidados.respostas_json,
                status: dadosValidados.status
              })
              .eq('lead_id', leadId);
              
            if (error) {
              console.error('❌ FDM: Erro no UPDATE:', error);
              throw error;
            }
            console.log('✅ FDM: UPDATE executado com sucesso');
          } else {
            console.log('➕ FDM: Executando INSERT...');
            console.log('📋 FDM: Dados para INSERT:', dadosValidados);
            
            // INSERT completo
            const { data, error } = await supabase
              .from('leads_finais')
              .insert(dadosValidados)
              .select()
              .single();
              
            if (error) {
              console.error('❌ FDM: Erro no INSERT:', error);
              console.error('❌ FDM: Detalhes do erro:', JSON.stringify(error, null, 2));
              throw error;
            }
            console.log('✅ FDM: INSERT executado com sucesso:', data?.id);
          }
        } else {
          // INSERT simples (apenas lead_id e status) - deprecado
          const [leadId, status] = params || [];
          
          // Verificar se existe
          const { data: existing } = await supabase
            .from('leads_finais')
            .select('id')
            .eq('lead_id', leadId)
            .single();
          
          if (existing) {
            // UPDATE
            const { error } = await supabase
              .from('leads_finais')
              .update({ status })
              .eq('lead_id', leadId);
              
            if (error) throw error;
          } else {
            // INSERT simples não é possível devido às constraints NOT NULL
            console.warn('⚠️ FDM: INSERT simples em leads_finais não é possível devido às constraints NOT NULL');
            throw new Error('INSERT em leads_finais requer todos os campos obrigatórios');
          }
        }
        
        return { changes: 1, lastInsertRowid: params?.[0] || null };
      }
      
      // UPDATE leads_finais
      if (sql.includes('UPDATE leads_finais')) {
        console.log('🔍 FDM: UPDATE leads_finais...');
        
        const { error } = await supabase
          .from('leads_finais')
          .update({
            status: params?.[0],
            atendente_telefone: params?.[1],
            data_envio: params?.[2]
          })
          .eq('lead_id', params?.[3]);
          
        if (error) throw error;
        return { changes: 1, lastInsertRowid: null };
      }
      
      // INSERT INTO leads_finais (completo)
      if (sql.includes('INSERT INTO leads_finais') && sql.includes('respostas_json')) {
        console.log('🔍 FDM: INSERT leads_finais completo...');
        
        const [leadId, nome, telefone, email, modelo_de_negocio, respostasJson, dataEnvio, status, atendenteTelefone] = params || [];
        
        const { data, error } = await supabase
          .from('leads_finais')
          .insert({
            lead_id: leadId,
            nome,
            telefone,
            email,
            modelo_de_negocio,
            respostas_json: respostasJson,
            data_envio: dataEnvio,
            status,
            atendente_telefone: atendenteTelefone
          })
          .select()
          .single();
          
        if (error) throw error;
        return { changes: 1, lastInsertRowid: data?.id || null };
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