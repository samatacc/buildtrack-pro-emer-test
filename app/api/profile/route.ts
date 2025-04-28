/**
 * BuildTrack Pro - Profile Management API
 * 
 * This API provides endpoints for retrieving and updating user profile information.
 * It follows REST conventions for API design and uses Prisma for database access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * GET /api/profile
 * Retrieves the current user's profile information
 */
export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access your profile' },
        { status: 401 }
      );
    }

    // Fetch the user's profile from the database
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        // Basic profile information
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        
        // Professional fields
        jobTitle: true,
        department: true,
        skills: true,
        certifications: true,
        
        // Communication preferences
        preferredContactMethod: true,
        timezone: true,
        language: true,
        preferences: true,
        
        // User experience customization
        dashboardLayout: true,
        recentProjects: true,
        favoriteTools: true,
        
        // Mobile-specific fields
        offlineAccess: true,
        dataUsagePreferences: true,
        
        // Analytics & personalization
        loginStreak: true,
        onboardingStatus: true,
        
        // Relations
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        role: {
          select: {
            id: true,
            name: true
          }
        },
        lastActiveProject: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile Not Found', message: 'Profile data could not be retrieved' },
        { status: 404 }
      );
    }

    // Return the profile data
    return NextResponse.json({ 
      profile,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while retrieving the profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Updates the current user's profile information
 */
export async function PATCH(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update your profile' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Extract updatable fields
    const {
      // Professional fields
      jobTitle,
      department,
      skills,
      certifications,
      
      // Communication preferences
      preferredContactMethod,
      timezone,
      language,
      preferences,
      
      // User experience customization
      dashboardLayout,
      recentProjects,
      favoriteTools,
      
      // Mobile-specific fields
      offlineAccess,
      dataUsagePreferences,
      
      // Analytics & personalization
      lastActiveProjectId,
      onboardingStatus,
      
      // Basic profile fields - only allow updating certain fields
      firstName,
      lastName,
      avatarUrl,
      phoneNumber
    } = body;
    
    // Create update data object with type safety
    const updateData: any = {};
    
    // Only include fields that are provided in the request
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    
    // Professional fields
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (department !== undefined) updateData.department = department;
    if (skills !== undefined) updateData.skills = skills;
    if (certifications !== undefined) updateData.certifications = certifications;
    
    // Communication preferences
    if (preferredContactMethod !== undefined) updateData.preferredContactMethod = preferredContactMethod;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (preferences !== undefined) updateData.preferences = preferences;
    
    // User experience customization
    if (dashboardLayout !== undefined) updateData.dashboardLayout = dashboardLayout;
    if (recentProjects !== undefined) updateData.recentProjects = recentProjects;
    if (favoriteTools !== undefined) updateData.favoriteTools = favoriteTools;
    
    // Mobile-specific fields
    if (offlineAccess !== undefined) updateData.offlineAccess = offlineAccess;
    if (dataUsagePreferences !== undefined) updateData.dataUsagePreferences = dataUsagePreferences;
    
    // Analytics & personalization
    if (lastActiveProjectId !== undefined) updateData.lastActiveProjectId = lastActiveProjectId;
    if (onboardingStatus !== undefined) updateData.onboardingStatus = onboardingStatus;
    
    // Update the user's record in the database
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phoneNumber: true,
        updatedAt: true,
        
        // Professional fields
        jobTitle: true,
        department: true,
        skills: true,
        certifications: true,
        
        // Communication preferences
        preferredContactMethod: true,
        timezone: true,
        language: true,
        preferences: true,
        
        // User experience customization
        dashboardLayout: true,
        recentProjects: true,
        favoriteTools: true,
        
        // Mobile-specific fields
        offlineAccess: true,
        dataUsagePreferences: true,
        
        // Analytics & personalization
        loginStreak: true,
        onboardingStatus: true
      }
    });

    // Return the updated profile
    return NextResponse.json({
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Check for Prisma-specific errors
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Profile Not Found', message: 'The profile you are trying to update does not exist' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while updating the profile' },
      { status: 500 }
    );
  }
}
