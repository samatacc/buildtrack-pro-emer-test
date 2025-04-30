'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useSupabaseAuth } from '../../lib/auth/SupabaseAuthContext';
import { useTranslations } from '../hooks/useTranslations';

/**
 * Localized Root Page
 * 
 * Redirects to the appropriate section based on user authentication status.
 * Authenticated users go to the dashboard, while unauthenticated users
 * go to the marketing page.
 * 
 * Following BuildTrack Pro's mobile-first approach with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)) design system.
 */
export default function LocalizedRootPage() {
  const { user, isLoading } = useSupabaseAuth();
  const { t } = useTranslations();
  
  useEffect(() => {
    // Wait until authentication state is determined
    if (isLoading) return;
    
    // Get current locale from URL path
    const locale = window.location.pathname.split('/')[1] || 'en';
    
    // Redirect based on authentication status using the current locale
    if (user) {
      window.location.href = `/${locale}/dashboard`;
    } else {
      window.location.href = `/${locale}/marketing`;
    }
  }, [user, isLoading]);
  
  // Display loading state while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-[rgb(24,62,105)] rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-[rgb(24,62,105)] rounded mb-2"></div>
          <div className="h-3 w-24 bg-[rgb(236,107,44)] rounded"></div>
        </div>
        <p className="mt-4 text-gray-600">{t('loading')}...</p>
      </div>
    </div>
  );
}