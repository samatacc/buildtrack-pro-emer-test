/**
 * Lokalise Configuration for BuildTrack Pro
 * 
 * This file contains configuration settings for Lokalise integration.
 * The API key and project ID are stored in environment variables
 * for security and deployment flexibility.
 */
export const LOKALISE_CONFIG = {
  apiKey: process.env.LOKALISE_API_KEY,
  projectId: process.env.LOKALISE_PROJECT_ID,
  supportedLocales: ['en', 'es', 'fr', 'pt-BR'],
  defaultLocale: 'en'
};

/**
 * Get the display name for a locale
 * 
 * @param locale The locale code
 * @returns The human-readable name of the locale
 */
export function getLocaleDisplayName(locale: string): string {
  const displayNames: Record<string, string> = {
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'pt-BR': 'Português (Brasil)'
  };
  
  return displayNames[locale] || locale;
}

/**
 * Check if a locale is supported
 * 
 * @param locale The locale to check
 * @returns True if the locale is supported
 */
export function isLocaleSupported(locale: string): boolean {
  return LOKALISE_CONFIG.supportedLocales.includes(locale);
}
