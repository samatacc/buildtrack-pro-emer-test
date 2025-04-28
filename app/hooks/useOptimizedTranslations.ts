/**
 * Optimized Translations Hook
 *
 * Enhanced version of the translations hook that works with our optimized
 * translation loader system, providing better performance:
 * - Automatically loads namespaces on demand
 * - Handles fallbacks gracefully
 * - Supports interpolation and pluralization
 * - Caches translations for better performance
 *
 * Following BuildTrack Pro's mobile-first and accessibility principles
 * by ensuring fast, responsive translations on all devices.
 */
'use client';

import { useContext, useEffect, useState, useCallback } from 'react';
import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { OptimizedIntlContext } from '../providers/OptimizedIntlProvider';

interface UseOptimizedTranslationsOptions {
  fallbackToKey?: boolean;
  logMissing?: boolean;
}

/**
 * Hook for using translations with namespace-based optimization
 *
 * @param namespace The translation namespace to use
 * @param options Configuration options
 * @returns Object with translation functions and metadata
 */
export function useOptimizedTranslations(
  namespace: string,
  options: UseOptimizedTranslationsOptions = {},
) {
  const { loadNamespace, isCriticalLoaded, isRouteLoaded, currentLocale } =
    useContext(OptimizedIntlContext);

  const [isNamespaceLoaded, setIsNamespaceLoaded] = useState(false);
  // Define default options
  const defaultOptions = { fallbackToKey: true, logMissing: true };

  // Get base translations from next-intl
  const nextIntl = useNextIntlTranslations(namespace);

  // Load the namespace when the component mounts
  useEffect(() => {
    async function loadNamespaceData() {
      try {
        await loadNamespace(namespace);
        setIsNamespaceLoaded(true);
      } catch (error) {
        console.error(`Error loading namespace ${namespace}:`, error);
      }
    }

    if (!isNamespaceLoaded) {
      loadNamespaceData();
    }
  }, [namespace, loadNamespace, isNamespaceLoaded]);

  // Enhanced translation function with fallbacks and interpolation
  const translate = useCallback(
    (key: string, params?: Record<string, any>) => {
      const finalOptions = { ...defaultOptions, ...options };

      try {
        return nextIntl(key, params);
      } catch (error) {
        // Log missing translation if enabled
        if (finalOptions.logMissing) {
          console.warn(`Translation key not found: ${namespace}.${key}`);
        }

        // Provide fallback
        if (finalOptions.fallbackToKey) {
          // Use last part of key as fallback (e.g., "common.button.submit" → "submit")
          return key.split('.').pop() || key;
        }

        return key;
      }
    },
    [nextIntl, namespace, options, defaultOptions],
  );

  // Function to format dates using the current locale
  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === 'object' ? date : new Date(date);
      return dateObj.toLocaleDateString(currentLocale, options);
    },
    [currentLocale],
  );

  // Function to format numbers using the current locale
  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      return number.toLocaleString(currentLocale, options);
    },
    [currentLocale],
  );

  return {
    t: translate,
    formatDate,
    formatNumber,
    currentLocale,
    isReady: isNamespaceLoaded || isCriticalLoaded || isRouteLoaded,
  };
}
