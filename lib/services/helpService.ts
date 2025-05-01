import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Help article interfaces
export type HelpCategory = 'getting-started' | 'projects' | 'materials' | 'tasks' | 'billing' | 'permissions' | 'integrations' | 'account';

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: HelpCategory;
  tags: string[];
  lastUpdated: string;
  views: number;
  helpfulness: {
    helpful: number;
    notHelpful: number;
  };
}

// Support ticket interfaces
export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  category: string;
  userId: string;
  assignee?: string;
  attachments?: number;
}

class HelpService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }
  
  // Get all help articles
  async getHelpArticles(): Promise<HelpArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from('help_articles')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching help articles:', error);
      toast.error('Failed to load help articles');
      return [];
    }
  }
  
  // Get a specific help article by ID
  async getHelpArticleById(id: string): Promise<HelpArticle | null> {
    try {
      const { data, error } = await this.supabase
        .from('help_articles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Increment view count
      if (data) {
        await this.incrementArticleViews(id);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching help article:', error);
      toast.error('Failed to load help article');
      return null;
    }
  }
  
  // Increment the view count for an article
  private async incrementArticleViews(id: string): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('help_articles')
        .select('views')
        .eq('id', id)
        .single();
      
      if (data) {
        await this.supabase
          .from('help_articles')
          .update({ views: data.views + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing article views:', error);
    }
  }
  
  // Update the helpfulness rating of an article
  async updateArticleHelpfulness(id: string, isHelpful: boolean): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('help_articles')
        .select('helpfulness')
        .eq('id', id)
        .single();
      
      if (data) {
        const helpfulness = {
          helpful: isHelpful ? data.helpfulness.helpful + 1 : data.helpfulness.helpful,
          notHelpful: !isHelpful ? data.helpfulness.notHelpful + 1 : data.helpfulness.notHelpful
        };
        
        const { error } = await this.supabase
          .from('help_articles')
          .update({ helpfulness })
          .eq('id', id);
          
        if (error) {
          throw error;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating article helpfulness:', error);
      return false;
    }
  }
  
  // Search for help articles
  async searchHelpArticles(query: string): Promise<HelpArticle[]> {
    try {
      // Using Supabase's built-in text search
      const { data, error } = await this.supabase
        .from('help_articles')
        .select('*')
        .textSearch('title', query, { config: 'english' })
        .order('views', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // If no results from title search, try content search
      if (!data || data.length === 0) {
        const { data: contentData, error: contentError } = await this.supabase
          .from('help_articles')
          .select('*')
          .textSearch('content', query, { config: 'english' })
          .order('views', { ascending: false });
          
        if (contentError) {
          throw contentError;
        }
        
        return contentData || [];
      }
      
      return data;
    } catch (error) {
      console.error('Error searching help articles:', error);
      toast.error('Search failed');
      return [];
    }
  }
  
  // Get user's support tickets
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const { data, error } = await this.supabase
        .from('support_tickets')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      toast.error('Failed to load support tickets');
      return [];
    }
  }
  
  // Create a new support ticket
  async createSupportTicket(
    userId: string,
    subject: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): Promise<SupportTicket | null> {
    try {
      const newTicket = {
        userId,
        subject,
        description,
        category,
        priority,
        status: 'open' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase
        .from('support_tickets')
        .insert(newTicket)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success('Support ticket submitted successfully');
      return data;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast.error('Failed to create support ticket');
      return null;
    }
  }
  
  // Update a support ticket
  async updateSupportTicket(
    ticketId: string,
    updates: Partial<SupportTicket>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('support_tickets')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', ticketId);
        
      if (error) {
        throw error;
      }
      
      toast.success('Ticket updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating support ticket:', error);
      toast.error('Failed to update ticket');
      return false;
    }
  }
  
  // Add a migration script to set up help-related tables
  getMigrationScript(): string {
    return `
-- Help & Support Schema

-- Help Articles Table
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  helpfulness JSONB DEFAULT '{"helpful": 0, "notHelpful": 0}'::JSONB
);

-- Create index for text search
CREATE INDEX IF NOT EXISTS help_articles_title_idx ON help_articles USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS help_articles_content_idx ON help_articles USING GIN (to_tsvector('english', content));

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  assignee UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Ticket Attachments Table
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Ticket Comments Table
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;

-- Help Articles policies (everyone can read)
CREATE POLICY "Anyone can read help articles"
  ON help_articles FOR SELECT
  USING (true);

-- Support Tickets policies (user can read their own tickets)
CREATE POLICY "Users can read their own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Support Tickets policies (user can create their own tickets)
CREATE POLICY "Users can create their own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Support Tickets policies (user can update their own tickets)
CREATE POLICY "Users can update their own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Support Ticket Attachments policies
CREATE POLICY "Users can read their own ticket attachments"
  ON support_ticket_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their own tickets"
  ON support_ticket_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- Support Ticket Comments policies
CREATE POLICY "Users can read comments on their tickets"
  ON support_ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on their tickets"
  ON support_ticket_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    ) OR auth.uid() = user_id
  );
    `;
  }
}

// Export a singleton instance
export const helpService = new HelpService();
