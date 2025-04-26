/**
 * BuildTrack Pro - Login API
 * 
 * This API endpoint handles user authentication with email/password credentials.
 * It connects to the UserService to verify credentials and generate JWT tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserServiceFactory } from '../../../../lib/data/services/UserServiceFactory';
import { UserCredentials } from '../../../../lib/data/models/User';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Prepare credentials
    const credentials: UserCredentials = {
      email: body.email,
      password: body.password
    };
    
    // Get user service instance
    const userService = UserServiceFactory.getInstance();
    
    // Authenticate user
    const result = await userService.authenticateWithCredentials(credentials);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Extract token for cookies
    const { token, ...userData } = result;
    
    // Set JWT as HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: userData
    });
    
    // Set cookie options
    response.cookies.set({
      name: 'buildtrack_token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      },
      { status: 500 }
    );
  }
}
