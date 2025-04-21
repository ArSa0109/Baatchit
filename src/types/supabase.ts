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
      users: {
        Row: {
          id: string
          created_at: string
          username: string
          email: string
          avatar_url: string | null
          last_seen: string | null
          is_admin: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          username: string
          email: string
          avatar_url?: string | null
          last_seen?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          email?: string
          avatar_url?: string | null
          last_seen?: string | null
          is_admin?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          content: string | null
          file_url: string | null
          file_type: string | null
          file_size: number | null
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          receiver_id: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          receiver_id?: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          read?: boolean
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Message = Database['public']['Tables']['messages']['Row']