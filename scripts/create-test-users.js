// Create test users script for BuildTrack Pro
// This script follows the project's architectural requirements for reliable authentication testing
// Run with: node scripts/create-test-users.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test users...');
    
    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: 'BuildTrack Test Organization',
        description: 'Test organization for BuildTrack Pro',
        industry: 'construction',
        size: 'small'
      }
    });
    
    console.log(`Created organization: ${organization.name} (${organization.id})`);
    
    // Hash the password - using the same password for all test users for simplicity
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
        organizationId: organization.id
      }
    });
    
    console.log(`Created admin user: ${adminUser.email}`);
    
    // Create project manager user
    const pmUser = await prisma.user.create({
      data: {
        email: 'pm@buildtrackpro.com',
        firstName: 'Project',
        lastName: 'Manager',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        role: 'project_manager',
        organizationId: organization.id
      }
    });
    
    console.log(`Created project manager user: ${pmUser.email}`);
    
    // Create contractor user
    const contractorUser = await prisma.user.create({
      data: {
        email: 'contractor@buildtrackpro.com',
        firstName: 'Contractor',
        lastName: 'User',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        role: 'contractor',
        organizationId: organization.id
      }
    });
    
    console.log(`Created contractor user: ${contractorUser.email}`);
    
    // Create client user
    const clientUser = await prisma.user.create({
      data: {
        email: 'client@buildtrackpro.com',
        firstName: 'Client',
        lastName: 'User',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        role: 'client',
        organizationId: organization.id
      }
    });
    
    console.log(`Created client user: ${clientUser.email}`);
    
    // Create regular user
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@buildtrackpro.com',
        firstName: 'Regular',
        lastName: 'User',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        role: 'user',
        organizationId: organization.id
      }
    });
    
    console.log(`Created regular user: ${regularUser.email}`);
    
    console.log('\nTest users created successfully!');
    console.log('You can log in with any of these email addresses:');
    console.log('- admin@buildtrackpro.com');
    console.log('- pm@buildtrackpro.com');
    console.log('- contractor@buildtrackpro.com');
    console.log('- client@buildtrackpro.com');
    console.log('- user@buildtrackpro.com');
    console.log('\nPassword for all users: Password123');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Some users already exist (unique constraint violation)');
      console.log('If you want to recreate all users, run: npx prisma migrate reset --force');
    } else {
      console.error('Error creating test users:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
