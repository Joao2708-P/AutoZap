import { query, initializeTables } from './postgres';

// Wrapper para compatibilidade com o código existente
const db = {
  // Método para SELECT com parâmetros
  prepare: (sql: string) => ({
    get: async (params?: any[]) => {
      const result = await query(sql, params ? [params].flat() : undefined);
      return result.rows[0] || null;
    },
    all: async (params?: any[]) => {
      const result = await query(sql, params ? [params].flat() : undefined);
      return result.rows;
    },
    run: async (params?: any[]) => {
      const result = await query(sql, params ? [params].flat() : undefined);
      return {
        changes: result.rowCount || 0,
        lastInsertRowid: result.rows[0]?.id || null
      };
    }
  }),
  
  // Para queries diretas (usado em alguns lugares)
  query: async (sql: string, params?: any[]) => {
    const result = await query(sql, params);
    return result.rows;
  }
};

// Comentando inicialização automática - tabelas criadas manualmente no Supabase
// initializeTables().catch(console.error);

export default db