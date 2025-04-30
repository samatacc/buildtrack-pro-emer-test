'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { defaultLocale, localeNames } from '../../i18n';

/**
 * Extended useTranslations hook
 * 
 * Extends the next-intl useTranslations hook with additional functionality
 * specific to BuildTrack Pro's internationalization needs.
 */
export function useTranslations(namespace: string = 'common') {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get the current locale from the pathname
  const getCurrentLocale = useCallback(() => {
    const localeMatch = pathname.match(/^\/(en|es|fr|pt-BR)($|\/)/);  
    return localeMatch ? localeMatch[1] : defaultLocale;
  }, [pathname]);
  
  // Current locale value for component use
  const currentLocale = useMemo(() => getCurrentLocale(), [getCurrentLocale]);
  
  // Simple translation function - in a real app would load from JSON files
  const t = useCallback((key: string, params?: Record<string, string>) => {
    // This is a simplified version - would normally use actual translations
    return key;
  }, [currentLocale]);
  
  // Change the current locale
  const changeLocale = useCallback((locale: string) => {
    // Set the locale cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
    
    // Determine the new pathname (with locale prefix)
    let newPathname = pathname;
    
    if (currentLocale === defaultLocale && !pathname.startsWith(`/${defaultLocale}`)) {
      // If we're on the default locale without prefix, add the new locale prefix
      newPathname = `/${locale}${pathname}`;
    } else {
      // Replace the current locale prefix with the new one
      newPathname = pathname.replace(/^\/(en|es|fr|pt-BR)/, `/${locale}`);
    }
    
    // Navigate to the new pathname
    router.push(newPathname);
  }, [pathname, router, currentLocale]);
  
  return {
    t,
    changeLocale,
    currentLocale,
  };
}
