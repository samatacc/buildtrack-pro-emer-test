'use client';

import { locales, defaultLocale, localeNames, localeFlags } from '../../i18n';
import { cookies } from 'next/headers';

// This hybrid module is designed to support both client and server components
// Some functions will be marked with client-only or server-only comments

/**
 * BuildTrack Pro - Internationalization Utilities (Client Side)
 * 
 * This module provides standardized internationalization utilities for client components
 * following BuildTrack Pro's mobile-first approach and design principles:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Accessibility standards (WCAG 2.1 AA)
 */

// Language preference key in cookies - shared between client and server utils
export const LANGUAGE_COOKIE_KEY = 'buildtrack-language';

/**
 * Get a user's preferred language with fallback chain (client-side version)
 * 
 * Priority:
 * 1. User profile setting (if authenticated)
 * 2. From browser (navigator.language)
 * 3. Default locale (en)
 * 
 * @param userProfile Optional user profile with language preference
 * @returns The detected preferred locale code
 */
export function getPreferredLanguage(
  userProfile?: { language?: string } | null
): string {
  try {
    // 1. Try user profile (highest priority when authenticated)
    if (userProfile?.language && locales.includes(userProfile.language)) {
      return userProfile.language;
    }

    // 2. Try browser language in client context
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language;
      
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

    // We already checked browser language in step 2 above
    // so no additional checks needed here
  } catch (error) {
    console.error('Error determining preferred language:', error);
  }

  // 4. Default to English
  return defaultLocale;
}

/**
 * Get the display name for a locale
 * 
 * @param locale The locale code
 * @returns The human-readable locale name
 */
export function getLocaleDisplayName(locale: string): string {
  return localeNames[locale as keyof typeof localeNames] || locale;
}

/**
 * Get the flag emoji for a locale
 * 
 * @param locale The locale code
 * @returns The flag emoji for the locale
 */
export function getLocaleFlag(locale: string): string {
  return localeFlags[locale as keyof typeof localeFlags] || '🌐';
}

/**
 * Format a URL with the correct locale
 * 
 * @param path The path without locale
 * @param locale The locale to use
 * @returns The path with locale prefix
 */
export function getLocalizedUrl(path: string, locale: string): string {
  // Remove any existing locale prefix if present
  const cleanPath = path.replace(/^\/[^/]+/, '');
  
  // Ensure the path starts with a slash
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  // Return the localized URL
  return `/${locale}${normalizedPath}`;
}

/**
 * Check if text needs to be scaled down on mobile
 * for specific languages that tend to have longer words
 * 
 * @param locale The current locale
 * @returns Boolean indicating if text should be scaled down
 */
export function needsTextScaling(locale: string): boolean {
  // Languages that typically have longer words/phrases
  const longTextLanguages = ['de', 'fr', 'pt-BR'];
  return longTextLanguages.includes(locale);
}

/**
 * Get direction (LTR/RTL) for a locale
 * This is a placeholder for future RTL language support
 * 
 * @param locale The locale code
 * @returns 'ltr' or 'rtl'
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  // Future RTL languages would be listed here
  const rtlLocales: string[] = [];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}
