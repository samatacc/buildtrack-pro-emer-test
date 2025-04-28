// Create test user script
// Run with: node scripts/create-test-user.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('Password123', 10);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@buildtrackpro.com',
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        role: 'admin',
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
    
    console.log('Test user created successfully:');
    console.log(`- Email: ${user.email}`);
    console.log(`- Password: Password123`);
    console.log(`- User ID: ${user.id}`);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('User already exists with this email');
    } else {
      console.error('Error creating test user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
