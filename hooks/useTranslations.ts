'use client';

import { useTranslations as useNextIntlTranslations, useLocale } from 'next-intl';
import { useCallback } from 'react';

/**
 * Types for translation parameters and options
 */
type TranslationValues = Record<string, string | number>;

interface TranslationOptions {
  fallback?: string;
  values?: TranslationValues;
  formats?: Record<string, any>;
  defaultNamespace?: string;
  [key: string]: any; // Add index signature to fix type error with next-intl
}

/**
 * Enhanced custom hook for accessing translations
 * 
 * This wrapper around next-intl's useTranslations provides consistent
 * translation access across the BuildTrack Pro application with:
 * - Graceful fallbacks to English
 * - Support for nested namespaces
 * - Consistent error handling
 * - Mobile-first performance optimizations
 * 
 * @param namespace - Optional namespace for translations (e.g., 'common', 'auth')
 * @returns Object with translation functions and helper utilities
 */
export function useTranslations(namespace?: string) {
  // Get the current locale for debugging purposes
  const locale = useLocale();
  
  // Cache the baseNamespace for better performance
  const baseNamespace = namespace || 'common';
  
  // Use next-intl's translation hook with specified namespace
  const baseT = useNextIntlTranslations(baseNamespace);
  
  /**
   * Main translation function with enhanced error handling and fallbacks
   */
  const t = useCallback((key: string, options?: TranslationOptions) => {
    try {
      // Try to get the translation from the specified namespace
      return baseT(key, options);
    } catch (error) {
      try {
        // If missing in current namespace but a defaultNamespace is provided, try that
        if (options?.defaultNamespace && options.defaultNamespace !== baseNamespace) {
          const fallbackT = useNextIntlTranslations(options.defaultNamespace);
          return fallbackT(key, options);
        }
        throw error; // Re-throw if no defaultNamespace or same as current
      } catch (nestedError) {
        // Log only in development for better debugging
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `Translation missing: '${key}' in namespace '${baseNamespace}',`,
            options?.defaultNamespace ? ` and in fallback namespace '${options.defaultNamespace}'` : '',
            `for locale '${locale}'`
          );
        }
        // Return fallback or key as last resort
        return options?.fallback || key;
      }
    }
  }, [baseT, baseNamespace, locale]);
  
  /**
   * Helper to translate with a specific different namespace
   */
  const tWithNamespace = useCallback((specificNamespace: string, key: string, options?: TranslationOptions) => {
    try {
      const namespaceT = useNextIntlTranslations(specificNamespace);
      return namespaceT(key, options);
    } catch (error) {
      // Try the default fallback flow if specified namespace fails
      return t(key, { ...options, defaultNamespace: baseNamespace });
    }
  }, [t, baseNamespace]);
  
  /**
   * Check if a translation exists (useful for conditional rendering)
   */
  const hasTranslation = useCallback((key: string): boolean => {
    try {
      baseT(key);
      return true;
    } catch {
      return false;
    }
  }, [baseT]);
  
  return {
    t,
    tWithNamespace,
    hasTranslation,
    currentLocale: locale,
    currentNamespace: baseNamespace,
  };
}
