import Database from 'better-sqlite3';
import path from 'path';
import { query } from './postgres';

// Script para migrar dados do SQLite para PostgreSQL
export async function migrateSqliteToPostgres() {
  console.log('🔄 Iniciando migração SQLite → PostgreSQL...');
  
  const sqlitePath = path.join(process.cwd(), 'src', 'app', 'data', 'automatize.sqlite');
  
  try {
    // Conectar ao SQLite
    const sqliteDb = new Database(sqlitePath, { fileMustExist: true });
    
    // Migrar leads
    console.log('📋 Migrando leads...');
    const leads = sqliteDb.prepare('SELECT * FROM leads').all();
    
    for (const lead of leads) {
      await query(
        'INSERT INTO leads (nome, telefone, email, modelo_de_negocio, primeiro_contato) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
        [lead.nome, lead.telefone, lead.email, lead.modelo_de_negocio, lead.primeiro_contato]
      );
    }
    console.log(`✅ ${leads.length} leads migrados`);
    
    // Migrar perguntas
    console.log('❓ Migrando perguntas...');
    const perguntas = sqliteDb.prepare('SELECT * FROM perguntas').all();
    
    for (const pergunta of perguntas) {
      await query(
        'INSERT INTO perguntas (texto_pergunta, ativa, ordem, created_at) VALUES ($1, $2, $3, $4)',
        [pergunta.texto_pergunta, pergunta.ativa, pergunta.ordem, pergunta.created_at]
      );
    }
    console.log(`✅ ${perguntas.length} perguntas migradas`);
    
    // Migrar mensagens
    console.log('💬 Migrando mensagens...');
    const mensagens = sqliteDb.prepare('SELECT * FROM mensagens').all();
    
    for (const mensagem of mensagens) {
      await query(
        'INSERT INTO mensagens (texto_mensagem, tag, ordermensagem) VALUES ($1, $2, $3)',
        [mensagem.texto_mensagem, mensagem.tag, mensagem.ordermensagem]
      );
    }
    console.log(`✅ ${mensagens.length} mensagens migradas`);
    
    // Migrar respostas (se existirem)
    try {
      console.log('💭 Migrando respostas...');
      const respostas = sqliteDb.prepare('SELECT * FROM respostas').all();
      
      for (const resposta of respostas) {
        await query(
          'INSERT INTO respostas (pergunta_id, lead_id, resposta_usuario, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
          [resposta.pergunta_id, resposta.lead_id, resposta.resposta_usuario, resposta.created_at, resposta.updated_at]
        );
      }
      console.log(`✅ ${respostas.length} respostas migradas`);
    } catch (error) {
      console.log('ℹ️ Tabela respostas vazia ou não existe');
    }
    
    // Migrar contatos (se existirem)
    try {
      console.log('📞 Migrando contatos...');
      const contatos = sqliteDb.prepare('SELECT * FROM contatos').all();
      
      for (const contato of contatos) {
        await query(
          'INSERT INTO contatos (lead_id, numero_de_tentativas, ultima_tentativa, status_resposta) VALUES ($1, $2, $3, $4)',
          [contato.lead_id, contato.numero_de_tentativas, contato.ultima_tentativa, contato.status_resposta]
        );
      }
      console.log(`✅ ${contatos.length} contatos migrados`);
    } catch (error) {
      console.log('ℹ️ Tabela contatos vazia ou não existe');
    }
    
    // Migrar leads_finais (se existirem)
    try {
      console.log('📤 Migrando leads finais...');
      const leadsFinais = sqliteDb.prepare('SELECT * FROM leads_finais').all();
      
      for (const leadFinal of leadsFinais) {
        await query(
          'INSERT INTO leads_finais (lead_id, nome, telefone, email, modelo_de_negocio, respostas_json, data_envio, status, atendente_telefone, enviado_para_sheet, sheet_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [leadFinal.lead_id, leadFinal.nome, leadFinal.telefone, leadFinal.email, leadFinal.modelo_de_negocio, leadFinal.respostas_json, leadFinal.data_envio, leadFinal.status, leadFinal.atendente_telefone, leadFinal.enviado_para_sheet, leadFinal.sheet_id]
        );
      }
      console.log(`✅ ${leadsFinais.length} leads finais migrados`);
    } catch (error) {
      console.log('ℹ️ Tabela leads_finais vazia ou não existe');
    }
    
    sqliteDb.close();
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateSqliteToPostgres().catch(console.error);
}