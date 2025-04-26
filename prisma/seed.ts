/**
 * Database Seed Script
 * This script populates the database with initial data for testing and development
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (for development only)
  console.log('Clearing existing data...');
  await prisma.resetToken.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('Creating test organization...');
  // Create test organization
  const testOrg = await prisma.organization.create({
    data: {
      name: 'BuildTrack Test Org',
      description: 'Test organization for BuildTrack Pro',
      industry: 'construction',
      size: 'small'
    }
  });

  console.log('Creating test users...');
  // Hash the test password
  const hashedPassword = await bcrypt.hash('Password123', 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@buildtrackpro.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      authProvider: 'email',
      isEmailVerified: true,
      role: 'admin',
      organizationId: testOrg.id,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    }
  });

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@buildtrackpro.com',
      firstName: 'Test',
      lastName: 'User',
      password: hashedPassword,
      authProvider: 'email',
      isEmailVerified: true,
      role: 'user',
      organizationId: testOrg.id
    }
  });

  console.log('Creating test project...');
  // Create test project
  const testProject = await prisma.project.create({
    data: {
      name: 'Test Construction Project',
      description: 'A test project for BuildTrack Pro',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      location: '123 Test Street, Test City',
      budget: 250000,
      organizationId: testOrg.id
    }
  });

  // Add users to project
  await prisma.projectMember.create({
    data: {
      userId: adminUser.id,
      projectId: testProject.id,
      role: 'manager',
      permissions: {
        canEdit: true,
        canDelete: true,
        canManageUsers: true
      }
    }
  });

  await prisma.projectMember.create({
    data: {
      userId: regularUser.id,
      projectId: testProject.id,
      role: 'member',
      permissions: {
        canEdit: true,
        canDelete: false,
        canManageUsers: false
      }
    }
  });

  // Create sample tasks
  const tasks = [
    {
      title: 'Foundation Work',
      description: 'Prepare and pour the concrete foundation',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      assigneeId: regularUser.id
    },
    {
      title: 'Framing',
      description: 'Complete structural framing work',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      assigneeId: null
    },
    {
      title: 'Electrical Installation',
      description: 'Install all electrical systems',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assigneeId: null
    },
    {
      title: 'Plumbing',
      description: 'Complete all plumbing work',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      assigneeId: null
    }
  ];

  console.log('Creating sample tasks...');
  for (const task of tasks) {
    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: testProject.id,
        assigneeId: task.assigneeId,
        creatorId: adminUser.id
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect();
  });
