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
      works: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string | null
          source_code_url: string | null
          source_repo_url: string | null
          thumbnail: string | null
          tags: string[] | null
          author: string | null
          views: number
          likes: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url?: string | null
          source_code_url?: string | null
          source_repo_url?: string | null
          thumbnail?: string | null
          tags?: string[] | null
          author?: string | null
          views?: number
          likes?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string | null
          source_code_url?: string | null
          source_repo_url?: string | null
          thumbnail?: string | null
          tags?: string[] | null
          author?: string | null
          views?: number
          likes?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          work_id: string
          user_name: string
          content: string
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          work_id: string
          user_name: string
          content: string
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          work_id?: string
          user_name?: string
          content?: string
          rating?: number | null
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          work_id: string
          user_ip: string | null
          created_at: string
        }
        Insert: {
          id?: string
          work_id: string
          user_ip?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          work_id?: string
          user_ip?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Work = Database['public']['Tables']['works']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']

