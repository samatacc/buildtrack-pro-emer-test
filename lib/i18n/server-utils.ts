import { cookies } from 'next/headers';
import { locales, defaultLocale } from '../../i18n';
import { LANGUAGE_COOKIE_KEY } from './utils';

/**
 * BuildTrack Pro - Internationalization Server Utilities
 * 
 * This module provides server-side internationalization utilities
 * following BuildTrack Pro's design principles and architecture.
 */

/**
 * Get the user's preferred language from server-side cookies
 * 
 * @returns The stored locale or null if not found
 */
export function getLanguageFromCookies(): string | null {
  try {
    return cookies().get(LANGUAGE_COOKIE_KEY)?.value || null;
  } catch (error) {
    console.error('Error getting language from cookies:', error);
    return null;
  }
}

/**
 * Get a user's preferred language with fallback chain (server-side version)
 * 
 * Priority:
 * 1. User profile setting (if authenticated)
 * 2. Cookie (server-side access)
 * 3. Default locale (en)
 * 
 * @param userProfile Optional user profile with language preference
 * @returns The detected preferred locale code
 */
export function getServerPreferredLanguage(
  userProfile?: { language?: string } | null
): string {
  try {
    // 1. Try user profile (highest priority when authenticated)
    if (userProfile?.language && locales.includes(userProfile.language)) {
      return userProfile.language;
    }

    // 2. Try cookie (server-side access)
    const languageCookie = getLanguageFromCookies();
    if (languageCookie && locales.includes(languageCookie)) {
      return languageCookie;
    }
  } catch (error) {
    console.error('Error determining server preferred language:', error);
  }

  // 3. Default to English
  return defaultLocale;
}

/**
 * Sets a language cookie from server components
 * 
 * @param locale The locale to set
 * @param options Optional cookie options
 */
export function setLanguageCookie(
  locale: string,
  options: { maxAge?: number; path?: string } = {}
): void {
  if (!locales.includes(locale)) {
    console.warn(`Locale ${locale} is not supported`);
    return;
  }

  const { maxAge = 31536000, path = '/' } = options; // Default 1 year expiry
  
  cookies().set({
    name: LANGUAGE_COOKIE_KEY,
    value: locale,
    maxAge,
    path,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
