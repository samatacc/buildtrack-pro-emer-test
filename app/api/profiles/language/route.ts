import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase/client';

/**
 * API Route for Language Preference Management
 * 
 * Handles user language preference operations:
 * - GET: Fetch current user's language preference
 * - PUT: Update current user's language preference
 * 
 * Authentication is required for all operations.
 */

// GET /api/profiles/language - Get user's language preference
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
    
    // Fetch user profile with language preference
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('locale')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch language preference' },
        { status: 500 }
      );
    }
    
    // Return the language preference or default to 'en'
    return NextResponse.json({ 
      locale: profile?.locale || 'en'
    });
  } catch (error) {
    console.error('Error in language preference GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profiles/language - Update user's language preference
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
    const { locale } = await request.json();
    
    // Validate locale
    if (!locale) {
      return NextResponse.json(
        { error: 'Invalid request: No locale specified' },
        { status: 400 }
      );
    }
    
    // Validate supported locales (en, es, fr, pt-BR)
    const supportedLocales = ['en', 'es', 'fr', 'pt-BR'];
    if (!supportedLocales.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale: Supported locales are en, es, fr, pt-BR' },
        { status: 400 }
      );
    }
    
    // Update profile with new language preference
    const { error } = await supabase
      .from('profiles')
      .update({
        locale,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);
      
    if (error) {
      console.error('Error updating language preference:', error);
      return NextResponse.json(
        { error: 'Failed to update language preference' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Language preference updated successfully',
      locale
    });
  } catch (error) {
    console.error('Error in language preference PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
