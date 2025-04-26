/**
 * BuildTrack Pro - Logout API
 * 
 * This API endpoint handles user logout by clearing authentication tokens.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear authentication cookie
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
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Logout failed' 
      },
      { status: 500 }
    );
  }
}
