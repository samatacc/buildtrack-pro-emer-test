'use client';

/**
 * User Preferences Hook
 *
 * This hook provides functionality to:
 * 1. Get user preferences from localStorage
 * 2. Update user preferences and persist to localStorage
 * 3. Sync preferences across tabs/windows
 *
 * Follows BuildTrack Pro's mobile-first approach by ensuring consistent
 * user experience across all devices and sessions.
 */
import { useState, useEffect } from 'react';
import { LOKALISE_CONFIG } from '../utils/lokaliseConfig';

// Define the structure of user preferences
export interface UserPreferences {
  locale?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  compactView?: boolean;
  // Add more preferences as needed
}

// Storage key for localStorage
const STORAGE_KEY = 'buildtrack_user_preferences';

// Initial default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  locale: undefined, // Initially undefined to allow language detection
  theme: 'system',
  notifications: true,
  compactView: false,
};

/**
 * Hook for managing user preferences with localStorage persistence
 */
export function useUserPreferences() {
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedPrefs = localStorage.getItem(STORAGE_KEY);
        if (storedPrefs) {
          const parsedPrefs = JSON.parse(storedPrefs);
          setUserPreferences((prev) => ({
            ...DEFAULT_PREFERENCES,
            ...parsedPrefs,
          }));
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Listen for storage events to sync preferences across tabs/windows
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const newPrefs = JSON.parse(event.newValue);
            setUserPreferences((prev) => ({
              ...prev,
              ...newPrefs,
            }));
          } catch (error) {
            console.error('Error parsing updated preferences:', error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  /**
   * Update user preferences and persist to localStorage
   */
  const updateUserPreferences = async (
    newPrefs: Partial<UserPreferences>,
  ): Promise<void> => {
    // Update state
    setUserPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving user preferences:', error);
        }
      }

      return updated;
    });

    // In a real app, you might also want to save to the server
    // This could be implemented here or in a separate effect
  };

  /**
   * Reset user preferences to defaults
   */
  const resetUserPreferences = async (): Promise<void> => {
    setUserPreferences(DEFAULT_PREFERENCES);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error resetting user preferences:', error);
      }
    }
  };

  /**
   * Get a specific preference value with type safety
   */
  const getPreference = <K extends keyof UserPreferences>(
    key: K,
  ): UserPreferences[K] => {
    return userPreferences[key];
  };

  return {
    userPreferences,
    updateUserPreferences,
    resetUserPreferences,
    getPreference,
    isLoaded,
  };
}
