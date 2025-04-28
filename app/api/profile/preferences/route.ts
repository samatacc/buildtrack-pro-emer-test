/**
 * BuildTrack Pro - User Preferences API
 * 
 * This API provides endpoints for managing user preferences with robust mobile support.
 * It follows BuildTrack Pro's mobile-first design principles and enables granular
 * control over UI settings, notification preferences, and data usage options.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * GET /api/profile/preferences
 * Retrieves the current user's preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access your preferences' },
        { status: 401 }
      );
    }

    // Fetch user preferences
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        preferences: true,
        language: true,
        timezone: true,
        preferredContactMethod: true,
        offlineAccess: true,
        dataUsagePreferences: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile Not Found', message: 'User preferences could not be retrieved' },
        { status: 404 }
      );
    }

    // Try to parse JSONB preferences into a structured object
    let structuredPreferences = {};
    try {
      if (profile.preferences) {
        structuredPreferences = profile.preferences as any;
      }
    } catch (error) {
      console.error('Error parsing preferences:', error);
    }

    // Return the preferences
    return NextResponse.json({
      preferences: {
        // General preferences
        ...structuredPreferences,
        
        // Explicit fields in the profile
        language: profile.language,
        timezone: profile.timezone,
        preferredContactMethod: profile.preferredContactMethod,
        offlineAccess: profile.offlineAccess,
        dataUsagePreferences: profile.dataUsagePreferences
      },
      message: 'Preferences retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while retrieving preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/preferences
 * Updates specific user preferences without overwriting the entire preferences object
 */
export async function PATCH(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update your preferences' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Destructure standalone preference fields
    const {
      language,
      timezone,
      preferredContactMethod,
      offlineAccess,
      dataUsagePreferences,
      ...otherPreferences
    } = body;
    
    // Fetch current user profile
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse current preferences
    let currentPreferences = {};
    try {
      if (profile.preferences) {
        currentPreferences = profile.preferences as any;
      }
    } catch (error) {
      console.error('Error parsing current preferences:', error);
    }

    // Prepare update data
    const updateData: any = {};
    
    // Update standalone fields if provided
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (preferredContactMethod !== undefined) updateData.preferredContactMethod = preferredContactMethod;
    if (offlineAccess !== undefined) updateData.offlineAccess = offlineAccess;
    if (dataUsagePreferences !== undefined) updateData.dataUsagePreferences = dataUsagePreferences;
    
    // Merge other preferences with existing preferences
    if (Object.keys(otherPreferences).length > 0) {
      updateData.preferences = {
        ...currentPreferences,
        ...otherPreferences
      };
    }

    // Update the user's preferences
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        preferences: true,
        language: true,
        timezone: true,
        preferredContactMethod: true,
        offlineAccess: true,
        dataUsagePreferences: true
      }
    });

    // Try to parse updated preferences into a structured object
    let structuredPreferences = {};
    try {
      if (updatedProfile.preferences) {
        structuredPreferences = updatedProfile.preferences as any;
      }
    } catch (error) {
      console.error('Error parsing updated preferences:', error);
    }

    // Return the updated preferences
    return NextResponse.json({
      preferences: {
        // General preferences
        ...structuredPreferences,
        
        // Explicit fields in the profile
        language: updatedProfile.language,
        timezone: updatedProfile.timezone,
        preferredContactMethod: updatedProfile.preferredContactMethod,
        offlineAccess: updatedProfile.offlineAccess,
        dataUsagePreferences: updatedProfile.dataUsagePreferences
      },
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while updating preferences' },
      { status: 500 }
    );
  }
}
