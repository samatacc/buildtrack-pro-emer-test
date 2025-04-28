'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
// Import the optimized translations hook if available, with fallback
let useOptimizedTranslations;
try {
  useOptimizedTranslations = require('./useOptimizedTranslations').useOptimizedTranslations;
} catch (e) {
  // Fall back to next-intl if the optimized hook is not available
  console.warn('Using basic translation system - optimized translations not available');
}

/**
 * Extended useTranslations hook
 * 
 * Extends the next-intl useTranslations hook with additional functionality
 * specific to BuildTrack Pro's internationalization needs.
 * 
 * This hook provides:
 * - Access to translations via the standard `t` function
 * - Methods to change the current locale
 * - Access to the current locale
 */
export function useTranslations(namespace: string = 'common') {
  const t = useNextIntlTranslations(namespace);
  const router = useRouter();
  const pathname = usePathname();
  
  // Get the current locale from the pathname
  const getCurrentLocale = useCallback(() => {
    const localeMatch = pathname.match(/^\/(en|es|fr)($|\/)/);
    return localeMatch ? localeMatch[1] : 'en';
  }, [pathname]);
  
  // Change the current locale
  const changeLocale = useCallback((locale: string) => {
    // Set the locale cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
    
    // Determine the new pathname (with locale prefix)
    let newPathname = pathname;
    const currentLocale = getCurrentLocale();
    
    if (currentLocale === 'en' && !pathname.startsWith('/en')) {
      // If we're on the default locale without prefix, add the new locale prefix
      newPathname = `/${locale}${pathname}`;
    } else {
      // Replace the current locale with the new one
      newPathname = pathname.replace(`/${currentLocale}`, `/${locale}`);
    }
    
    // Navigate to the new pathname
    router.push(newPathname);
    router.refresh();
  }, [getCurrentLocale, pathname, router]);
  
  return {
    t,
    changeLocale,
    currentLocale: getCurrentLocale(),
  };
}
