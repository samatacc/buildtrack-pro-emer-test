// BuildTrack Pro Authentication Setup Script
// This script creates reliable test users in the localStorage for development

const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Create test users
async function createTestUsers() {
  try {
    const hashedPassword = await bcrypt.hash('Password123', 10);
    
    // Create organization
    const organization = {
      id: uuidv4(),
      name: 'BuildTrack Test Organization',
      description: 'Test organization for BuildTrack Pro',
      industry: 'construction',
      size: 'small',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create users with roles
    const users = [
      {
        id: uuidv4(),
        email: 'admin@buildtrackpro.com',
        name: 'Admin User',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        role: 'admin',
        organizationId: organization.id,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      },
      {
        id: uuidv4(),
        email: 'pm@buildtrackpro.com',
        name: 'Project Manager',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        role: 'project_manager',
        organizationId: organization.id,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      },
      {
        id: uuidv4(),
        email: 'user@buildtrackpro.com',
        name: 'Regular User',
        password: hashedPassword,
        authProvider: 'email',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        role: 'user',
        organizationId: organization.id,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      }
    ];
    
    // Create a data store file for users
    const dataDir = './data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    // Write the users to a file that the app can read
    fs.writeFileSync(
      './data/users.json', 
      JSON.stringify(users, null, 2)
    );
    
    // Write the organization to a file
    fs.writeFileSync(
      './data/organizations.json', 
      JSON.stringify([organization], null, 2)
    );
    
    console.log('✅ Auth setup complete! Test users created:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    console.log('Password for all users: Password123');
    
  } catch (error) {
    console.error('❌ Error setting up authentication:', error);
  }
}

createTestUsers();
