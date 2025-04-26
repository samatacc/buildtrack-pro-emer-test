/**
 * BuildTrack Pro - Supabase Client
 * 
 * This module provides a singleton Supabase client instance that can be used
 * throughout the application for auth, database, and storage operations.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
// In production, these would be set in the hosting environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

/**
 * Create a Supabase client instance with custom configurations
 * This follows BuildTrack Pro's architectural guidelines
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Using BuildTrack Pro's routing pattern for authentication
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
  }
});

/**
 * Helper function to get the current session
 * @returns The current session or null if not authenticated
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Helper function to get the current user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};
