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

// Define the namespaces for more efficient loading
export const namespaces = [
  'common',    // Common UI elements, buttons, labels
  'auth',      // Authentication screens
  'profile',   // User profile related
  'dashboard', // Dashboard components
  'projects',  // Project management
  'marketing', // Marketing website
  'admin'      // Admin console
];

/**
 * Load messages for a specific namespace
 * This enables more efficient loading of translations
 */
export async function loadNamespaceMessages(locale: string, namespace: string) {
  try {
    // First try to load from namespace-specific file
    return (await import(`./messages/${locale}/${namespace}.json`)).default;
  } catch (error) {
    console.warn(`No separate namespace file for ${namespace} in ${locale}, falling back to combined file`);
    try {
      // Fall back to the combined file and extract the namespace
      const allMessages = (await import(`./messages/${locale}.json`)).default;
      return allMessages[namespace] || {};
    } catch (e) {
      console.error(`Failed to load translations for ${namespace} in ${locale}:`, e);
      return {};
    }
  }
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load all namespaces for server-side rendering
  const messages: Record<string, any> = {};
  
  try {
    // First try to load the combined file
    const combinedMessages = (await import(`./messages/${locale}.json`)).default;
    Object.assign(messages, combinedMessages);
  } catch (error) {
    console.warn(`No combined message file for ${locale}, loading namespaces individually`);
    
    // Load each namespace individually
    await Promise.all(
      namespaces.map(async (namespace) => {
        try {
          const namespaceMessages = await loadNamespaceMessages(locale, namespace);
          messages[namespace] = namespaceMessages;
        } catch (e) {
          console.error(`Failed to load ${namespace} for ${locale}:`, e);
        }
      })
    );
  }

  return {
    messages,
    locale // The locale is required
  };
});
