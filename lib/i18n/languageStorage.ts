'use client';

import { LANGUAGE_COOKIE_KEY } from './utils';
import Cookies from 'js-cookie';

/**
 * BuildTrack Pro - Language Storage Utilities
 * 
 * This module handles storing and retrieving language preferences
 * using cookies and eventually syncing with user profiles when authenticated.
 * 
 * These utilities follow BuildTrack Pro's principles of user-centric design
 * and maintain consistency across all devices, especially important for 
 * mobile users in construction environments.
 */

/**
 * Set user's language preference in cookie 
 * 
 * @param locale The locale code to save (e.g., 'en', 'pt-BR')
 * @param expires Optional expiration in days (default: 365 days)
 */
export function saveLanguagePreference(locale: string, expires = 365) {
  try {
    // Save to cookie with path='/' to work across all routes
    Cookies.set(LANGUAGE_COOKIE_KEY, locale, { 
      expires, 
      path: '/',
      sameSite: 'lax',
      // secure: process.env.NODE_ENV === 'production' // Uncomment in production
    });
    
    return true;
  } catch (error) {
    console.error('Error saving language preference:', error);
    return false;
  }
}

/**
 * Get user's language preference from cookie
 * 
 * @returns The stored locale or null if not found
 */
export function getLanguagePreference(): string | null {
  try {
    return Cookies.get(LANGUAGE_COOKIE_KEY) || null;
  } catch (error) {
    console.error('Error getting language preference:', error);
    return null;
  }
}

/**
 * Clear language preference cookie
 */
export function clearLanguagePreference() {
  try {
    Cookies.remove(LANGUAGE_COOKIE_KEY, { path: '/' });
    return true;
  } catch (error) {
    console.error('Error clearing language preference:', error);
    return false;
  }
}

/**
 * Sync language preference with user profile
 * 
 * This will be called after authentication to ensure
 * the user's language preference is consistent across devices.
 * 
 * @param userId The user ID
 * @param locale The locale to sync
 */
export async function syncLanguageWithProfile(userId: string, locale: string) {
  if (!userId || !locale) {
    console.error('Missing userId or locale for sync');
    return false;
  }
  
  try {
    // Call the language preference API to update user profile
    const response = await fetch('/api/profiles/language', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locale })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update language preference');
    }
    
    console.log(`Language preference ${locale} synced with user profile ${userId}`);
    return true;
  } catch (error) {
    console.error('Error syncing language preference with profile:', error);
    return false;
  }
}

/**
 * Fetch user's language preference from profile
 * 
 * @returns Promise resolving to the user's preferred locale or null if not found/authenticated
 */
export async function fetchProfileLanguage(): Promise<string | null> {
  try {
    // Call the language preference API to get user preference
    const response = await fetch('/api/profiles/language', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      // If unauthorized or other error, return null (will use cookie or browser default)
      return null;
    }
    
    const data = await response.json();
    return data.locale || null;
  } catch (error) {
    console.error('Error fetching language preference from profile:', error);
    return null;
  }
}

/**
 * Get the best language for the user
 * Priorities:
 * 1. Authenticated user profile preference
 * 2. Stored cookie preference
 * 3. Browser language (if supported)
 * 4. Default 'en'
 */
export async function getBestLanguage(): Promise<string> {
  try {
    // Try to get language from profile if authenticated
    const profileLanguage = await fetchProfileLanguage();
    if (profileLanguage) {
      // Save to cookie for consistency
      saveLanguagePreference(profileLanguage);
      return profileLanguage;
    }
    
    // Try to get from cookie
    const cookieLanguage = getLanguagePreference();
    if (cookieLanguage) {
      return cookieLanguage;
    }
    
    // Detect browser language
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language;
      
      // Check if the language is supported (en, es, fr, pt-BR)
      const supportedLocales = ['en', 'es', 'fr', 'pt-BR'];
      
      // Special case for Portuguese
      if (browserLang.toLowerCase() === 'pt-br') {
        saveLanguagePreference('pt-BR');
        return 'pt-BR';
      }
      
      // Check if the base locale is supported
      const baseLocale = browserLang.split('-')[0];
      if (supportedLocales.includes(baseLocale)) {
        saveLanguagePreference(baseLocale);
        return baseLocale;
      }
    }
    
    // Default to English
    return 'en';
  } catch (error) {
    console.error('Error determining best language:', error);
    return 'en';
  }
}
