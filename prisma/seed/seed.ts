// BuildTrack Pro - Database Seed File
// This file contains seed data for testing the database schema

import { PrismaClient } from '../../lib/generated/prisma';

// Define enums to match schema (since we can't import them yet without generated client)
enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  CLIENT = 'CLIENT'
}

enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum TaskStatus {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

enum WidgetType {
  PROJECT_OVERVIEW = 'PROJECT_OVERVIEW',
  TASK_LIST = 'TASK_LIST',
  TIMELINE = 'TIMELINE',
  ANALYTICS = 'ANALYTICS'
}

enum NotificationType {
  TASK = 'TASK',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  WEATHER = 'WEATHER',
  ADMIN = 'ADMIN'
}

enum ReportType {
  PROJECT_PERFORMANCE = 'PROJECT_PERFORMANCE',
  FINANCIAL = 'FINANCIAL',
  RESOURCE_UTILIZATION = 'RESOURCE_UTILIZATION',
  TASK_ANALYSIS = 'TASK_ANALYSIS',
  TEAM_PERFORMANCE = 'TEAM_PERFORMANCE',
  QUALITY_METRICS = 'QUALITY_METRICS',
  CUSTOM = 'CUSTOM'
}

enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

enum DeviceType {
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  MOBILE = 'MOBILE'
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Clean existing data (for development only)
  console.log('Cleaning existing data...');
  await cleanDatabase();

  // Create organizations
  console.log('Creating organizations...');
  const azendOrg = await createOrganization('Azend Construction', 'azend-construction');
  const skylineOrg = await createOrganization('Skyline Builders', 'skyline-builders');

  // Create users with various roles
  console.log('Creating users...');
  const adminUser = await createUser('admin@buildtrack.pro', 'Admin User', UserRole.ADMIN, azendOrg.id);
  const managerUser = await createUser('manager@buildtrack.pro', 'Project Manager', UserRole.MANAGER, azendOrg.id);
  const teamMember = await createUser('team@buildtrack.pro', 'Team Member', UserRole.MEMBER, azendOrg.id);
  const clientUser = await createUser('client@buildtrack.pro', 'Client User', UserRole.CLIENT, azendOrg.id);
  
  const skylineAdmin = await createUser('admin@skyline.com', 'Skyline Admin', UserRole.ADMIN, skylineOrg.id);

  // Create projects
  console.log('Creating projects...');
  const residentialProject = await createProject(
    'Oceanview Residences', 
    'Luxury condominium development with 24 units', 
    ProjectStatus.IN_PROGRESS, 
    azendOrg.id,
    managerUser.id,
    new Date('2025-02-15'),
    new Date('2026-06-30')
  );

  const commercialProject = await createProject(
    'Tech Hub Office Complex', 
    'Modern office space with smart building features', 
    ProjectStatus.NOT_STARTED, 
    azendOrg.id,
    adminUser.id,
    new Date('2025-05-01'),
    new Date('2026-12-15')
  );

  const skylineProject = await createProject(
    'Downtown Revitalization', 
    'Mixed-use development in city center', 
    ProjectStatus.IN_PROGRESS, 
    skylineOrg.id,
    skylineAdmin.id,
    new Date('2025-03-10'),
    new Date('2026-08-20')
  );

  // Create tasks
  console.log('Creating tasks...');
  await createTask(
    'Complete foundation design',
    'Finalize structural engineering for the foundation',
    TaskStatus.IN_PROGRESS,
    residentialProject.id,
    managerUser.id,
    teamMember.id,
    new Date('2025-04-30')
  );

  await createTask(
    'Obtain building permits',
    'Submit all necessary documentation to city planning department',
    TaskStatus.TO_DO,
    residentialProject.id,
    managerUser.id,
    adminUser.id,
    new Date('2025-05-15')
  );

  await createTask(
    'Finalize interior design concepts',
    'Complete mockups for client review',
    TaskStatus.DONE,
    commercialProject.id,
    adminUser.id,
    teamMember.id,
    new Date('2025-04-20')
  );

  // Create dashboard layouts
  console.log('Creating dashboard layouts...');
  const adminDashboard = await createDashboard('Executive Overview', adminUser.id, azendOrg.id);
  const managerDashboard = await createDashboard('Project Management', managerUser.id, azendOrg.id);
  const teamDashboard = await createDashboard('Daily Tasks', teamMember.id, azendOrg.id);
  const clientDashboard = await createDashboard('Project Progress', clientUser.id, azendOrg.id);

  // Create widgets
  console.log('Creating widgets...');
  const projectOverviewWidget = await createWidget(
    'Project Overview',
    'High-level view of all active projects',
    WidgetType.PROJECT_OVERVIEW,
    {
      showCompletionPercentage: true,
      showBudgetStatus: true,
      compactView: false,
      colorScheme: 'primary-blue',
    }
  );

  const taskListWidget = await createWidget(
    'Task List',
    'Current and upcoming tasks',
    WidgetType.TASK_LIST,
    {
      groupByProject: true,
      showPriority: true,
      showDueDate: true,
      colorScheme: 'primary-orange',
    }
  );

  const timelineWidget = await createWidget(
    'Project Timeline',
    'Gantt chart of project schedule',
    WidgetType.TIMELINE,
    {
      zoomLevel: 'month',
      showMilestones: true,
      showDependencies: true,
      colorScheme: 'primary-blue',
    }
  );

  const analyticsWidget = await createWidget(
    'Performance Metrics',
    'Key performance indicators',
    WidgetType.ANALYTICS,
    {
      metrics: ['completion_rate', 'budget_variance', 'schedule_adherence'],
      visualizationType: 'chart',
      timePeriod: 'quarterly',
      colorScheme: 'primary-blue',
    }
  );

  // Assign widgets to dashboards
  console.log('Assigning widgets to dashboards...');
  await createDashboardWidget(adminDashboard.id, projectOverviewWidget.id, 1, 1, 6, 4);
  await createDashboardWidget(adminDashboard.id, analyticsWidget.id, 7, 1, 6, 4);
  
  await createDashboardWidget(managerDashboard.id, projectOverviewWidget.id, 1, 1, 6, 3);
  await createDashboardWidget(managerDashboard.id, taskListWidget.id, 7, 1, 6, 3);
  await createDashboardWidget(managerDashboard.id, timelineWidget.id, 1, 4, 12, 4);

  await createDashboardWidget(teamDashboard.id, taskListWidget.id, 1, 1, 12, 6);
  
  await createDashboardWidget(clientDashboard.id, projectOverviewWidget.id, 1, 1, 12, 4);
  await createDashboardWidget(clientDashboard.id, timelineWidget.id, 1, 5, 12, 4);

  // Create notifications
  console.log('Creating notifications...');
  await createNotification(
    'Task assigned to you: Complete foundation design',
    NotificationType.TASK,
    teamMember.id,
    { taskId: '1', projectId: residentialProject.id, type: 'assignment' }
  );

  await createNotification(
    'Project milestone reached: Design phase completed',
    NotificationType.SYSTEM,
    managerUser.id,
    { projectId: commercialProject.id, milestoneId: '1', type: 'milestone_completed' }
  );

  await createNotification(
    'Comment added to task: Obtain building permits',
    NotificationType.MESSAGE,
    adminUser.id,
    { taskId: '2', projectId: residentialProject.id, commentId: '1', type: 'comment_added' }
  );

  // Create reports
  console.log('Creating reports...');
  await createReport(
    'Monthly Project Progress',
    'Overview of all projects status and progress',
    ReportType.PROJECT_PERFORMANCE,
    adminUser.id,
    azendOrg.id,
    {
      timeframe: 'monthly',
      includeCompletedProjects: true,
      metrics: ['completion_percentage', 'budget_variance', 'resource_utilization']
    }
  );

  await createReport(
    'Budget Analysis',
    'Detailed breakdown of project budgets and expenditures',
    ReportType.FINANCIAL,
    managerUser.id,
    azendOrg.id,
    {
      timeframe: 'quarterly',
      showTrends: true,
      breakdownByCategory: true
    }
  );

  // Create KPI targets
  console.log('Creating KPI targets...');
  await createKpiTarget(
    'Project Completion Rate',
    85.0,
    75.0,
    90.0,
    azendOrg.id
  );

  await createKpiTarget(
    'Budget Adherence',
    95.0,
    90.0,
    100.0,
    azendOrg.id
  );

  console.log('✅ Seed completed successfully!');
}

// Helper function to clean the database (for development purposes)
async function cleanDatabase() {
  // Delete in correct order to respect foreign key constraints
  await prisma.dashboardWidget.deleteMany();
  await prisma.dashboardLayout.deleteMany();
  await prisma.dashboard.deleteMany();
  await prisma.widget.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.report.deleteMany();
  await prisma.kpiTarget.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

// Helper functions to create entities
async function createOrganization(name: string, slug: string) {
  return prisma.organization.create({
    data: {
      name,
      slug,
      settings: {
        theme: {
          primaryColor: 'rgb(24,62,105)',
          secondaryColor: 'rgb(236,107,44)',
          darkMode: false
        },
        features: {
          enabledModules: ['projects', 'tasks', 'reports', 'documents']
        }
      }
    }
  });
}

async function createUser(email: string, name: string, role: UserRole, organizationId: string) {
  // For seed data, use a pre-computed hash instead of bcrypt dependency
  const hashedPassword = '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm'; // 'password123'
  
  return prisma.user.create({
    data: {
      email,
      displayName: name,
      hashedPassword,
      role,
      organizationId,
      preferences: {
        dashboardLayout: 'default',
        theme: 'light',
        notifications: {
          email: true,
          inApp: true
        }
      }
    }
  });
}

async function createProject(
  name: string, 
  description: string, 
  status: ProjectStatus, 
  organizationId: string,
  ownerId: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.project.create({
    data: {
      name,
      description,
      status,
      organizationId,
      ownerId,
      startDate,
      endDate,
      budget: parseFloat((Math.random() * 1000000 + 500000).toFixed(2)),
      location: {
        address: '123 Main Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02108',
        coordinates: {
          latitude: 42.3601,
          longitude: -71.0589
        }
      }
    }
  });
}

async function createTask(
  title: string,
  description: string,
  status: TaskStatus,
  projectId: string,
  createdById: string,
  assignedToId: string,
  dueDate: Date
) {
  return prisma.task.create({
    data: {
      title,
      description,
      status,
      projectId,
      createdById,
      assignedToId,
      dueDate,
      priority: Math.floor(Math.random() * 3) + 1 === 1 ? TaskPriority.LOW : (Math.floor(Math.random() * 3) + 1 === 2 ? TaskPriority.MEDIUM : TaskPriority.HIGH),
      estimatedHours: Math.floor(Math.random() * 40) + 1, // 1-40 hours
    }
  });
}

async function createDashboard(name: string, userId: string, organizationId: string) {
  return prisma.dashboard.create({
    data: {
      name,
      userId,
      organizationId,
      isDefault: false,
      layouts: {
        create: [
          {
            deviceType: 'DESKTOP',
            columnCount: 12,
            userId,
          },
          {
            deviceType: 'TABLET',
            columnCount: 8,
            userId,
          },
          {
            deviceType: 'MOBILE',
            columnCount: 4,
            userId,
          }
        ]
      }
    },
    include: {
      layouts: true
    }
  });
}

async function createWidget(
  name: string,
  description: string,
  widgetType: WidgetType,
  configuration: any
) {
  return prisma.widget.create({
    data: {
      name,
      description,
      widgetType,
      config: configuration
    }
  });
}

async function createDashboardWidget(
  dashboardId: string,
  widgetId: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  return prisma.dashboardWidget.create({
    data: {
      dashboard: { connect: { id: dashboardId } },
      widget: { connect: { id: widgetId } },
      x,
      y,
      width,
      height,
      settings: {
        refreshInterval: 300, // 5 minutes
        expanded: true
      }
    }
  });
}

async function createNotification(
  message: string,
  type: NotificationType,
  userId: string,
  metadata: any
) {
  return prisma.notification.create({
    data: {
      message,
      type,
      user: { connect: { id: userId } },
      read: false,
      metadata
    }
  });
}

async function createReport(
  name: string,
  description: string,
  reportType: ReportType,
  createdById: string,
  organizationId: string,
  configuration: any
) {
  return prisma.report.create({
    data: {
      name,
      description,
      reportType,
      createdBy: { connect: { id: createdById } },
      organization: { connect: { id: organizationId } },
      configuration,
      schedule: {
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        recipients: [createdById]
      }
    }
  });
}

async function createKpiTarget(
  name: string,
  targetValue: number,
  minThreshold: number,
  maxThreshold: number,
  organizationId: string
) {
  return prisma.kpiTarget.create({
    data: {
      metricName: name,
      targetValue,
      minThreshold,
      maxThreshold,
      organization: { connect: { id: organizationId } },
      period: 'QUARTERLY'
    }
  });
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
