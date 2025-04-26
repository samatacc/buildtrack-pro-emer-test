# BuildTrack Pro Database Schema

## Core Identity & Access Control

### Organizations

```prisma
model Organization {
  id                String              @id @default(uuid())
  name              String
  slug              String              @unique
  logo_url          String?
  created_at        DateTime            @default(now())
  updated_at        DateTime            @updatedAt
  is_active         Boolean             @default(true)
  subscription_tier String              @default("free")
  subscription_ends DateTime?
  users             User[]
  projects          Project[]
  roles             Role[]
  teams             Team[]
  widgets           Widget[]
  dashboards        Dashboard[]
  dashboard_layouts DashboardLayout[]
  notifications     Notification[]
  settings          Json                @default("{}")

  @@index([slug])
}
```

### Users

```prisma
model User {
  id                    String               @id @default(uuid())
  email                 String               @unique
  first_name            String
  last_name             String
  avatar_url            String?
  password_hash         String?
  email_verified        Boolean              @default(false)
  phone_number          String?
  created_at            DateTime             @default(now())
  updated_at            DateTime             @updatedAt
  is_active             Boolean              @default(true)
  last_login            DateTime?
  organization_id       String
  organization          Organization         @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  role_id               String
  role                  Role                 @relation(fields: [role_id], references: [id])
  teams                 TeamMember[]
  assigned_tasks        Task[]               @relation("assignee")
  created_tasks         Task[]               @relation("creator")
  dashboard_layouts     DashboardLayout[]
  notifications         Notification[]       @relation("recipient")
  sent_notifications    Notification[]       @relation("sender")
  notification_settings NotificationSetting?
  preferences           Json                 @default("{}")

  @@index([organization_id])
  @@index([email])
}
```

### Roles

```prisma
model Role {
  id              String        @id @default(uuid())
  name            String
  description     String?
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt
  is_system_role  Boolean       @default(false)
  organization_id String
  organization    Organization  @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  users           User[]
  permissions     Permission[]
  default_widgets Json          @default("[]") // Array of default widget IDs for this role

  @@unique([name, organization_id])
  @@index([organization_id])
}
```

### Permissions

```prisma
model Permission {
  id          String   @id @default(uuid())
  name        String
  description String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  roles       Role[]

  @@unique([name])
}
```

### Teams

```prisma
model Team {
  id              String       @id @default(uuid())
  name            String
  description     String?
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt
  organization_id String
  organization    Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  members         TeamMember[]

  @@unique([name, organization_id])
  @@index([organization_id])
}
```

### TeamMembers

```prisma
model TeamMember {
  id         String   @id @default(uuid())
  team_id    String
  user_id    String
  role       String   @default("member") // e.g., "lead", "member"
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  team       Team     @relation(fields: [team_id], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([team_id, user_id])
  @@index([user_id])
}
```

## Dashboard Configuration

### Widgets

```prisma
model Widget {
  id                 String              @id @default(uuid())
  name               String
  description        String?
  widget_type        String              // e.g., "project_overview", "task_list", "timeline"
  icon               String?
  default_size       WidgetSize          @default(NORMAL)
  min_size           WidgetSize          @default(SMALL)
  max_size           WidgetSize?
  default_settings   Json                @default("{}")
  created_at         DateTime            @default(now())
  updated_at         DateTime            @updatedAt
  is_system_widget   Boolean             @default(false)
  organization_id    String?
  organization       Organization?       @relation(fields: [organization_id], references: [id], onDelete: SetNull)
  dashboard_widgets  DashboardWidget[]

  @@index([widget_type])
  @@index([organization_id])
}

enum WidgetSize {
  SMALL     // 1x1
  NORMAL    // 1x2
  LARGE     // 2x2
  XLARGE    // 2x3
}
```

### Dashboards

```prisma
model Dashboard {
  id                  String             @id @default(uuid())
  name                String
  description         String?
  is_default          Boolean            @default(false)
  created_at          DateTime           @default(now())
  updated_at          DateTime           @updatedAt
  organization_id     String
  organization        Organization       @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  dashboard_layouts   DashboardLayout[]

  @@index([organization_id])
}
```

### DashboardLayouts

