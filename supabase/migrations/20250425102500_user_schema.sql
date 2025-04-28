-- BuildTrack Pro User and Profile Schema
-- This migration creates the necessary tables and functions for user management

-- Create enum for user roles based on BuildTrack Pro's role structure
CREATE TYPE user_role AS ENUM (
  'admin',
  'project_manager',
  'contractor',
  'client',
  'user'
);

-- Create a profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  organization_id UUID,
  role user_role DEFAULT 'user'::user_role,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_login_at TIMESTAMPTZ,
  profile_image_url TEXT,
  preferences JSONB DEFAULT '{"theme": "light", "notifications": {"email": true, "push": true, "sms": false}}'::jsonb
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Add foreign key from profiles to organizations
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_organizations
  FOREIGN KEY (organization_id)
  REFERENCES public.organizations(id)
  ON DELETE SET NULL;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for organizations
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
    OR
    owner_id = auth.uid()
  );

CREATE POLICY "Only organization owners can update their organization"
  ON public.organizations
  FOR UPDATE
  USING (owner_id = auth.uid());

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Create a default organization for the user
  INSERT INTO public.organizations (name, owner_id)
  VALUES (NEW.email || '''s Organization', NEW.id)
  RETURNING id INTO default_org_id;
  
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, name, organization_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    default_org_id,
    'admin'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to keep updated_at current
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for testing (will be managed by test users API later)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@buildtrackpro.com', '$2a$10$a2YA4JJXkYiAMbS3.OGxwO6JsIXX1DgGDxRx9G2BqQsivz1oKKUSW', now(), '{"name": "Admin User"}')
ON CONFLICT DO NOTHING;

-- Create test organizations
INSERT INTO public.organizations (id, name, owner_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'BuildTrack Test Organization', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Create test profiles
INSERT INTO public.profiles (id, name, organization_id, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin User', '00000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT DO NOTHING;
