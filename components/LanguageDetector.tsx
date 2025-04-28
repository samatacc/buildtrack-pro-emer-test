'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { defaultLocale, locales } from '../i18n';
import { getLanguagePreference, saveLanguagePreference } from '../lib/i18n/languageStorage';
import { getLocalizedUrl } from '../lib/i18n/utils';

/**
 * BuildTrack Pro - Language Detector Component
 * 
 * This component intelligently detects the user's preferred language
 * and redirects them to the appropriate locale version if needed.
 * It follows BuildTrack Pro's user-centric approach by prioritizing:
 * 1. Previously saved language preference in cookies
 * 2. Browser language
 * 3. Default locale (en)
 * 
 * This component should be included in the root layout near the top.
 */
export default function LanguageDetector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  
  useEffect(() => {
    // Skip detection if we don't have router/pathname yet
    if (!router || !pathname) return;
    
    // Extract the current locale from the URL path if present
    // URL format is /{locale}/rest-of-path
    const urlLocale = pathname.split('/')[1];
    
    // Function to detect best language
    const detectBestLanguage = () => {
      // First check for saved preference
      const savedPreference = getLanguagePreference();
      if (savedPreference && locales.includes(savedPreference)) {
        return savedPreference;
      }
      
      // Then check browser language
      if (typeof window !== 'undefined') {
        const browserLang = navigator.language;
        if (browserLang) {
          // Check for exact match first
          if (locales.includes(browserLang)) {
            return browserLang;
          }
          
          // Check for language part match (e.g., 'en-US' should match 'en')
          const langPart = browserLang.split('-')[0];
          const matchedLocale = locales.find(locale => 
            locale === langPart || locale.startsWith(`${langPart}-`)
          );
          
          if (matchedLocale) {
            return matchedLocale;
          }
        }
      }
      
      // Default fallback
      return defaultLocale;
    };
    
    // Only run redirection logic if the current URL doesn't already have a valid locale
    if (!locales.includes(urlLocale)) {
      const bestLocale = detectBestLanguage();
      
      // Redirect to best locale version if it's different from current
      if (bestLocale && bestLocale !== currentLocale) {
        const newPath = getLocalizedUrl(pathname, bestLocale);
        router.replace(newPath, { scroll: false });
        
        // Save the detected preference
        saveLanguagePreference(bestLocale);
      }
    } else if (urlLocale) {
      // If the URL contains a valid locale, save it as preference
      saveLanguagePreference(urlLocale);
    }
  }, [pathname, router, currentLocale]);
  
  // This is a utility component with no UI
  return null;
}