```prisma
model DashboardLayout {
  id             String           @id @default(uuid())
  device_type    DeviceType       @default(DESKTOP)
  layout_json    Json             // Stores the grid layout configuration
  created_at     DateTime         @default(now())
  updated_at     DateTime         @updatedAt
  dashboard_id   String
  dashboard      Dashboard        @relation(fields: [dashboard_id], references: [id], onDelete: Cascade)
  user_id        String?          // Null if it's a default layout
  user           User?            @relation(fields: [user_id], references: [id], onDelete: SetNull)
  organization_id String
  organization   Organization     @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  dashboard_widgets DashboardWidget[]

  @@unique([dashboard_id, user_id, device_type])
  @@index([user_id])
  @@index([dashboard_id])
  @@index([organization_id])
}

enum DeviceType {
  MOBILE
  TABLET
  DESKTOP
}
```

### DashboardWidgets

```prisma
model DashboardWidget {
  id                 String           @id @default(uuid())
  position_x         Int
  position_y         Int
  width              Int              @default(1)
  height             Int              @default(1)
  settings           Json             @default("{}")
  created_at         DateTime         @default(now())
  updated_at         DateTime         @updatedAt
  widget_id          String
  widget             Widget           @relation(fields: [widget_id], references: [id], onDelete: Cascade)
  dashboard_layout_id String
  dashboard_layout   DashboardLayout  @relation(fields: [dashboard_layout_id], references: [id], onDelete: Cascade)

  @@unique([dashboard_layout_id, position_x, position_y])
  @@index([widget_id])
  @@index([dashboard_layout_id])
}
```

## Project Management Foundation

### Projects

```prisma
model Project {
  id                 String         @id @default(uuid())
  name               String
  description        String?
  start_date         DateTime
  target_end_date    DateTime
  actual_end_date    DateTime?
  status             ProjectStatus  @default(NOT_STARTED)
  progress           Float          @default(0) // 0 to 100
  thumbnail_url      String?
  created_at         DateTime       @default(now())
  updated_at         DateTime       @updatedAt
  organization_id    String
  organization       Organization   @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  tasks              Task[]
  milestones         Milestone[]

  @@index([organization_id])
  @@index([status])
}

enum ProjectStatus {
  NOT_STARTED
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  CANCELLED
}
```

### Tasks

```prisma
model Task {
  id                String        @id @default(uuid())
  title             String
  description       String?
  status            TaskStatus    @default(TO_DO)
  priority          TaskPriority  @default(MEDIUM)
  due_date          DateTime?
  estimated_hours   Float?
  actual_hours      Float?
  is_on_critical_path Boolean     @default(false)
  created_at        DateTime      @default(now())
  updated_at        DateTime      @updatedAt
  project_id        String
  project           Project       @relation(fields: [project_id], references: [id], onDelete: Cascade)
  assignee_id       String?
  assignee          User?         @relation("assignee", fields: [assignee_id], references: [id], onDelete: SetNull)
  creator_id        String
  creator           User          @relation("creator", fields: [creator_id], references: [id], onDelete: Restrict)
  dependencies      TaskDependency[] @relation("dependent_task")
  dependents        TaskDependency[] @relation("prerequisite_task")

  @@index([project_id])
  @@index([assignee_id])
  @@index([status])
  @@index([priority])
  @@index([due_date])
}

enum TaskStatus {
  TO_DO
  IN_PROGRESS
  BLOCKED
  DONE
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### TaskDependencies

```prisma
model TaskDependency {
  id                    String  @id @default(uuid())
  dependent_task_id     String
  dependent_task        Task    @relation("dependent_task", fields: [dependent_task_id], references: [id], onDelete: Cascade)
  prerequisite_task_id  String
  prerequisite_task     Task    @relation("prerequisite_task", fields: [prerequisite_task_id], references: [id], onDelete: Cascade)

  @@unique([dependent_task_id, prerequisite_task_id])
  @@index([prerequisite_task_id])
}
```

### Milestones

```prisma
model Milestone {
  id                 String          @id @default(uuid())
  name               String
  description        String?
  target_date        DateTime
  actual_date        DateTime?
  status             MilestoneStatus @default(NOT_STARTED)
  created_at         DateTime        @default(now())
  updated_at         DateTime        @updatedAt
  project_id         String
  project            Project         @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@index([project_id])
  @@index([target_date])
}

