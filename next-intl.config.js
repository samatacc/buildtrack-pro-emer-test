/**
 * BuildTrack Pro next-intl Configuration File
 * This file configures internationalization settings for the application
 */

module.exports = {
  // List of all locales that are supported
  locales: ['en', 'es', 'fr', 'pt-BR'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Locales can be referred to in different ways
  localeMap: {
    'en-US': 'en',
    'en-GB': 'en',
    'es-ES': 'es',
    'es-MX': 'es',
    'fr-FR': 'fr',
    'pt-BR': 'pt-BR'
  },
  
  // Date and number formatting options
  formats: {
    dateTime: {
      short: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      },
      medium: {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      },
      long: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    },
    number: {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      percent: {
        style: 'percent'
      }
    }
  }
};
