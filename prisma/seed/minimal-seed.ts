// BuildTrack Pro - Minimal Database Seed File
// This file contains a simplified seed script matching the current schema

import { PrismaClient } from '../../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal seed process...');

  // Clean existing data
  await cleanDatabase();

  // Create organization with BuildTrack Pro color scheme
  console.log('Creating organization...');
  const organization = await prisma.organization.create({
    data: {
      name: 'Azend Construction',
      slug: 'azend-construction',
      logoUrl: 'https://example.com/logo.png',
      isActive: true,
      subscriptionTier: 'professional',
      settings: {
        theme: {
          primaryColor: 'rgb(24,62,105)', // Primary Blue from design system
          secondaryColor: 'rgb(236,107,44)', // Primary Orange from design system
          darkMode: false
        },
        features: {
          enabledModules: ['projects', 'tasks', 'reports', 'documents']
        }
      }
    }
  });
  
  console.log(`Created organization: ${organization.name} (${organization.id})`);

  // Create roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Administrator with full access',
      isSystemRole: true,
      organizationId: organization.id,
      defaultWidgets: JSON.parse('["dashboard_overview", "project_list", "tasks_due"]')
    }
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'Project Manager',
      description: 'Manages projects and teams',
      isSystemRole: true,
      organizationId: organization.id,
      defaultWidgets: JSON.parse('["project_list", "team_overview", "tasks_due"]')
    }
  });

  // Create users
  console.log('Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@buildtrack.pro',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      organizationId: organization.id,
      roleId: adminRole.id,
      emailVerified: true,
      preferences: {
        theme: 'light',
        dashboardLayout: 'default',
        notifications: {
          email: true,
          inApp: true
        }
      }
    }
  });

  // Create a sample dashboard with mobile-first layouts
  console.log('Creating dashboard...');
  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Executive Overview',
      description: 'High-level overview of all projects and tasks',
      isDefault: true,
      organizationId: organization.id,
      layouts: {
        create: [
          {
            // Mobile layout (following mobile-first approach)
            deviceType: 'MOBILE',
            layoutJson: {
              columns: 4,
              widgets: [
                { id: 'widget1', x: 0, y: 0, w: 4, h: 4 },
                { id: 'widget2', x: 0, y: 4, w: 4, h: 3 }
              ]
            },
            organizationId: organization.id,
            userId: adminUser.id
          },
          {
            // Tablet layout
            deviceType: 'TABLET',
            layoutJson: {
              columns: 8,
              widgets: [
                { id: 'widget1', x: 0, y: 0, w: 4, h: 4 },
                { id: 'widget2', x: 4, y: 0, w: 4, h: 4 }
              ]
            },
            organizationId: organization.id,
            userId: adminUser.id
          },
          {
            // Desktop layout
            deviceType: 'DESKTOP',
            layoutJson: {
              columns: 12,
              widgets: [
                { id: 'widget1', x: 0, y: 0, w: 4, h: 4 },
                { id: 'widget2', x: 4, y: 0, w: 4, h: 4 },
                { id: 'widget3', x: 8, y: 0, w: 4, h: 4 }
              ]
            },
            organizationId: organization.id,
            userId: adminUser.id
          }
        ]
      }
    }
  });

  // Create widgets with the BuildTrack Pro color scheme
  console.log('Creating widgets...');
  const projectOverviewWidget = await prisma.widget.create({
    data: {
      name: 'Project Overview',
      description: 'Overview of project status and progress',
      widgetType: 'project_overview',
      icon: 'chart-bar',
      defaultSize: 'NORMAL',
      organizationId: organization.id,
      defaultSettings: {
        showCompletionPercentage: true,
        showBudgetStatus: true,
        colorScheme: 'primary-blue', // Using BuildTrack Pro primary blue
        refreshInterval: 300 // 5 minutes
      }
    }
  });

  const taskListWidget = await prisma.widget.create({
    data: {
      name: 'Task List',
      description: 'List of tasks and their status',
      widgetType: 'task_list',
      icon: 'clipboard-list',
      defaultSize: 'NORMAL',
      organizationId: organization.id,
      defaultSettings: {
        groupBy: 'status',
        showAssignee: true,
        colorScheme: 'primary-orange', // Using BuildTrack Pro primary orange
        refreshInterval: 300 // 5 minutes
      }
    }
  });

  // Create dashboard widgets
  console.log('Creating dashboard widgets...');
  const dashboardWidget1 = await prisma.dashboardWidget.create({
    data: {
      dashboard: { connect: { id: dashboard.id } },
      widget: { connect: { id: projectOverviewWidget.id } },
      x: 0,
      y: 0,
      width: 4,
      height: 4,
      settings: {
        title: 'Project Status',
        refreshInterval: 300,
        expanded: true
      }
    }
  });

  const dashboardWidget2 = await prisma.dashboardWidget.create({
    data: {
      dashboard: { connect: { id: dashboard.id } },
      widget: { connect: { id: taskListWidget.id } },
      x: 4,
      y: 0,
      width: 4,
      height: 4,
      settings: {
        title: 'My Tasks',
        refreshInterval: 300,
        expanded: true
      }
    }
  });

  console.log('✅ Minimal seed completed successfully!');
  console.log(`Created ${Object.keys({organization, adminRole, managerRole, adminUser, dashboard, projectOverviewWidget, taskListWidget, dashboardWidget1, dashboardWidget2}).length} entities.`);
}

// Helper function to clean the database (for development purposes)
async function cleanDatabase() {
  // Delete in correct order to respect foreign key constraints
  await prisma.dashboardWidget.deleteMany();
  await prisma.dashboardLayout.deleteMany();
  await prisma.dashboard.deleteMany();
  await prisma.widget.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.organization.deleteMany();
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
