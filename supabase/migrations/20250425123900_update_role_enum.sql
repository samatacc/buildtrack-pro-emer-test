-- Update the user_role enum to include "owner"
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'owner';

-- If the enum doesn't exist yet, create it with all the necessary values
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'project_manager', 'contractor', 'client', 'user', 'owner');
    END IF;
END 
$$;
