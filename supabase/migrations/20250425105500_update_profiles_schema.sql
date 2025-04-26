-- Update profiles table with additional columns needed for BuildTrack Pro
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS team_size VARCHAR,
ADD COLUMN IF NOT EXISTS focus_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_sample_project BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add comment to the table
COMMENT ON TABLE public.profiles IS 'Stores BuildTrack Pro user profile information';
