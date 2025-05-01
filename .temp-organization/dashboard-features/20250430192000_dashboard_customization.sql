-- Dashboard Customization Schema
-- Implements tables and triggers for storing and managing dashboard widget layouts and configurations

-- Available Widgets Table
-- Stores configuration for all available dashboard widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_key TEXT NOT NULL UNIQUE,
  widget_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  default_width INTEGER NOT NULL,
  default_height INTEGER NOT NULL,
  min_width INTEGER NOT NULL,
  min_height INTEGER NOT NULL,
  max_width INTEGER,
  max_height INTEGER,
  allowed_roles TEXT[] DEFAULT array['*']::TEXT[],
  settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE dashboard_widgets IS 'Available widgets that can be added to a user dashboard';

-- User Dashboard Widget Layout Table
-- Stores the actual widget layouts for each user
CREATE TABLE IF NOT EXISTS user_widget_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_id TEXT NOT NULL DEFAULT 'default',
  widget_id UUID NOT NULL REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
  pos_x INTEGER NOT NULL,
  pos_y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Compound unique constraint to ensure no duplicates
  UNIQUE(user_id, dashboard_id, widget_id)
);

COMMENT ON TABLE user_widget_layouts IS 'User-specific dashboard widget layouts';

-- Dashboard Layout Presets
-- Used for default layouts based on roles
CREATE TABLE IF NOT EXISTS dashboard_layout_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  dashboard_id TEXT NOT NULL DEFAULT 'default',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  layout JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Compound unique constraint
  UNIQUE(role, dashboard_id, name)
);

COMMENT ON TABLE dashboard_layout_presets IS 'Default dashboard layouts by role';

-- Row Level Security Policies

-- Dashboard Widgets - Read-only for authenticated users, Write for admins
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dashboard widgets" 
  ON dashboard_widgets FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert dashboard widgets" 
  ON dashboard_widgets FOR INSERT 
  TO authenticated
  WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can update dashboard widgets" 
  ON dashboard_widgets FOR UPDATE 
  TO authenticated
  USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can delete dashboard widgets" 
  ON dashboard_widgets FOR DELETE 
  TO authenticated
  USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- User Widget Layouts - Users can CRUD their own layouts
ALTER TABLE user_widget_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widget layouts" 
  ON user_widget_layouts FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget layouts" 
  ON user_widget_layouts FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget layouts" 
  ON user_widget_layouts FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget layouts" 
  ON user_widget_layouts FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Dashboard Layout Presets - Read for all, Write for admins
ALTER TABLE dashboard_layout_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dashboard layout presets" 
  ON dashboard_layout_presets FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert dashboard layout presets" 
  ON dashboard_layout_presets FOR INSERT 
  TO authenticated
  WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can update dashboard layout presets" 
  ON dashboard_layout_presets FOR UPDATE 
  TO authenticated
  USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can delete dashboard layout presets" 
  ON dashboard_layout_presets FOR DELETE 
  TO authenticated
  USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Add default widgets
INSERT INTO dashboard_widgets (
  widget_key, widget_name, description, icon, category,
  default_width, default_height, min_width, min_height
) VALUES
  ('project_timeline', 'Project Timeline', 'Shows timeline and milestone information for active projects', 'CalendarIcon', 'project',
   6, 3, 4, 2),
  ('active_projects', 'Active Projects', 'Lists all active projects with progress indicators', 'BuildingOfficeIcon', 'project',
   3, 4, 2, 3),
  ('my_tasks', 'My Tasks', 'Shows your assigned tasks', 'CheckCircleIcon', 'task',
   3, 4, 2, 3),
  ('weather_forecast', 'Weather Forecast', 'Shows weather conditions for project locations', 'CloudIcon', 'utility',
   3, 2, 2, 2),
  ('notifications', 'Notifications', 'Recent system notifications', 'BellIcon', 'utility',
   3, 3, 2, 2);

-- Add default layout presets
INSERT INTO dashboard_layout_presets (
  name, role, is_default, layout
) VALUES
  ('Default Project Manager Layout', 'project_manager', TRUE, 
   '[
     {"i": "project_timeline", "x": 0, "y": 0, "w": 6, "h": 3},
     {"i": "active_projects", "x": 0, "y": 3, "w": 3, "h": 4},
     {"i": "my_tasks", "x": 3, "y": 3, "w": 3, "h": 4},
     {"i": "notifications", "x": 6, "y": 0, "w": 3, "h": 3}
   ]'::JSONB),
  ('Default Contractor Layout', 'contractor', TRUE,
   '[
     {"i": "my_tasks", "x": 0, "y": 0, "w": 3, "h": 4},
     {"i": "active_projects", "x": 3, "y": 0, "w": 3, "h": 4},
     {"i": "weather_forecast", "x": 6, "y": 0, "w": 3, "h": 2},
     {"i": "notifications", "x": 6, "y": 2, "w": 3, "h": 3}
   ]'::JSONB);

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update timestamp triggers
CREATE TRIGGER update_dashboard_widgets_timestamp
BEFORE UPDATE ON dashboard_widgets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_widget_layouts_timestamp
BEFORE UPDATE ON user_widget_layouts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_dashboard_layout_presets_timestamp
BEFORE UPDATE ON dashboard_layout_presets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to set default layout for new users
CREATE OR REPLACE FUNCTION set_default_dashboard_layout()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  preset_record RECORD;
  widget_record RECORD;
BEGIN
  -- Get the user's role, default to 'user' if not found
  SELECT COALESCE(raw_user_meta_data->>'role', 'user') INTO user_role
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Find the default layout preset for this role
  SELECT * INTO preset_record
  FROM dashboard_layout_presets
  WHERE role = user_role
    AND is_default = TRUE
    AND dashboard_id = 'default'
  LIMIT 1;
  
  -- If no specific role preset found, try to get the general 'user' preset
  IF preset_record IS NULL THEN
    SELECT * INTO preset_record
    FROM dashboard_layout_presets
    WHERE role = 'user'
      AND is_default = TRUE
      AND dashboard_id = 'default'
    LIMIT 1;
  END IF;
  
  -- If still no preset, exit without setting a layout
  IF preset_record IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- For each item in the layout, create a user widget layout entry
  FOR widget_info IN SELECT * FROM jsonb_array_elements(preset_record.layout)
  LOOP
    -- Get the widget ID from the key
    SELECT id INTO widget_record
    FROM dashboard_widgets
    WHERE widget_key = TRIM('"' FROM (widget_info->>'i'))
    LIMIT 1;
    
    IF widget_record IS NOT NULL THEN
      -- Insert the widget layout for this user
      INSERT INTO user_widget_layouts (
        user_id, widget_id, pos_x, pos_y, width, height
      ) VALUES (
        NEW.id,
        widget_record.id,
        (widget_info->>'x')::INTEGER,
        (widget_info->>'y')::INTEGER,
        (widget_info->>'w')::INTEGER,
        (widget_info->>'h')::INTEGER
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to set default layout for new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION set_default_dashboard_layout();
