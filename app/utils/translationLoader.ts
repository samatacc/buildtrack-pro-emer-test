/**
 * Translation Loader Utility
 *
 * This utility provides optimized loading of translation resources
 * with techniques like:
 * - Dynamic imports
 * - Chunking by namespace
 * - Caching of loaded translations
 * - Priority loading of critical translations
 *
 * Following BuildTrack Pro's mobile-first approach and performance guidelines.
 */
// Import commented out until we implement Lokalise integration
// import { LOKALISE_CONFIG } from './lokaliseConfig';

// Define translation namespaces with priority information
interface NamespaceConfig {
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  routes?: string[]; // Specific routes where this namespace is used
}

// Organize translations into logical, loadable namespaces
export const TRANSLATION_NAMESPACES: NamespaceConfig[] = [
  { name: 'common', priority: 'critical' }, // Used everywhere
  { name: 'auth', priority: 'high' }, // Login/registration flows
  { name: 'profile', priority: 'medium' }, // User profiles
  { name: 'dashboard', priority: 'high' }, // Main dashboard
  { name: 'projects', priority: 'high' }, // Project management
  { name: 'tasks', priority: 'medium' }, // Task management
  { name: 'reports', priority: 'low' }, // Reports and analytics
  { name: 'settings', priority: 'low' }, // Application settings
  { name: 'notifications', priority: 'medium' }, // User notifications
  { name: 'marketing', priority: 'medium', routes: ['/'] }, // Landing pages
];

// In-memory cache for loaded translations
const translationCache: Record<string, Record<string, any>> = {};

/**
 * Load translations for a namespace and locale
 *
 * @param locale Locale to load translations for
 * @param namespace Translation namespace
 * @returns Promise resolving to the translations object
 */
export async function loadNamespaceTranslations(
  locale: string,
  namespace: string,
): Promise<Record<string, any>> {
  // Create a cache key
  const cacheKey = `${locale}:${namespace}`;

  // Return from cache if available
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    // Dynamic import to load only the required namespace
    // This will be code-split by webpack/parcel
    const allTranslations = await import(`../../messages/${locale}.json`);

    // Extract only the needed namespace
    const namespaceTranslations = allTranslations[namespace] || {};

    // Cache for future use
    translationCache[cacheKey] = namespaceTranslations;

    return namespaceTranslations;
  } catch (error) {
    console.error(
      `Error loading translations for ${locale}:${namespace}`,
      error,
    );

    // Return empty object on error
    return {};
  }
}

/**
 * Preload critical translations for a locale
 *
 * @param locale Locale to preload translations for
 * @returns Promise that resolves when critical translations are loaded
 */
export async function preloadCriticalTranslations(
  locale: string,
): Promise<void> {
  const criticalNamespaces = TRANSLATION_NAMESPACES.filter(
    (ns) => ns.priority === 'critical',
  );

  // Load all critical namespaces in parallel
  await Promise.all(
    criticalNamespaces.map((ns) => loadNamespaceTranslations(locale, ns.name)),
  );
}

/**
 * Preload translations for a specific route
 *
 * @param locale Locale to preload translations for
 * @param route Current route/path
 * @returns Promise that resolves when route-specific translations are loaded
 */
export async function preloadRouteTranslations(
  locale: string,
  route: string,
): Promise<void> {
  // Get namespaces that are specific to this route
  const routeNamespaces = TRANSLATION_NAMESPACES.filter(
    (ns) => ns.routes && ns.routes.some((r) => route.startsWith(r)),
  );

  // Preload these namespaces
  await Promise.all(
    routeNamespaces.map((ns) => loadNamespaceTranslations(locale, ns.name)),
  );
}

/**
 * Clear translation cache for testing or when changing locales
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach((key) => {
    delete translationCache[key];
  });
}

/**
 * Get statistics about the translation cache
 */
export function getTranslationCacheStats(): {
  cacheSize: number;
  cachedLocales: string[];
  cachedNamespaces: string[];
  } {
  const cachedKeys = Object.keys(translationCache);
  const uniqueLocales = new Set<string>();
  const uniqueNamespaces = new Set<string>();

  cachedKeys.forEach((key) => {
    const [locale, namespace] = key.split(':');
    uniqueLocales.add(locale);
    uniqueNamespaces.add(namespace);
  });

  return {
    cacheSize: cachedKeys.length,
    cachedLocales: Array.from(uniqueLocales),
    cachedNamespaces: Array.from(uniqueNamespaces),
  };
}
