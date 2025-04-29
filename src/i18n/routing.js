/**
 * BuildTrack Pro i18n Routing Configuration
 * Defines the supported locales and default locale for internationalization
 */

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'pt-BR'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
