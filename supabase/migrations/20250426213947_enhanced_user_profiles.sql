-- Migration: Enhanced User Profiles
-- Description: Extends the profiles table with additional fields for professional info,
-- communication preferences, UI customization, mobile-specific fields, and analytics

-- 1. Professional Fields
ALTER TABLE public.profiles
ADD COLUMN job_title TEXT,
ADD COLUMN department TEXT,
ADD COLUMN skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;

-- 2. Communication Preferences
CREATE TYPE contact_method AS ENUM ('email', 'sms', 'app');
ALTER TABLE public.profiles
ADD COLUMN preferred_contact_method contact_method DEFAULT 'email'::contact_method,
ADD COLUMN timezone TEXT DEFAULT 'UTC',
ADD COLUMN language TEXT DEFAULT 'en';

-- Update the preferences JSONB to include notification settings (preserving existing structure)
UPDATE public.profiles
SET preferences = jsonb_set(
    COALESCE(preferences, '{}'::jsonb),
    '{notificationSettings}',
    '{"daily_digest": true, "project_updates": true, "task_assignments": true, "mentions": true, "deadlines": true}'::jsonb,
    true
);

-- 3. User Experience Customization
ALTER TABLE public.profiles
ADD COLUMN dashboard_layout JSONB DEFAULT '{"widgets": [], "layout": "default"}'::jsonb,
ADD COLUMN recent_projects JSONB DEFAULT '[]'::jsonb,
ADD COLUMN favorite_tools JSONB DEFAULT '[]'::jsonb;

-- Update the preferences JSONB to include UI settings
UPDATE public.profiles
SET preferences = jsonb_set(
    COALESCE(preferences, '{}'::jsonb),
    '{uiSettings}',
    '{"theme": "light", "density": "comfortable", "animations": true, "reduceMotion": false}'::jsonb,
    true
);

-- 4. Mobile-Specific Fields
ALTER TABLE public.profiles
ADD COLUMN device_tokens JSONB DEFAULT '[]'::jsonb,
ADD COLUMN offline_access BOOLEAN DEFAULT false,
ADD COLUMN data_usage_preferences JSONB DEFAULT '{"autoDownload": false, "highQualityImages": false, "videoPlayback": "wifi-only"}'::jsonb;

-- 5. Analytics & Personalization
ALTER TABLE public.profiles
ADD COLUMN last_active_project UUID,
ADD COLUMN login_streak INTEGER DEFAULT 0,
ADD COLUMN feature_usage JSONB DEFAULT '{}'::jsonb,
ADD COLUMN onboarding_status JSONB DEFAULT '{"completed": false, "steps": {"profile": false, "organization": false, "project": false, "team": false, "tour": false}}'::jsonb;

-- Add appropriate indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_job_title ON public.profiles (job_title);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles (department);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_project ON public.profiles (last_active_project);
CREATE INDEX IF NOT EXISTS idx_profiles_login_streak ON public.profiles (login_streak);

-- Create a function to update login_streak on user login
CREATE OR REPLACE FUNCTION public.update_login_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_login TIMESTAMPTZ;
BEGIN
    -- Get the previous last_login_at value
    SELECT last_login_at INTO last_login FROM public.profiles WHERE id = NEW.id;
    
    -- If this is the first login or last login was more than 36 hours ago, reset streak
    IF last_login IS NULL OR NEW.last_login_at - last_login > INTERVAL '36 hours' THEN
        NEW.login_streak = 1;
    -- If last login was less than 36 hours ago but on a different calendar day, increment streak
    ELSIF DATE(NEW.last_login_at AT TIME ZONE COALESCE(NEW.timezone, 'UTC')) > 
          DATE(last_login AT TIME ZONE COALESCE(NEW.timezone, 'UTC')) THEN
        NEW.login_streak = NEW.login_streak + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update login_streak before updating last_login_at
CREATE OR REPLACE TRIGGER on_profile_login
    BEFORE UPDATE OF last_login_at ON public.profiles
    FOR EACH ROW
    WHEN (NEW.last_login_at IS DISTINCT FROM OLD.last_login_at)
    EXECUTE FUNCTION public.update_login_streak();

-- Row Level Security Policies for new fields
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view and edit their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- For organization admins, allow viewing profiles in their organization
CREATE POLICY "Organization admins can view profiles in their organization"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles admin
            WHERE admin.id = auth.uid()
            AND admin.role = 'admin'::user_role
            AND admin.organization_id = organization_id
        )
    );
