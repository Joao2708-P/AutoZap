export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: number
          nome: string
          telefone: string
          email: string
          modelo_de_negocio: string
          primeiro_contato: boolean
          created_at: string
        }
        Insert: {
          id?: never
          nome: string
          telefone: string
          email: string
          modelo_de_negocio: string
          primeiro_contato?: boolean
          created_at?: string
        }
        Update: {
          id?: never
          nome?: string
          telefone?: string
          email?: string
          modelo_de_negocio?: string
          primeiro_contato?: boolean
          created_at?: string
        }
      }
      perguntas: {
        Row: {
          id: number
          texto_pergunta: string
          ativa: boolean
          ordem: number
          created_at: string
        }
        Insert: {
          id?: never
          texto_pergunta: string
          ativa?: boolean
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: never
          texto_pergunta?: string
          ativa?: boolean
          ordem?: number
          created_at?: string
        }
      }
      mensagens: {
        Row: {
          id: number
          texto_mensagem: string | null
          tag: string | null
          ordermensagem: number | null
        }
        Insert: {
          id?: never
          texto_mensagem?: string | null
          tag?: string | null
          ordermensagem?: number | null
        }
        Update: {
          id?: never
          texto_mensagem?: string | null
          tag?: string | null
          ordermensagem?: number | null
        }
      }
      respostas: {
        Row: {
          id: number
          pergunta_id: number
          lead_id: number
          resposta_usuario: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          pergunta_id: number
          lead_id: number
          resposta_usuario: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          pergunta_id?: number
          lead_id?: number
          resposta_usuario?: string
          created_at?: string
          updated_at?: string
        }
      }
      contatos: {
        Row: {
          id: number
          lead_id: number | null
          numero_de_tentativas: number | null
          ultima_tentativa: string | null
          status_resposta: string | null
        }
        Insert: {
          id?: never
          lead_id?: number | null
          numero_de_tentativas?: number | null
          ultima_tentativa?: string | null
          status_resposta?: string | null
        }
        Update: {
          id?: never
          lead_id?: number | null
          numero_de_tentativas?: number | null
          ultima_tentativa?: string | null
          status_resposta?: string | null
        }
      }
      leads_finais: {
        Row: {
          id: number
          lead_id: number
          nome: string
          telefone: string
          email: string
          modelo_de_negocio: string
          respostas_json: string
          data_envio: string
          status: string
          atendente_telefone: string | null
          enviado_para_sheet: boolean
          sheet_id: string | null
        }
        Insert: {
          id?: never
          lead_id: number
          nome: string
          telefone: string
          email: string
          modelo_de_negocio: string
          respostas_json: string
          data_envio?: string
          status?: string
          atendente_telefone?: string | null
          enviado_para_sheet?: boolean
          sheet_id?: string | null
        }
        Update: {
          id?: never
          lead_id?: number
          nome?: string
          telefone?: string
          email?: string
          modelo_de_negocio?: string
          respostas_json?: string
          data_envio?: string
          status?: string
          atendente_telefone?: string | null
          enviado_para_sheet?: boolean
          sheet_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']