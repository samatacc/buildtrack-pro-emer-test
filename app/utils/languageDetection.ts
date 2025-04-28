/**
 * Language Detection Utility
 * 
 * Provides intelligent language detection following a priority hierarchy:
 * 1. User profile preference (from Supabase)
 * 2. Cookie preference
 * 3. Browser language
 * 4. Geolocation-based detection
 * 5. Default to English
 * 
 * Follows BuildTrack Pro's mobile-first approach for performance optimization.
 */

import { locales, defaultLocale } from '@/i18n';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Gets the user's preferred language following the detection hierarchy.
 * @returns Promise resolving to the detected locale code
 */
export async function getPreferredLanguage(): Promise<string> {
  // Check user profile preference (highest priority)
  const userPreference = await getUserProfileLanguage();
  if (userPreference && locales.includes(userPreference)) {
    return userPreference;
  }
  
  // Check cookie preference
  const cookiePreference = getCookieLanguage();
  if (cookiePreference && locales.includes(cookiePreference)) {
    return cookiePreference;
  }
  
  // Check browser language
  const browserLanguage = getBrowserLanguage();
  if (browserLanguage && locales.includes(browserLanguage)) {
    return browserLanguage;
  }
  
  // Geolocation-based language detection could be implemented here
  // For now, we'll skip this step for performance reasons
  
  // Default to English
  return defaultLocale;
}

/**
 * Gets the language preference from the user's profile in Supabase.
 * @returns Promise resolving to the user's language preference or null
 */
async function getUserProfileLanguage(): Promise<string | null> {
  try {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Try to get language from user metadata first (fastest)
    if (user.user_metadata?.language) {
      return user.user_metadata.language;
    }
    
    // If not in metadata, try to get from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('language')
      .eq('id', user.id)
      .single();
    
    return profile?.language || null;
  } catch (error) {
    console.error('Error getting user profile language:', error);
    return null;
  }
}

/**
 * Gets the language preference from cookies.
 * @returns The language preference from cookies or null
 */
function getCookieLanguage(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie => cookie.trim().startsWith('NEXT_LOCALE='));
  
  if (localeCookie) {
    return localeCookie.split('=')[1].trim();
  }
  
  return null;
}

/**
 * Gets the language preference from browser settings.
 * @returns The language preference from browser or null
 */
function getBrowserLanguage(): string | null {
  if (typeof navigator === 'undefined') return null;
  
  // Try to get the full language with region code first
  const fullLang = navigator.language;
  if (locales.includes(fullLang)) {
    return fullLang;
  }
  
  // Try to match just the language part (e.g., 'en' from 'en-US')
  const langBase = fullLang.split('-')[0];
  
  // Find any matching locale that starts with the language base
  const matchingLocale = locales.find(locale => 
    locale === langBase || locale.startsWith(`${langBase}-`)
  );
  
  return matchingLocale || null;
}

/**
 * Sets the preferred language in a cookie.
 * @param locale The locale code to set
 */
export function setLanguageCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  
  // Set cookie to expire in 1 year
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  
  document.cookie = `NEXT_LOCALE=${locale}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}
