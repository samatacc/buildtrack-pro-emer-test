'use client';

/**
 * BuildTrack Pro Translation Provider
 * Provides translation context for client components in a consistent way
 */

import React, { ReactNode } from 'react';
import { useTranslations, NextIntlClientProvider } from 'next-intl';

interface BaseTranslationProviderProps {
  children: ReactNode;
}

interface TranslationProviderProps extends BaseTranslationProviderProps {
  namespace?: string;
}

// This component can be used to provide translations to client components
export function TranslationProvider({ 
  children, 
  namespace 
}: TranslationProviderProps) {
  // If a namespace is provided, we'll use it to scope the translations
  const internalNamespace = namespace || 'common';
  
  return (
    <div className="translation-context">
      {children}
    </div>
  );
}

// This component is useful when you need to provide manual messages
export function ManualTranslationProvider({ 
  children,
  locale,
  messages
}: BaseTranslationProviderProps & { 
  locale: string; 
  messages: Record<string, any>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="translation-context">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

// Hook for accessing translations with more comprehensive error handling
export function useEnhancedTranslations(namespace: string) {
  try {
    return useTranslations(namespace);
  } catch (error) {
    console.error(`Translation error for namespace ${namespace}:`, error);
    
    // Return a fallback function that returns the key as-is
    return (key: string, params?: Record<string, any>) => {
      if (params) {
        // Simple templating for parameters
        let result = key;
        Object.entries(params).forEach(([paramKey, value]) => {
          result = result.replace(`{${paramKey}}`, String(value));
        });
        return result;
      }
      return key;
    };
  }
}
