'use client';

import { useEffect } from 'react';
import { useProfile } from './useProfile';
import { useTranslations } from './useTranslations';
import { useQueryClient } from '@tanstack/react-query';
import { profileKeys } from './useProfile';

/**
 * useProfileLanguageSync
 * 
 * Custom hook for synchronizing the user's language preference between
 * the profile settings and the UI.
 * 
 * Following BuildTrack Pro's mobile-first approach, this hook ensures that
 * language changes are applied consistently across the application, with
 * optimizations for mobile performance in construction field environments.
 */
export function useProfileLanguageSync() {
  const { profile, isLoading } = useProfile();
  const { changeLocale, currentLocale } = useTranslations();
  const queryClient = useQueryClient();
  
  // Sync language from profile to UI when profile loads
  useEffect(() => {
    if (!isLoading && profile && profile.language) {
      // Only change locale if it's different from current
      if (profile.language !== currentLocale) {
        console.log(`Syncing language from profile (${profile.language}) to UI`);
        changeLocale(profile.language);
      }
    }
  }, [profile?.language, isLoading, changeLocale, currentLocale]);
  
  // Invalidate relevant queries when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language changed, invalidating relevant queries');
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    };
    
    window.addEventListener('languagechange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [queryClient]);
  
  // Sync language preference with device
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLocale = navigator.language.split('-')[0]; // Get primary language code
      
      // If user has no preference set and browser language is supported,
      // we could suggest it (for now just log it)
      if (!profile?.language && ['en', 'es', 'fr'].includes(browserLocale)) {
        console.log(`Detected browser language: ${browserLocale}`);
      }
    }
  }, [profile]);
  
  return {
    // This hook is primarily for side effects,
    // but we can expose some useful data
    currentLanguage: profile?.language || currentLocale,
    isLoading,
  };
}
