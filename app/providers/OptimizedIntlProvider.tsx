/**
 * Optimized Internationalization Provider
 *
 * Enhanced version of the IntlProvider that implements performance optimizations:
 * - Dynamic loading of translations by namespace
 * - Lazy loading of non-critical translations
 * - Translation caching
 * - Route-based preloading
 *
 * Following BuildTrack Pro's mobile-first approach for better performance on all devices.
 */
'use client';

import React, { createContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  preloadCriticalTranslations,
  preloadRouteTranslations,
  loadNamespaceTranslations,
  getTranslationCacheStats,
} from '../utils/translationLoader';

// Context to allow components to request additional namespaces
interface OptimizedIntlContextType {
  loadNamespace: (namespace: string) => Promise<void>;
  isCriticalLoaded: boolean;
  isRouteLoaded: boolean;
  currentLocale: string;
  translationStats: ReturnType<typeof getTranslationCacheStats>;
}

export const OptimizedIntlContext = createContext<OptimizedIntlContextType>({
  loadNamespace: async () => {},
  isCriticalLoaded: false,
  isRouteLoaded: false,
  currentLocale: 'en',
  translationStats: { cacheSize: 0, cachedLocales: [], cachedNamespaces: [] },
});

interface OptimizedIntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}

export function OptimizedIntlProvider({
  children,
  locale,
  messages,
}: OptimizedIntlProviderProps) {
  const pathname = usePathname();

  // Track loading states
  const [isCriticalLoaded, setIsCriticalLoaded] = useState(false);
  const [isRouteLoaded, setIsRouteLoaded] = useState(false);
  const [mergedMessages, setMergedMessages] = useState(messages);
  const [translationStats, setTranslationStats] = useState(
    getTranslationCacheStats(),
  );

  // Load critical translations immediately
  useEffect(() => {
    async function loadCritical() {
      await preloadCriticalTranslations(locale);
      setIsCriticalLoaded(true);
      setTranslationStats(getTranslationCacheStats());
    }

    loadCritical();
  }, [locale]);

  // Load route-specific translations when the route changes
  useEffect(() => {
    if (!pathname) return;

    async function loadRouteSpecific() {
      await preloadRouteTranslations(locale, pathname);
      setIsRouteLoaded(true);
      setTranslationStats(getTranslationCacheStats());
    }

    setIsRouteLoaded(false);
    loadRouteSpecific();
  }, [pathname, locale]);

  // Function to load additional namespaces as needed
  const loadNamespace = async (_namespace: string) => {
    const namespaceMessages = await loadNamespaceTranslations(
      locale,
      _namespace,
    );

    // Merge new namespace into our messages
    setMergedMessages((prevMessages) => ({
      ...prevMessages,
      [_namespace]: {
        ...prevMessages[_namespace],
        ...namespaceMessages,
      },
    }));

    setTranslationStats(getTranslationCacheStats());
  };

  // Context value
  const contextValue: OptimizedIntlContextType = {
    loadNamespace,
    isCriticalLoaded,
    isRouteLoaded,
    currentLocale: locale,
    translationStats,
  };

  return (
    <OptimizedIntlContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={mergedMessages}>
        {children}
      </NextIntlClientProvider>
    </OptimizedIntlContext.Provider>
  );
}
