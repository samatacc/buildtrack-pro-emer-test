/**
 * BuildTrack Pro i18n Navigation Utilities
 * Provides navigation components with internationalization support
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname
} = createNavigation(routing);
