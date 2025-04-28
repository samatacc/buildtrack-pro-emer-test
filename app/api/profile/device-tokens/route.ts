/**
 * BuildTrack Pro - Device Token Management API
 * 
 * This API provides endpoints for managing mobile device tokens for push notifications.
 * It follows the mobile-first approach of BuildTrack Pro, enabling field workers to
 * receive critical notifications even in construction environments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * POST /api/profile/device-tokens
 * Registers a new device token for push notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to register a device token' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { token, device } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Device token is required' },
        { status: 400 }
      );
    }

    // Get the current user profile
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { deviceTokens: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse the existing device tokens
    let deviceTokens = [];
    try {
      deviceTokens = profile.deviceTokens ? (profile.deviceTokens as any) : [];
    } catch (e) {
      deviceTokens = [];
    }

    // Check if the token already exists
    const tokenExists = deviceTokens.some((t: any) => t.token === token);
    
    if (tokenExists) {
      // Update the existing token entry
      deviceTokens = deviceTokens.map((t: any) => {
        if (t.token === token) {
          return {
            token,
            device: device || t.device,
            lastUpdated: new Date().toISOString()
          };
        }
        return t;
      });
    } else {
      // Add the new token
      deviceTokens.push({
        token,
        device: device || 'unknown',
        lastUpdated: new Date().toISOString()
      });
    }

    // Update the user's device tokens
    await prisma.user.update({
      where: { id: user.id },
      data: { deviceTokens }
    });

    return NextResponse.json({
      message: 'Device token registered successfully',
      deviceCount: deviceTokens.length
    });
  } catch (error) {
    console.error('Error registering device token:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while registering the device token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/device-tokens
 * Removes a device token from the user's profile
 */
export async function DELETE(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to unregister a device token' },
        { status: 401 }
      );
    }

    // Get the token from the query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Device token is required' },
        { status: 400 }
      );
    }

    // Get the current user profile
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { deviceTokens: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse the existing device tokens
    let deviceTokens = [];
    try {
      deviceTokens = profile.deviceTokens ? (profile.deviceTokens as any) : [];
    } catch (e) {
      deviceTokens = [];
    }

    // Filter out the token to remove
    const updatedTokens = deviceTokens.filter((t: any) => t.token !== token);
    
    // If no tokens were removed, return an appropriate message
    if (updatedTokens.length === deviceTokens.length) {
      return NextResponse.json({
        message: 'Device token not found',
        deviceCount: updatedTokens.length
      });
    }

    // Update the user's device tokens
    await prisma.user.update({
      where: { id: user.id },
      data: { deviceTokens: updatedTokens }
    });

    return NextResponse.json({
      message: 'Device token removed successfully',
      deviceCount: updatedTokens.length
    });
  } catch (error) {
    console.error('Error removing device token:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while removing the device token' },
      { status: 500 }
    );
  }
}
