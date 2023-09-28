export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          admin_id: string | null
          created_at: string
          id: number
          name: string
          website: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: number
          name: string
          website?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: number
          name?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_admin_id_fkey'
            columns: ['admin_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: number
          organization_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          organization_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          organization_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'settings_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      subscribe: {
        Row: {
          created_at: string
          email: string | null
          id: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Relationships: []
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
