-- Help & Support Schema Migration
-- Created: April 30, 2025

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

-- Insert sample help articles
INSERT INTO help_articles (title, content, category, tags, last_updated, views)
VALUES
  (
    'Getting Started with BuildTrack Pro',
    '<h2>Welcome to BuildTrack Pro!</h2>
      <p>BuildTrack Pro is a comprehensive construction management solution designed to streamline your project workflows. This guide will help you get started with the platform.</p>
      <h3>1. Setting Up Your Account</h3>
      <p>After signing up, complete your profile by adding your company information, team members, and preferred settings.</p>
      <h3>2. Creating Your First Project</h3>
      <p>Navigate to the Projects tab and click "New Project" to start creating your first construction project. Follow the project wizard to set up timeline, budget, and team members.</p>
      <h3>3. Customizing Your Dashboard</h3>
      <p>Your dashboard is fully customizable. Add widgets that matter most to your workflow by clicking the "Add Widget" button.</p>
      <h3>4. Inviting Team Members</h3>
      <p>Invite your team members by going to Settings > Team and clicking "Invite Members". They''ll receive an email invitation to join your organization.</p>',
    'getting-started',
    ARRAY['onboarding', 'setup', 'welcome'],
    '2025-04-15T14:30:00Z',
    1245
  ),
  (
    'Managing Projects and Tasks',
    '<h2>Project and Task Management</h2>
      <p>Efficient project and task management is at the heart of BuildTrack Pro. Here''s how to manage your projects effectively.</p>
      <h3>Project Dashboard</h3>
      <p>Each project has its own dashboard with customizable widgets. View critical metrics, timelines, and task status at a glance.</p>
      <h3>Task Assignment</h3>
      <p>Assign tasks to team members by clicking on a task and selecting "Assign". You can set due dates, priorities, and dependencies.</p>
      <h3>Kanban Board View</h3>
      <p>Switch to Kanban view to visualize your workflow stages. Drag and drop tasks between columns to update their status.</p>
      <h3>Milestone Tracking</h3>
      <p>Create milestones to mark significant project events or deliverables. Track progress against these milestones in the Timeline view.</p>',
    'projects',
    ARRAY['projects', 'tasks', 'kanban', 'milestones'],
    '2025-04-18T09:15:00Z',
    875
  ),
  (
    'Using Multi-Factor Authentication',
    '<h2>Securing Your Account with MFA</h2>
      <p>Multi-Factor Authentication (MFA) adds an extra layer of security to your BuildTrack Pro account.</p>
      <h3>What is MFA?</h3>
      <p>MFA requires you to verify your identity using two or more verification methods, making it harder for unauthorized users to access your account even if they have your password.</p>
      <h3>Setting Up Authenticator App</h3>
      <p>Go to Settings > Security > Multi-Factor Authentication and select "Set Up Authenticator App". Follow the instructions to scan the QR code with your authenticator app and enter the verification code.</p>
      <h3>SMS Verification</h3>
      <p>Alternatively, you can set up SMS verification to receive security codes via text message. Select "SMS Verification" and enter your phone number.</p>
      <h3>Backup Codes</h3>
      <p>Generate backup codes as a failsafe in case you lose access to your authenticator app or phone. Store these codes in a secure location.</p>',
    'account',
    ARRAY['security', 'mfa', 'authentication'],
    '2025-04-28T11:20:00Z',
    432
  ),
  (
    'Customizing Dashboard Widgets',
    '<h2>Personalizing Your Dashboard</h2>
      <p>Make BuildTrack Pro work for you by customizing your dashboard with the widgets that matter most to your role.</p>
      <h3>Adding Widgets</h3>
      <p>Click the "Add Widget" button in the top right corner of your dashboard. Select from the available widgets in the menu that appears.</p>
      <h3>Rearranging Widgets</h3>
      <p>Enter "Edit Mode" by clicking the pencil icon. Then drag and drop widgets to your preferred positions.</p>
      <h3>Resizing Widgets</h3>
      <p>While in Edit Mode, grab the resize handle at the bottom-right corner of any widget and drag to resize.</p>
      <h3>Widget Settings</h3>
      <p>Click the gear icon on any widget to access its settings. Customize data ranges, display options, and other parameters.</p>',
    'getting-started',
    ARRAY['dashboard', 'widgets', 'customization'],
    '2025-04-25T16:45:00Z',
    654
  );
