/**
 * BuildTrack Pro Internationalization Configuration
 * This file configures next-intl for the App Router setup
 */

export const locales = ['en', 'es', 'fr', 'pt-BR'];
export const defaultLocale = 'en';

// List of available translation namespaces in the application
export const namespaces = [
  'common', 'auth', 'dashboard', 'profile', 'projects',
  'tasks', 'materials', 'documents', 'reports', 'settings',
  'admin', 'marketing', 'errors', 'notifications'
];

/**
 * Load translations for a specific namespace
 * 
 * @param {string} locale - The locale to load translations for
 * @param {string} namespace - The namespace to load
 * @returns {Promise<object>} - The loaded translation messages
 */
export async function loadNamespaceMessages(locale, namespace) {
  try {
    // Ensure we're using a valid locale and namespace
    const validLocale = locales.includes(locale) ? locale : defaultLocale;
    
    // Dynamically import the messages for the given locale
    const messages = await import(`./messages/${validLocale}.json`)
      .then(module => module.default || {})
      .catch(() => ({}));
    
    // Return only the translations for the requested namespace
    return messages[namespace] || {};
  } catch (error) {
    console.error(`[i18n] Error loading namespace ${namespace} for locale ${locale}:`, error);
    return {};
  }
}

// This is the configuration object that next-intl uses in the App Router
export default {
  locales,
  defaultLocale,
  localeDetection: true,
  // Optional: Define date, number, and other formatting options here
  formats: {
    dateTime: {
      short: {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
      medium: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
      long: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
    },
    number: {
      currency: {
        style: 'currency',
        currency: 'USD',
      },
      percent: {
        style: 'percent',
      },
    },
  },
};
