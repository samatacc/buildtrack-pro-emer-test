/**
 * BuildTrack Pro - Registration API
 * 
 * This API endpoint handles new user registration.
 * It connects to the UserService to create new user accounts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserServiceFactory } from '../../../../lib/data/services/UserServiceFactory';
import { UserRegistrationData } from '../../../../lib/data/models/User';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }
    
    // Prepare registration data
    const registrationData: UserRegistrationData = {
      email: body.email,
      password: body.password,
      name: body.name,
      authProvider: 'email',
      authProviderId: undefined
    };
    
    // Note: role and organizationId will be handled by the UserService itself
    // as they're not part of the UserRegistrationData interface
    
    // Get user service instance
    const userService = UserServiceFactory.getInstance();
    
    // Register new user
    const result = await userService.registerUser(registrationData);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
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
    console.error('Registration error:', error);
    
    // Check for duplicate email error
    if (error instanceof Error && error.message.includes('email already exists')) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Registration failed' 
      },
      { status: 500 }
    );
  }
}
