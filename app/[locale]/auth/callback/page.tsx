'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';

/**
 * OAuth Callback Handler
 * 
 * This component handles redirects from OAuth providers (Google, Microsoft)
 * and processes the authentication code, then redirects to the appropriate page.
 * 
 * The flow is:
 * 1. User clicks OAuth login button
 * 2. User authenticates with provider
 * 3. Provider redirects back to this page with auth code
 * 4. This page processes the code and redirects to dashboard or onboarding
 */
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for error params from OAuth provider
    const errorDescription = searchParams.get('error_description');
    if (errorDescription) {
      setError(errorDescription);
      return;
    }
    
    // Get the locale from the URL path
    const getLocaleFromPath = () => {
      const path = window.location.pathname;
      const localeMatch = path.match(/\/([^\/]+)\/auth\/callback/);
      return localeMatch ? localeMatch[1] : 'en';
    };
    
    const locale = getLocaleFromPath();
    
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // The hash fragment contains the access token, etc.
        // Supabase Auth will automatically extract these
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Check if this is a new user (first sign-in) or returning user
        if (data.session) {
          // Check if the user profile exists and is complete
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }
          
          // If user has not completed onboarding or profile doesn't exist
          if (!profile || profile.onboarding_completed !== true) {
            // Redirect to onboarding
            router.push(`/${locale}/auth/onboarding`);
          } else {
            // Redirect to dashboard
            router.push(`/${locale}/dashboard`);
          }
        } else {
          // No session - redirect to login
          router.push(`/${locale}/auth/login`);
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setError('Something went wrong. Please try signing in again.');
      }
    };
    
    handleCallback();
  }, [router, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-[rgb(24,62,105)]">
            {error ? 'Authentication Error' : 'Processing Login...'}
          </h2>
          
          {error ? (
            <div className="mt-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(24,62,105)] hover:bg-[rgb(19,50,86)]"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(236,107,44)]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
