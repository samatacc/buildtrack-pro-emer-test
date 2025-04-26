'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function handleAuthCallback() {
      console.log('Auth callback handling started');
      
      try {
        // Check for URL parameters from OAuth provider
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authentication code received');
        }
        
        console.log('Authentication code received');
        
        // Exchange the code for a session (Supabase handles PKCE internally)
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
        if (error) {
          console.error('Exchange error:', error);
          throw error;
        }
        
        console.log('Authentication successful!');
        
        // Redirect to the dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    handleAuthCallback();
  }, [router]);
  
  // Show loading indicator or error message - using BuildTrack Pro color scheme
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center" style={{ color: 'rgb(24,62,105)' }}>
          {error ? 'Authentication Error' : 'Completing Sign In'}
        </h1>
        
        {error ? (
          <div className="p-4 mb-4 rounded-md" style={{ backgroundColor: 'rgba(236,107,44,0.1)', color: 'rgb(236,107,44)' }}>
            {error}
            <div className="mt-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'rgb(24,62,105)' }}
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" 
                 style={{ 
                   borderColor: 'rgb(236,107,44)', 
                   borderTopColor: 'transparent',
                   borderRightColor: 'transparent' 
                 }}>
              <span className="sr-only">Loading...</span>
            </div>
            <p className="text-gray-600">Finalizing your authentication...</p>
          </div>
        )}
      </div>
    </div>
  );
}
