'use client';

/**
 * Language Detection Hook
 *
 * This hook provides functionality to:
 * 1. Detect the user's browser language
 * 2. Check if it's one of our supported languages
 * 3. Return the appropriate locale to use
 *
 * Follows BuildTrack Pro's mobile-first approach and accessibility standards
 * by ensuring language preferences are properly detected on all devices.
 */
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isLocaleSupported, LOKALISE_CONFIG } from '../utils/lokaliseConfig';
import { useUserPreferences } from '@/app/hooks/useUserPreferences';

interface LanguageDetectionResult {
  detectedLocale: string;
  isSupported: boolean;
  currentLocale: string;
  suggestChange: boolean;
  applyDetectedLanguage: () => Promise<void>;
}

export function useLanguageDetection(): LanguageDetectionResult {
  const [detectedLocale, setDetectedLocale] = useState<string>(
    LOKALISE_CONFIG.defaultLocale,
  );
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [suggestChange, setSuggestChange] = useState<boolean>(false);

  const { userPreferences, updateUserPreferences } = useUserPreferences();
  const savedLocale = userPreferences.locale;

  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from the URL
  const currentLocale =
    pathname?.split('/')[1] || LOKALISE_CONFIG.defaultLocale;

  // Detect browser language on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get browser language
      let browserLocale = navigator.language;

      // Normalize locale format (e.g., convert 'en-US' to 'en')
      // Except for pt-BR which we want to keep as is since it's specifically supported
      if (browserLocale !== 'pt-BR' && browserLocale.includes('-')) {
        browserLocale = browserLocale.split('-')[0];
      }

      setDetectedLocale(browserLocale);
      const supported = isLocaleSupported(browserLocale);
      setIsSupported(supported);

      // If user has no saved preference, detected language is supported,
      // and current locale is different from detected, suggest change
      if (!savedLocale && supported && browserLocale !== currentLocale) {
        setSuggestChange(true);
      } else {
        setSuggestChange(false);
      }
    }
  }, [currentLocale, savedLocale]);

  /**
   * Apply the detected language and redirect the user
   */
  const applyDetectedLanguage = async (): Promise<void> => {
    if (isSupported) {
      // Save preference
      await updateUserPreferences({ locale: detectedLocale });

      // Redirect to the same page but with the detected locale
      const newPath = pathname?.replace(
        `/${currentLocale}`,
        `/${detectedLocale}`,
      );
      if (newPath) {
        router.push(newPath);
      }

      // Don't suggest again
      setSuggestChange(false);
    }
  };

  return {
    detectedLocale,
    isSupported,
    currentLocale,
    suggestChange,
    applyDetectedLanguage,
  };
}
