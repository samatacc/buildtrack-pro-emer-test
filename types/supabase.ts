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
      dashboard_layout_presets: {
        Row: {
          created_at: string
          dashboard_id: string
          id: string
          is_default: boolean
          layout: Json
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dashboard_id?: string
          id?: string
          is_default?: boolean
          layout: Json
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          id?: string
          is_default?: boolean
          layout?: Json
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          allowed_roles: string[] | null
          category: string
          created_at: string
          default_height: number
          default_width: number
          description: string | null
          icon: string | null
          id: string
          max_height: number | null
          max_width: number | null
          min_height: number
          min_width: number
          settings: Json | null
          updated_at: string
          widget_key: string
          widget_name: string
        }
        Insert: {
          allowed_roles?: string[] | null
          category: string
          created_at?: string
          default_height: number
          default_width: number
          description?: string | null
          icon?: string | null
          id?: string
          max_height?: number | null
          max_width?: number | null
          min_height: number
          min_width: number
          settings?: Json | null
          updated_at?: string
          widget_key: string
          widget_name: string
        }
        Update: {
          allowed_roles?: string[] | null
          category?: string
          created_at?: string
          default_height?: number
          default_width?: number
          description?: string | null
          icon?: string | null
          id?: string
          max_height?: number | null
          max_width?: number | null
          min_height?: number
          min_width?: number
          settings?: Json | null
          updated_at?: string
          widget_key?: string
          widget_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          organization_id: string | null
          preferred_theme: string | null
          role: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email: string
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          organization_id?: string | null
          preferred_theme?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          organization_id?: string | null
          preferred_theme?: string | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_widget_layouts: {
        Row: {
          created_at: string
          dashboard_id: string
          height: number
          id: string
          pos_x: number
          pos_y: number
          settings: Json | null
          updated_at: string
          user_id: string
          widget_id: string
          width: number
        }
        Insert: {
          created_at?: string
          dashboard_id?: string
          height: number
          id?: string
          pos_x: number
          pos_y: number
          settings?: Json | null
          updated_at?: string
          user_id: string
          widget_id: string
          width: number
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          height?: number
          id?: string
          pos_x?: number
          pos_y?: number
          settings?: Json | null
          updated_at?: string
          user_id?: string
          widget_id?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_widget_layouts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_widget_layouts_widget_id_fkey"
            columns: ["widget_id"]
            referencedRelation: "dashboard_widgets"
            referencedColumns: ["id"]
          }
        ]
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
