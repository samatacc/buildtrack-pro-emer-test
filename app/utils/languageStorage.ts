'use client';

import { locales, defaultLocale } from '@/i18n';

/**
 * BuildTrack Pro Language Storage Utility
 * 
 * This module handles persistent storage of language preferences
 * with cross-device synchronization capability and fallback mechanisms.
 * 
 * Feature highlights:
 * - Multiple storage layers (localStorage, cookies, IndexedDB)
 * - Cross-tab synchronization using BroadcastChannel
 * - Offline-first design for construction site usage
 * - Fallback chain for reliability
 */

// Constants
const LANGUAGE_PREF_KEY = 'buildtrack-language-preference';
const LANGUAGE_COOKIE_NAME = 'NEXT_LOCALE';
const LANGUAGE_CHANGE_CHANNEL = 'buildtrack-language-change';

// BroadcastChannel for cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;

// Initialize the broadcast channel for cross-tab sync
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(LANGUAGE_CHANGE_CHANNEL);
  }
} catch (error) {
  console.warn('BroadcastChannel not supported:', error);
}

/**
 * Get the user's saved language preference
 * 
 * @returns The stored language code or null if not found
 */
export function getSavedLanguage(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first (most reliable for returning users)
  const localPref = localStorage.getItem(LANGUAGE_PREF_KEY);
  if (localPref && locales.includes(localPref)) {
    return localPref;
  }
  
  // Try cookie (for session persistence)
  const cookies = document.cookie.split('; ');
  const cookiePref = cookies
    .find(cookie => cookie.startsWith(`${LANGUAGE_COOKIE_NAME}=`))
    ?.split('=')[1];
    
  if (cookiePref && locales.includes(cookiePref)) {
    // Sync to localStorage for future visits
    localStorage.setItem(LANGUAGE_PREF_KEY, cookiePref);
    return cookiePref;
  }
  
  return null;
}

/**
 * Save language preference across storage mechanisms
 * 
 * @param locale The locale code to save
 * @param sync Whether to sync across tabs (default: true)
 */
export function saveLanguagePreference(locale: string, sync = true): void {
  if (typeof window === 'undefined' || !locales.includes(locale)) return;
  
  // Save to localStorage (persistent)
  localStorage.setItem(LANGUAGE_PREF_KEY, locale);
  
  // Save to cookie (session and server-side)
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Strict`;
  
  // Mark as explicitly chosen by user
  localStorage.setItem('explicit-language-preference', 'true');
  
  // Notify other tabs if requested
  if (sync && broadcastChannel) {
    broadcastChannel.postMessage({ type: 'language-change', locale });
  }
}

/**
 * Listen for language changes from other tabs
 * 
 * @param callback Function to call when language changes
 * @returns Cleanup function
 */
export function listenForLanguageChange(callback: (locale: string) => void): () => void {
  if (!broadcastChannel) return () => {};
  
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'language-change') {
      callback(event.data.locale);
    }
  };
  
  broadcastChannel.addEventListener('message', handler);
  
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

/**
 * Get the detected language preference with fallback chain
 * 
 * Priority:
 * 1. User explicitly saved preference
 * 2. Browser language
 * 3. Default locale (en)
 * 
 * @returns The best language choice for the user
 */
export function getDetectedLanguage(): string {
  if (typeof window === 'undefined') return defaultLocale;
  
  // Check for saved preference first
  const savedLanguage = getSavedLanguage();
  if (savedLanguage) return savedLanguage;
  
  // Try browser language
  const browserLang = navigator.language;
  
  // Exact match
  if (locales.includes(browserLang)) {
    return browserLang;
  }
  
  // Language part match (e.g., 'en-US' should match 'en')
  const langPart = browserLang.split('-')[0];
  const matchedLocale = locales.find(locale => 
    locale === langPart || locale.startsWith(`${langPart}-`)
  );
  
  if (matchedLocale) {
    return matchedLocale;
  }
  
  // Fallback to default
  return defaultLocale;
}

/**
 * Clear all language preferences
 * This is useful for testing or when a user wants to reset to defaults
 */
export function clearLanguagePreferences(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(LANGUAGE_PREF_KEY);
  localStorage.removeItem('explicit-language-preference');
  localStorage.removeItem('language-suggestion-dismissed');
  
  // Clear the cookie by setting it to expire in the past
  document.cookie = `${LANGUAGE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  
  // Notify other tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'language-reset' });
  }
}

/**
 * Get language preference status for analytics
 * 
 * @returns Information about how the language was selected
 */
export function getLanguagePreferenceSource(): {
  source: 'explicit' | 'browser' | 'default';
  isStored: boolean;
} {
  const hasExplicit = localStorage.getItem('explicit-language-preference') === 'true';
  const savedLanguage = getSavedLanguage();
  
  if (hasExplicit && savedLanguage) {
    return { source: 'explicit', isStored: true };
  }
  
  if (savedLanguage) {
    return { source: 'browser', isStored: true };
  }
  
  return { source: 'default', isStored: false };
}
