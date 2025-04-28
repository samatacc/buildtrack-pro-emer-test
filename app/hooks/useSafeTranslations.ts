'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Define explicit interfaces for translation functions and hook returns

/**
 * Translation function interface
 * This matches the expected signature in components using WithTranslationsProps
 */
export interface TranslationFunction {
  (key: string, params?: Record<string, any>): string;
}

/**
 * Translation hook return interface
 * Ensures all components using this hook get properly typed returns
 */
export interface TranslationsHookReturn {
  t: TranslationFunction;
  changeLocale: (locale: string) => void;
  getCurrentLocale: () => string;
}

// List of supported locales for type safety
export type SupportedLocale = 'en' | 'es' | 'fr' | 'pt-BR';

/**
 * Enhanced useTranslations hook with error handling
 *
 * Extends the next-intl useTranslations hook with error handling to prevent
 * missing translations from causing render failures. This helps ensure a robust
 * user experience even if translation keys are missing.
 *
 * This hook provides:
 * - Safe access to translations via the enhanced `t` function
 * - Fallback behavior for missing translation keys
 * - Methods to change the current locale
 * - Access to the current locale
 */
export function useSafeTranslations(namespace: string = 'common'): TranslationsHookReturn {
  let nextIntl: any = {};
  
  try {
    nextIntl = useNextIntlTranslations(namespace);
  } catch (error) {
    console.warn(`Failed to initialize translations for namespace: ${namespace}`, error);
    // Will use fallback mechanisms below
  }
  
  const router = useRouter();
  const pathname = usePathname();

  // Get the current locale from the pathname
  const getCurrentLocale = useCallback((): string => {
    try {
      const localeMatch = pathname.match(/^\/(en|es|fr|pt-BR)($|\/)/);
      return localeMatch ? localeMatch[1] as SupportedLocale : 'en';
    } catch (error) {
      console.warn('Error determining current locale', error);
      return 'en';
    }
  }, [pathname]);

  // Enhanced translation function with error handling
  const t: TranslationFunction = (key: string, params?: Record<string, any>): string => {
    if (!key) return '';
    
    try {
      if (typeof nextIntl === 'function') {
        return nextIntl(key, params) || key.split('.').pop() || key;
      }
    } catch (error) {
      // Log warning but don't crash the UI
      console.warn(`Translation key not found: ${namespace}.${key}`);
    }

    // Return a reasonable fallback - the key name itself
    return params?.fallback || key.split('.').pop() || key;
  };

  // Change the current locale
  const changeLocale = useCallback(
    (locale: string): void => {
      try {
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
      } catch (error) {
        console.warn('Error changing locale:', error);
      }
    },
    [getCurrentLocale, pathname, router],
  );

  return {
    t,
    changeLocale,
    getCurrentLocale, // Return the function instead of its result
  };
}
