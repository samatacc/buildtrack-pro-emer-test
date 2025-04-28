/**
 * BuildTrack Pro - Dashboard Layout API
 * 
 * This API provides endpoints for managing personalized dashboard layouts.
 * It follows BuildTrack Pro's mobile-first approach with responsive designs
 * and implements the design system with Primary Blue (rgb(24,62,105)) and 
 * Primary Orange (rgb(236,107,44)) styling through the UI components that
 * will utilize these layouts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * GET /api/profile/dashboard-layout
 * Retrieves the current user's dashboard layout configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access your dashboard layout' },
        { status: 401 }
      );
    }

    // Fetch user dashboard layout
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        dashboardLayout: true,
        recentProjects: true,
        favoriteTools: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile Not Found', message: 'User dashboard layout could not be retrieved' },
        { status: 404 }
      );
    }

    // Parse dashboardLayout JSON
    let layoutConfig = {
      widgets: [],
      layout: 'default'
    };
    
    try {
      if (profile.dashboardLayout) {
        layoutConfig = profile.dashboardLayout as any;
      }
    } catch (error) {
      console.error('Error parsing dashboard layout:', error);
    }

    // Parse recent projects
    let recentProjects = [];
    try {
      if (profile.recentProjects) {
        recentProjects = profile.recentProjects as any;
      }
    } catch (error) {
      console.error('Error parsing recent projects:', error);
    }

    // Parse favorite tools
    let favoriteTools = [];
    try {
      if (profile.favoriteTools) {
        favoriteTools = profile.favoriteTools as any;
      }
    } catch (error) {
      console.error('Error parsing favorite tools:', error);
    }

    // Return the dashboard configuration
    return NextResponse.json({
      dashboardLayout: layoutConfig,
      recentProjects,
      favoriteTools,
      message: 'Dashboard layout retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard layout:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while retrieving dashboard layout' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/dashboard-layout
 * Updates the user's dashboard layout configuration
 */
export async function PUT(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update your dashboard layout' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { layout, widgets } = body;
    
    // Validate layout data
    if (!layout || !widgets || !Array.isArray(widgets)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid dashboard layout data' },
        { status: 400 }
      );
    }

    // Prepare the new layout object
    const dashboardLayout = {
      layout,
      widgets: widgets.map((widget: any) => ({
        id: widget.id,
        type: widget.type,
        position: widget.position,
        size: widget.size,
        settings: widget.settings || {},
      }))
    };

    // Update the user's dashboard layout
    await prisma.user.update({
      where: { id: user.id },
      data: { dashboardLayout }
    });

    return NextResponse.json({
      message: 'Dashboard layout updated successfully',
      dashboardLayout
    });
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while updating dashboard layout' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/dashboard-layout/recent-projects
 * Updates the user's recent projects list
 */
export async function PATCH(request: NextRequest) {
  try {
    // Create a Supabase client for authentication
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update recent projects' },
        { status: 401 }
      );
    }

    // Get the operation type from the URL
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    
    // Parse the request body
    const body = await request.json();
    
    // Handle different operations
    switch (operation) {
      case 'add-recent-project': {
        const { projectId, projectName, thumbnailUrl } = body;
        
        if (!projectId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Project ID is required' },
            { status: 400 }
          );
        }
        
        // Get current recent projects
        const profile = await prisma.user.findUnique({
          where: { id: user.id },
          select: { recentProjects: true }
        });
        
        if (!profile) {
          return NextResponse.json(
            { error: 'Profile Not Found', message: 'User profile not found' },
            { status: 404 }
          );
        }
        
        // Parse recent projects
        let recentProjects = [];
        try {
          if (profile.recentProjects) {
            recentProjects = profile.recentProjects as any;
          }
        } catch (error) {
          console.error('Error parsing recent projects:', error);
        }
        
        // Check if project already exists
        const existingIndex = recentProjects.findIndex((p: any) => p.id === projectId);
        
        if (existingIndex !== -1) {
          // Remove existing entry
          recentProjects.splice(existingIndex, 1);
        }
        
        // Add new entry at the beginning (most recent)
        recentProjects.unshift({
          id: projectId,
          name: projectName || 'Unnamed Project',
          thumbnailUrl,
          accessedAt: new Date().toISOString()
        });
        
        // Keep only the 10 most recent projects
        if (recentProjects.length > 10) {
          recentProjects = recentProjects.slice(0, 10);
        }
        
        // Update recent projects
        await prisma.user.update({
          where: { id: user.id },
          data: { recentProjects }
        });
        
        // Also update last active project
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveProjectId: projectId }
        });
        
        return NextResponse.json({
          message: 'Recent project added successfully',
          recentProjects
        });
      }
      
      case 'add-favorite-tool': {
        const { toolId, toolName, toolIcon } = body;
        
        if (!toolId || !toolName) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Tool ID and name are required' },
            { status: 400 }
          );
        }
        
        // Get current favorite tools
        const profile = await prisma.user.findUnique({
          where: { id: user.id },
          select: { favoriteTools: true }
        });
        
        if (!profile) {
          return NextResponse.json(
            { error: 'Profile Not Found', message: 'User profile not found' },
            { status: 404 }
          );
        }
        
        // Parse favorite tools
        let favoriteTools = [];
        try {
          if (profile.favoriteTools) {
            favoriteTools = profile.favoriteTools as any;
          }
        } catch (error) {
          console.error('Error parsing favorite tools:', error);
        }
        
        // Check if tool already exists
        const exists = favoriteTools.some((t: any) => t.id === toolId);
        
        if (!exists) {
          // Add new favorite tool
          favoriteTools.push({
            id: toolId,
            name: toolName,
            icon: toolIcon || null,
            addedAt: new Date().toISOString()
          });
          
          // Update favorite tools
          await prisma.user.update({
            where: { id: user.id },
            data: { favoriteTools }
          });
        }
        
        return NextResponse.json({
          message: exists ? 'Tool already in favorites' : 'Favorite tool added successfully',
          favoriteTools
        });
      }
      
      case 'remove-favorite-tool': {
        const { toolId } = body;
        
        if (!toolId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Tool ID is required' },
            { status: 400 }
          );
        }
        
        // Get current favorite tools
        const profile = await prisma.user.findUnique({
          where: { id: user.id },
          select: { favoriteTools: true }
        });
        
        if (!profile) {
          return NextResponse.json(
            { error: 'Profile Not Found', message: 'User profile not found' },
            { status: 404 }
          );
        }
        
        // Parse favorite tools
        let favoriteTools = [];
        try {
          if (profile.favoriteTools) {
            favoriteTools = profile.favoriteTools as any;
          }
        } catch (error) {
          console.error('Error parsing favorite tools:', error);
        }
        
        // Remove the tool
        const updatedTools = favoriteTools.filter((t: any) => t.id !== toolId);
        
        // Update favorite tools
        await prisma.user.update({
          where: { id: user.id },
          data: { favoriteTools: updatedTools }
        });
        
        return NextResponse.json({
          message: 'Favorite tool removed successfully',
          favoriteTools: updatedTools
        });
      }
      
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating dashboard preferences:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while updating dashboard preferences' },
      { status: 500 }
    );
  }
}