enum MilestoneStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  MISSED
}
```

## Notification System

### Notifications

```prisma
model Notification {
  id               String             @id @default(uuid())
  title            String
  message          String
  type             NotificationType   @default(SYSTEM)
  category         String?            // e.g., "task", "project", "message", "system"
  priority         NotificationPriority @default(NORMAL)
  action_link      String?            // URL or deep link for the notification
  is_read          Boolean            @default(false)
  read_at          DateTime?
  created_at       DateTime           @default(now())
  recipient_id     String
  recipient        User               @relation("recipient", fields: [recipient_id], references: [id], onDelete: Cascade)
  sender_id        String?
  sender           User?              @relation("sender", fields: [sender_id], references: [id], onDelete: SetNull)
  organization_id  String
  organization     Organization       @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([recipient_id])
  @@index([is_read])
  @@index([organization_id])
  @@index([type])
  @@index([priority])
}

enum NotificationType {
  TASK
  MESSAGE
  SYSTEM
  WEATHER
  ADMIN
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  CRITICAL
}
```

### NotificationSettings

```prisma
model NotificationSetting {
  id                      String   @id @default(uuid())
  email_notifications     Boolean  @default(true)
  push_notifications      Boolean  @default(true)
  task_notifications      Boolean  @default(true)
  message_notifications   Boolean  @default(true)
  system_notifications    Boolean  @default(true)
  weather_notifications   Boolean  @default(true)
  admin_notifications     Boolean  @default(true)
  quiet_hours_start       Int?     // Hour of day (0-23)
  quiet_hours_end         Int?     // Hour of day (0-23)
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt
  user_id                 String   @unique
  user                    User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

## Analytics & Reporting System

### Reports

```prisma
model Report {
  id                String          @id @default(uuid())
  name              String
  description       String?
  report_type       ReportType
  is_template       Boolean         @default(false)
  is_favorite       Boolean         @default(false)
  is_public         Boolean         @default(false)  // Visible to all org members
  thumbnail_url     String?
  config            Json            // Report configuration including layout, filters, etc.
  last_run_at       DateTime?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  creator_id        String
  creator           User            @relation(fields: [creator_id], references: [id], onDelete: Restrict)
  organization_id   String
  organization      Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  schedules         ReportSchedule[]
  dashboards        DashboardMetric[]

  @@index([organization_id])
  @@index([report_type])
  @@index([creator_id])
}

enum ReportType {
  PROJECT_PERFORMANCE
  FINANCIAL
  RESOURCE_UTILIZATION
  TASK_ANALYSIS
  TEAM_PERFORMANCE
  QUALITY_METRICS
  CUSTOM
}
```

### ReportSchedules

```prisma
model ReportSchedule {
  id                String          @id @default(uuid())
  frequency         ScheduleFrequency
  day_of_week       Int?           // 0-6, 0 is Sunday (for WEEKLY)
  day_of_month      Int?           // 1-31 (for MONTHLY)
  time_of_day       Int            // Hour of day (0-23)
  format            ReportFormat   @default(PDF)
  delivery_method   DeliveryMethod @default(EMAIL)
  recipients        Json           // Array of email addresses or user IDs
  is_active         Boolean        @default(true)
  last_executed     DateTime?
  next_execution    DateTime?
  created_at        DateTime       @default(now())
  updated_at        DateTime       @updatedAt
  report_id         String
  report            Report         @relation(fields: [report_id], references: [id], onDelete: Cascade)

  @@index([report_id])
  @@index([next_execution])
}

enum ScheduleFrequency {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
}

enum ReportFormat {
  PDF
  EXCEL
  CSV
  INTERACTIVE
}

enum DeliveryMethod {
  EMAIL
  DASHBOARD
  DOWNLOAD
}
```

### MetricDefinitions

```prisma
model MetricDefinition {
  id                String          @id @default(uuid())
  name              String
  description       String?
  data_source       String          // Table or data origin
  calculation       String          // SQL or formula definition
  unit              String?         // e.g., "hours", "%", "$"
  aggregation       AggregationType @default(SUM)
  is_system_metric  Boolean         @default(false)  // Built-in vs custom
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  organization_id   String
  organization      Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  dashboard_metrics DashboardMetric[]
  kpi_targets       KpiTarget[]

  @@unique([name, organization_id])
  @@index([organization_id])
}

enum AggregationType {
  SUM
  AVERAGE
  COUNT
  MIN
  MAX
  LAST
  FIRST
}
```

### DashboardMetrics

```prisma
model DashboardMetric {
  id                  String          @id @default(uuid())
  display_name        String
  visualization_type  VisualizationType
  size                WidgetSize      @default(NORMAL)  // Reusing widget size enum
  refresh_interval    Int?            // Minutes, null for manual only
  chart_config        Json            // Colors, labels, etc.
  filter_config       Json?           // Any applied filters
  position_x          Int
  position_y          Int
  width               Int             @default(1)
  height              Int             @default(1)
  created_at          DateTime        @default(now())
  updated_at          DateTime        @updatedAt
  metric_id           String
  metric              MetricDefinition @relation(fields: [metric_id], references: [id], onDelete: Cascade)
  report_id           String?
  report              Report?         @relation(fields: [report_id], references: [id], onDelete: SetNull)
  dashboard_id        String
  dashboard           Dashboard       @relation(fields: [dashboard_id], references: [id], onDelete: Cascade)

  @@unique([dashboard_id, position_x, position_y])
  @@index([metric_id])
  @@index([dashboard_id])
}

enum VisualizationType {
  BAR_CHART
  LINE_CHART
  PIE_CHART
  AREA_CHART
  TABLE
  KPI_CARD
  GAUGE
  HEAT_MAP
  SCATTER_PLOT
  CUSTOM
}
```

### KpiTargets

```prisma
model KpiTarget {
  id                String          @id @default(uuid())
  target_value      Float
  min_threshold     Float?          // Warning threshold
  max_threshold     Float?          // Success threshold
  direction         TargetDirection @default(HIGHER_BETTER)
  time_period       TimePeriod      @default(MONTHLY)
  start_date        DateTime
  end_date          DateTime?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  metric_id         String
  metric            MetricDefinition @relation(fields: [metric_id], references: [id], onDelete: Cascade)
  project_id        String?
  project           Project?        @relation(fields: [project_id], references: [id], onDelete: SetNull)

  @@index([metric_id])
  @@index([project_id])
  @@index([start_date, end_date])
}

enum TargetDirection {
  HIGHER_BETTER
  LOWER_BETTER
  TARGET_EXACT
}

enum TimePeriod {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
  PROJECT_DURATION
}
```

### AnalyticsSnapshots

```prisma
model AnalyticsSnapshot {
  id                String          @id @default(uuid())
  snapshot_date     DateTime
  data              Json            // Aggregated data snapshot
  snapshot_type     SnapshotType
  created_at        DateTime        @default(now())
  organization_id   String
  organization      Organization    @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  project_id        String?
  project           Project?        @relation(fields: [project_id], references: [id], onDelete: SetNull)

  @@index([organization_id])
  @@index([project_id])
  @@index([snapshot_date])
  @@index([snapshot_type])
}

enum SnapshotType {
  DAILY_METRICS
  WEEKLY_SUMMARY
  MONTHLY_PERFORMANCE
  PROJECT_MILESTONE
}
```

## Row Level Security (RLS) Policies

All tables in this schema will have RLS policies applied to ensure data isolation between organizations. Here are examples of the RLS policies:

### Organization RLS

```sql
-- Users can only see their own organization
CREATE POLICY "Users can view own organization"
  ON public.organizations
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.users
    WHERE organization_id = id
  ));

-- Only organization admins can update organization details
CREATE POLICY "Only admins can update organization"
  ON public.organizations
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT u.id FROM public.users u
      JOIN public.roles r ON u.role_id = r.id
      WHERE u.organization_id = id
      AND r.name = 'Admin'
    )
  );
```

### User RLS

```sql
-- Users can only see users in their own organization
CREATE POLICY "Users can only view users in their organization"
  ON public.users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid()
    )
  );
```

### Project RLS

```sql
-- Users can only see projects in their own organization
CREATE POLICY "Users can only view projects in their organization"
  ON public.projects
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid()
    )
  );
```

### Dashboard RLS

```sql
-- Users can only see dashboards in their own organization
CREATE POLICY "Users can only view dashboards in their organization"
  ON public.dashboards
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid()
    )
  );
```

### Analytics RLS

```sql
-- Users can only see metrics and reports in their own organization
CREATE POLICY "Users can only view metrics in their organization"
  ON public.metric_definitions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid()
    )
  );

-- Users can only see reports in their own organization
CREATE POLICY "Users can only view reports in their organization"
  ON public.reports
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users
      WHERE id = auth.uid()
    ) AND (is_public = true OR creator_id = auth.uid())
  );

-- Users can only see KPI targets in their own organization
CREATE POLICY "Users can only view KPI targets in their organization"
  ON public.kpi_targets
  FOR SELECT
  USING (
    metric_id IN (
      SELECT id FROM public.metric_definitions
      WHERE organization_id IN (
        SELECT organization_id FROM public.users
        WHERE id = auth.uid()
      )
    )
  );
```
