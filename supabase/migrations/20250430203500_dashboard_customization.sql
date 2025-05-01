-- BuildTrack Pro Dashboard Customization Schema
-- This migration adds tables for dashboard widgets, layouts, and customization

-- Create enum for widget types
CREATE TYPE widget_type AS ENUM (
  'ACTIVE_PROJECTS',
  'PROJECT_TIMELINE',
  'MY_TASKS',
  'TEAM_TASKS',
  'PROJECT_HEALTH',
  'ANALYTICS',
  'CRITICAL_PATH',
  'PROGRESS_REPORTS',
  'FINANCIAL_DASHBOARD',
  'TEAM_PERFORMANCE',
  'NOTIFICATION_CENTER'
);

-- Create dashboard_widgets table to store widget definitions
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type widget_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  default_height INTEGER NOT NULL DEFAULT 2,
  default_width INTEGER NOT NULL DEFAULT 2,
  min_height INTEGER NOT NULL DEFAULT 1,
  min_width INTEGER NOT NULL DEFAULT 1,
  max_height INTEGER,
  max_width INTEGER,
  configs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create dashboard_layouts table to store user dashboard layouts
CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  is_default BOOLEAN DEFAULT false,
  layout_type TEXT NOT NULL DEFAULT 'desktop', -- desktop, tablet, mobile
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, organization_id, name, layout_type)
);

-- Create dashboard_roles_defaults table to store role-based default layouts
CREATE TABLE IF NOT EXISTS public.dashboard_role_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  layout_type TEXT NOT NULL DEFAULT 'desktop', -- desktop, tablet, mobile
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, role, layout_type)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_role_defaults ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard_widgets table (read-only for all users)
CREATE POLICY "Users can view all dashboard widgets"
  ON public.dashboard_widgets
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for dashboard_layouts table
CREATE POLICY "Users can view their own dashboard layouts"
  ON public.dashboard_layouts
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    (
      organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      ) AND
      user_id IN (
        SELECT id FROM public.profiles 
        WHERE organization_id = (
          SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        ) AND
        (
          SELECT role FROM public.profiles WHERE id = auth.uid()
        ) = 'admin'
      )
    )
  );

CREATE POLICY "Users can manage their own dashboard layouts"
  ON public.dashboard_layouts
  FOR ALL
  USING (user_id = auth.uid());

-- Create policies for dashboard_role_defaults table
CREATE POLICY "Admin users can view and manage role default layouts"
  ON public.dashboard_role_defaults
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All users can view role default layouts for their organization"
  ON public.dashboard_role_defaults
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_layouts_updated_at
  BEFORE UPDATE ON public.dashboard_layouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_role_defaults_updated_at
  BEFORE UPDATE ON public.dashboard_role_defaults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for default widgets
INSERT INTO public.dashboard_widgets (type, title, description, default_height, default_width)
VALUES 
  ('ACTIVE_PROJECTS', 'Active Projects', 'Shows your current active projects and their status', 2, 2),
  ('PROJECT_TIMELINE', 'Project Timeline', 'Displays your projects on an interactive timeline', 2, 4),
  ('MY_TASKS', 'My Tasks', 'Lists tasks assigned to you with due dates and priorities', 2, 2),
  ('TEAM_TASKS', 'Team Tasks', 'Displays tasks assigned to your team members', 2, 2),
  ('PROJECT_HEALTH', 'Project Health', 'Shows the health status of your projects', 1, 2),
  ('ANALYTICS', 'Analytics', 'Key metrics and analytics for your projects', 2, 2),
  ('CRITICAL_PATH', 'Critical Path', 'Shows the critical path for your projects', 2, 3),
  ('PROGRESS_REPORTS', 'Progress Reports', 'Reports on project progress over time', 2, 2),
  ('FINANCIAL_DASHBOARD', 'Financial Dashboard', 'Financial overview of your projects', 2, 2),
  ('TEAM_PERFORMANCE', 'Team Performance', 'Metrics on team performance', 2, 2),
  ('NOTIFICATION_CENTER', 'Notification Center', 'Recent notifications and alerts', 1, 1)
ON CONFLICT DO NOTHING;

-- Insert seed data for role defaults
INSERT INTO public.dashboard_role_defaults (organization_id, role, layout_type, layout)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin', 'desktop', 
   '[
     {"i": "ACTIVE_PROJECTS", "x": 0, "y": 0, "w": 2, "h": 2},
     {"i": "PROJECT_TIMELINE", "x": 2, "y": 0, "w": 4, "h": 2},
     {"i": "MY_TASKS", "x": 0, "y": 2, "w": 2, "h": 2},
     {"i": "TEAM_PERFORMANCE", "x": 2, "y": 2, "w": 2, "h": 2},
     {"i": "ANALYTICS", "x": 4, "y": 2, "w": 2, "h": 2}
   ]'::jsonb),
   
  ('00000000-0000-0000-0000-000000000001', 'project_manager', 'desktop', 
   '[
     {"i": "ACTIVE_PROJECTS", "x": 0, "y": 0, "w": 2, "h": 2},
     {"i": "PROJECT_TIMELINE", "x": 2, "y": 0, "w": 4, "h": 2},
     {"i": "MY_TASKS", "x": 0, "y": 2, "w": 2, "h": 2},
     {"i": "TEAM_TASKS", "x": 2, "y": 2, "w": 2, "h": 2},
     {"i": "CRITICAL_PATH", "x": 4, "y": 2, "w": 2, "h": 2}
   ]'::jsonb),
   
  ('00000000-0000-0000-0000-000000000001', 'contractor', 'desktop', 
   '[
     {"i": "MY_TASKS", "x": 0, "y": 0, "w": 2, "h": 2},
     {"i": "ACTIVE_PROJECTS", "x": 2, "y": 0, "w": 2, "h": 2},
     {"i": "PROJECT_TIMELINE", "x": 0, "y": 2, "w": 4, "h": 2}
   ]'::jsonb),
   
  ('00000000-0000-0000-0000-000000000001', 'client', 'desktop', 
   '[
     {"i": "ACTIVE_PROJECTS", "x": 0, "y": 0, "w": 2, "h": 2},
     {"i": "PROJECT_TIMELINE", "x": 2, "y": 0, "w": 4, "h": 2},
     {"i": "PROGRESS_REPORTS", "x": 0, "y": 2, "w": 2, "h": 2},
     {"i": "FINANCIAL_DASHBOARD", "x": 2, "y": 2, "w": 2, "h": 2}
   ]'::jsonb),
   
  ('00000000-0000-0000-0000-000000000001', 'user', 'desktop', 
   '[
     {"i": "MY_TASKS", "x": 0, "y": 0, "w": 2, "h": 2},
     {"i": "ACTIVE_PROJECTS", "x": 2, "y": 0, "w": 2, "h": 2},
     {"i": "NOTIFICATION_CENTER", "x": 4, "y": 0, "w": 1, "h": 1}
   ]'::jsonb)
ON CONFLICT DO NOTHING;
