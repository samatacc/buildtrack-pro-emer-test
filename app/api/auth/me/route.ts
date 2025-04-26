/**
 * BuildTrack Pro - User Profile API
 * 
 * This API endpoint retrieves the current user's profile information
 * based on their authentication token.
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserServiceFactory } from '../../../../lib/data/services/UserServiceFactory';

const JWT_SECRET = process.env.JWT_SECRET || 'buildtrack-pro-development-secret';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('buildtrack_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      if (!decoded || !decoded.userId) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
      
      // Get user service instance
      const userService = UserServiceFactory.getInstance();
      
      // Get user by ID
      const user = await userService.getUserById(decoded.userId);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Remove sensitive data
      const { password, ...userData } = user;
      
      return NextResponse.json({
        success: true,
        user: userData
      });
      
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      // Clear invalid token
      const response = NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
      
      response.cookies.set({
        name: 'buildtrack_token',
        value: '',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0 // Expire immediately
      });
      
      return response;
    }
  } catch (error) {
    console.error('User profile error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch user profile' 
      },
      { status: 500 }
    );
  }
}
