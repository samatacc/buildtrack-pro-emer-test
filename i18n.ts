/**
 * BuildTrack Pro - Internationalization Configuration
 * 
 * This file configures the internationalization settings for the application,
 * supporting multiple languages for a diverse user base in construction environments.
 * This aligns with BuildTrack Pro's commitment to accessibility and inclusivity.
 */

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define supported locales
export const locales = ['en', 'es', 'fr', 'pt-BR'];
export const defaultLocale = 'en';

// Locale display names for language selector
export const localeNames = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'pt-BR': 'Português (Brasil)'
};

// Locale flags for visual identification
export const localeFlags = {
  'en': '🇺🇸',
  'es': '🇪🇸',
  'fr': '🇫🇷',
  'pt-BR': '🇧🇷'
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale: locale // Add the required locale property
  };
});
