/**
 * BuildTrack Pro - Test User Setup API
 * 
 * This API endpoint creates guaranteed test users for local development.
 * It ensures that the authentication system has consistent, reliable test accounts.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Define our test users with BuildTrack Pro's role structure
const testUsers = [
  {
    email: 'admin@buildtrackpro.com',
    password: 'Password123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'pm@buildtrackpro.com',
    password: 'Password123',
    name: 'Project Manager',
    role: 'project_manager'
  },
  {
    email: 'contractor@buildtrackpro.com',
    password: 'Password123',
    name: 'Contractor User',
    role: 'contractor'
  },
  {
    email: 'client@buildtrackpro.com',
    password: 'Password123',
    name: 'Client User',
    role: 'client'
  },
  {
    email: 'user@buildtrackpro.com',
    password: 'Password123',
    name: 'Regular User',
    role: 'user'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Create a new array to hold the processed users
    const users = [];
    
    // Process each test user
    for (const testUser of testUsers) {
      // Hash the password securely
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      // Create a user with BuildTrack Pro's required fields
      users.push({
        id: uuidv4(),
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        role: testUser.role,
        isEmailVerified: true,
        organizationId: 'org_test',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        authProvider: 'email',
        authProviderId: null
      });
    }
    
    // For local development, store in localStorage via client-side code
    return NextResponse.json({ 
      success: true, 
      users,
      message: `Created ${users.length} test users`
    });
  } catch (error) {
    console.error('Error creating test users:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
