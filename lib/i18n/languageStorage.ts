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
  try {
    // In a real implementation, this would update the user profile in the database
    // This is a placeholder for the actual implementation
    console.log(`Syncing language ${locale} for user ${userId}`);
    
    // For now, just update the cookie
    saveLanguagePreference(locale);
    
    return true;
  } catch (error) {
    console.error('Error syncing language with profile:', error);
    return false;
  }
}
