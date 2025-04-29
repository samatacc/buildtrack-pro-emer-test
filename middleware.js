import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

/**
 * BuildTrack Pro Internationalization Middleware
 * This middleware handles locale detection and routing for next-intl
 * Uses configuration from src/i18n/routing.js
 */

export default createMiddleware(routing);

export const config = {
  // Skip all paths that should not be internationalized
  matcher: [
    // Match all pathnames except for
    // - static assets (e.g. /favicon.ico)
    // - api routes
    // - Next.js internals
    '/((?!api|_next|images|favicon\.ico).*)'
  ]
};
