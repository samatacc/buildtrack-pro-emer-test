import { ProjectStatus, ProjectHealth } from './project';

/**
 * Simplified Project type for dashboard widgets
 * 
 * This is a lightweight version of the full Project type,
 * designed specifically for use in dashboard widgets.
 */
export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number;
  daysAhead: number;
  dueDate: Date;
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Database schema for Supabase
 */
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          status: string;
          health: string;
          progress: number;
          days_ahead: number;
          due_date: string;
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status: string;
          health: string;
          progress: number;
          days_ahead: number;
          due_date: string;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
          health?: string;
          progress?: number;
          days_ahead?: number;
          due_date?: string;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
