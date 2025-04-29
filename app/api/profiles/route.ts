import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/client';

/**
 * API Route for Profile Management
 * 
 * Handles user profile operations:
 * - GET: Fetch current user's profile
 * - PUT: Update current user's profile
 * 
 * Authentication is required for all operations.
 */

// GET /api/profiles - Fetch current user profile
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profiles - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const updates = await request.json();
    
    // Validate request body
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: No update data provided' },
        { status: 400 }
      );
    }
    
    // Add updated_at timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Update profile in the database
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', session.user.id)
      .select();
      
    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: data[0]
    });
  } catch (error) {
    console.error('Error in profile PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
