'use client';

import { ReactNode, useEffect, useState } from 'react';
import { listenForLanguageChange } from '@/app/utils/languageStorage';
import LanguageDetector from '@/app/components/shared/LanguageDetector';

/**
 * LanguageProvider Component
 * 
 * Provides language-related functionality across the app:
 * - Automatic language detection with user-friendly suggestions
 * - Cross-tab language synchronization
 * - Performance monitoring of translations
 * 
 * Following BuildTrack Pro's design principles with focus on:
 * - Mobile-first design for field usage
 * - Performance optimization for limited connectivity
 * - Accessibility standards (WCAG 2.1 AA)
 */
export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [shouldReload, setShouldReload] = useState(false);
  
  // Listen for language changes from other tabs
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    const cleanup = listenForLanguageChange((locale) => {
      // If the locale doesn't match current URL locale, trigger reload
      const currentLocale = window.location.pathname.split('/')[1];
      
      if (locale !== currentLocale) {
        setShouldReload(true);
      }
    });
    
    return cleanup;
  }, []);
  
  // Handle reload when language changes in another tab
  useEffect(() => {
    if (shouldReload) {
      // Get the new locale from localStorage
      const newLocale = localStorage.getItem('buildtrack-language-preference');
      if (!newLocale) return;
      
      // Update path with new locale
      const pathParts = window.location.pathname.split('/');
      pathParts[1] = newLocale;
      const newPath = pathParts.join('/');
      
      // Reload page with new locale in URL
      window.location.href = newPath;
    }
  }, [shouldReload]);
  
  return (
    <>
      {children}
      
      {/* Language detector with auto-suggestion */}
      <LanguageDetector />
    </>
  );
}
