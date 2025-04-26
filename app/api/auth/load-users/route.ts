import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Try to read users from the data file
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    
    // Check if the file exists
    if (fs.existsSync(usersPath)) {
      const usersData = fs.readFileSync(usersPath, 'utf8');
      const users = JSON.parse(usersData);
      
      // Return the users as JSON
      return NextResponse.json({ 
        users,
        success: true 
      });
    } else {
      // Generate in-memory test users if the file doesn't exist
      const adminUser = {
        id: '111-222-333',
        email: 'admin@buildtrackpro.com',
        name: 'Admin User',
        password: '$2a$10$JdvR31QeC5F2HvF.sLWnbe4.8K4MRU4k34YtAFVeR6jDUAmlt1fDS', // hashed "Password123"
        authProvider: 'email',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        role: 'admin',
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };
      
      const regularUser = {
        id: '444-555-666',
        email: 'user@buildtrackpro.com',
        name: 'Regular User',
        password: '$2a$10$JdvR31QeC5F2HvF.sLWnbe4.8K4MRU4k34YtAFVeR6jDUAmlt1fDS', // hashed "Password123"
        authProvider: 'email',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        role: 'user',
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };
      
      return NextResponse.json({ 
        users: [adminUser, regularUser],
        success: true,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error loading users:', error);
    return NextResponse.json({ 
      error: 'Failed to load users',
      success: false 
    }, { status: 500 });
  }
}
