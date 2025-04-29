'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { OnboardingData } from './SupabaseAuthContext';

/**
 * UnifiedAuthProvider for BuildTrack Pro
 * 
 * A consolidated authentication provider that works consistently across
 * both internationalized and non-internationalized routes. This provider
 * uses Supabase for authentication and implements all necessary auth flows:
 * - Email/password authentication
 * - OAuth (Google, Microsoft)
 * - Password reset
 * - User onboarding
 * 
 * Following BuildTrack Pro's design system with:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */

// Auth context type with all required methods
export interface UnifiedAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  locale: string;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  setUserLocale: (locale: string) => void;
  clearErrors: () => void;
}

// Create the auth context
const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// Initial state
const initialState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  locale: 'en' // Default locale
};

// Provider component
export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const router = useRouter();
  
  // Detect browser locale on initial load
  useEffect(() => {
    const detectBrowserLocale = () => {
      if (typeof window === 'undefined') return 'en';
      
      // Get browser language
      const browserLang = navigator.language;
      
      // Check if the language is supported (en, es, fr, pt-BR)
      const supportedLocales = ['en', 'es', 'fr', 'pt-BR'];
      const baseLocale = browserLang.split('-')[0];
      
      // Special case for Portuguese
      if (browserLang.toLowerCase() === 'pt-br') {
        return 'pt-BR';
      }
      
      // Check if the base locale is supported
      if (supportedLocales.includes(baseLocale)) {
        return baseLocale;
      }
      
      // Default to English
      return 'en';
    };
    
    setState(prev => ({
      ...prev,
      locale: detectBrowserLocale()
    }));
  }, []);
  
  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          // Get user profile and preferences
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }

          // Extract user preferences from profile
          const userLocale = profile?.locale || state.locale;

          setState({
            user: session.user,
            session,
            isLoading: false,
            isAuthenticated: true,
            error: null,
            locale: userLocale
          });
        } else {
          setState({
            ...initialState,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          ...initialState,
          isLoading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase auth event: ${event}`);
      
      if (session) {
        // Get user profile and preferences on auth change
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        // Extract user preferences from profile
        const userLocale = profile?.locale || state.locale;

        setState({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          locale: userLocale
        });
      } else {
        setState({
          ...initialState,
          isLoading: false,
          locale: state.locale // Preserve locale on logout
        });
      }
    });

    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [state.locale]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string, remember: boolean = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        isLoading: false,
        isAuthenticated: true,
        error: null
      }));
      
      // Navigate to dashboard with the user's preferred locale
      router.push(`/${state.locale}/dashboard`);
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Provide more specific user-friendly error messages
      let errorMessage = 'Failed to sign in';
      
      if (error instanceof AuthError) {
        if (error.message.includes('credentials')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'No account found with this email address.';
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [router, state.locale]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              locale: state.locale,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      setState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        isLoading: false,
        isAuthenticated: !!data.session, // Only authenticated if session exists
        error: null
      }));
      
      // If email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        router.push(`/${state.locale}/auth/check-email?type=confirm`);
      } else {
        // If confirmed immediately, go to onboarding
        router.push(`/${state.locale}/auth/onboarding`);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Provide more specific user-friendly error messages
      let errorMessage = 'Failed to create account';
      
      if (error instanceof AuthError) {
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Try signing in instead.';
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [router, state.locale]);
  
  // Sign out
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setState({
        ...initialState,
        isLoading: false,
        locale: state.locale // Preserve locale on logout
      });
      
      // Navigate to home page with the user's current locale
      router.push(`/${state.locale}`);
    } catch (error) {
      console.error('Sign out error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign out'
      }));
    }
  }, [router, state.locale]);
  
  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${state.locale}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      // No state updates needed here since we're redirecting to Google
      // Auth state will be updated when the user returns via the callback
    } catch (error) {
      console.error('Google sign in error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign in with Google'
      }));
    }
  }, [state.locale]);
  
  // Sign in with Microsoft
  const signInWithMicrosoft = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/${state.locale}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      // No state updates needed here since we're redirecting to Microsoft
      // Auth state will be updated when the user returns via the callback
    } catch (error) {
      console.error('Microsoft sign in error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign in with Microsoft'
      }));
    }
  }, [state.locale]);
  
  // Reset password (forgot password flow)
  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${state.locale}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Success is handled by the UI component
    } catch (error) {
      console.error('Reset password error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send reset password email',
      }));
    }
  }, [state.locale]);
  
  // Confirm password reset with token and new password
  const confirmPasswordReset = useCallback(async (token: string, newPassword: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Use the token from the URL to complete the password reset
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Success is handled by the UI component
    } catch (error) {
      console.error('Confirm password reset error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      }));
    }
  }, []);
  
  // Complete onboarding process
  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (!state.user) {
        throw new Error('User not authenticated');
      }
      
      // Save onboarding data to the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          role: data.role,
          team_size: data.teamSize,
          focus_areas: data.focusAreas,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id);
      
      if (error) throw error;
      
      // If sample project was requested, create it
      if (data.sampleProject) {
        // Add sample project creation logic here
        console.log('Creating sample project for user');
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Navigate to dashboard with the user's preferred locale
      router.push(`/${state.locale}/dashboard`);
    } catch (error) {
      console.error('Onboarding completion error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding',
      }));
    }
  }, [state.user, router, state.locale]);
  
  // Set user locale and save to profile
  const setUserLocale = useCallback(async (locale: string) => {
    setState(prev => ({ ...prev, locale }));
    
    // If user is authenticated, save locale preference to profile
    if (state.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            locale,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.user.id);
          
        if (error) {
          console.error('Error updating locale preference:', error);
        }
      } catch (error) {
        console.error('Failed to update locale preference:', error);
      }
    }
  }, [state.user]);
  
  // Clear any auth error messages
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  // Provide the auth context to children
  return (
    <UnifiedAuthContext.Provider
      value={{
        user: state.user,
        session: state.session,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        error: state.error,
        locale: state.locale,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithMicrosoft,
        resetPassword,
        confirmPasswordReset,
        completeOnboarding,
        setUserLocale,
        clearErrors
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// Custom hook for using the unified auth context
export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  
  return context;
}
