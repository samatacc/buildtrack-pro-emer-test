'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

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
export function useSafeTranslations(namespace: string = 'common') {
  const nextIntl = useNextIntlTranslations(namespace);
  const router = useRouter();
  const pathname = usePathname();

  // Get the current locale from the pathname
  const getCurrentLocale = useCallback(() => {
    const localeMatch = pathname.match(/^\/(en|es|fr|pt-BR)($|\/)/);
    return localeMatch ? localeMatch[1] : 'en';
  }, [pathname]);

  // Enhanced translation function with error handling
  const t = (key: string, params?: Record<string, any>) => {
    try {
      return nextIntl(key, params);
    } catch (error) {
      // Log warning but don't crash the UI
      console.warn(`Translation key not found: ${namespace}.${key}`);

      // Return a reasonable fallback - the key name itself
      return key.split('.').pop() || key;
    }
  };

  // Change the current locale
  const changeLocale = useCallback(
    (locale: string) => {
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
    },
    [getCurrentLocale, pathname, router],
  );

  return {
    t,
    changeLocale,
    currentLocale: getCurrentLocale(),
  };
}
