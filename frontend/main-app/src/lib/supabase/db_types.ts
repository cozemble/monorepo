export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organisation_users: {
        Row: {
          organisation_id: number
          roles: string[] | null
          user_id: number
        }
        Insert: {
          organisation_id: number
          roles?: string[] | null
          user_id?: number
        }
        Update: {
          organisation_id?: number
          roles?: string[] | null
          user_id?: number
        }
      }
      organisations: {
        Row: {
          created_at: string
          id: number
          name: string
          owning_user_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          owning_user_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          owning_user_id?: number
          updated_at?: string
        }
      }
      users: {
        Row: {
          created_at: string | null
          first_name: string
          id: number
          supabase_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id: number
          supabase_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: number
          supabase_id?: string
          updated_at?: string | null
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
  }
}
