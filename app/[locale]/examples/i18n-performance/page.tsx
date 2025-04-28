'use client';

import React, { useState, useEffect } from 'react';
import { useOptimizedTranslations } from '@/app/hooks/useOptimizedTranslations';
import OptimizedTranslationExampleComponent from '@/app/components/examples/OptimizedTranslationExample';
import { useContext } from 'react';
import { OptimizedIntlContext } from '@/app/providers/OptimizedIntlProvider';

// Import only the type, not the component itself
import type { OptimizedTranslationExampleProps } from '@/app/components/examples/OptimizedTranslationExample';

// Create a type-safe wrapper for the HOC-wrapped component
const OptimizedTranslationExample =
  OptimizedTranslationExampleComponent as React.ComponentType<{
    showMetrics?: boolean;
  }>;

/**
 * Internationalization Performance Demo
 *
 * This page demonstrates the performance benefits of our optimized
 * internationalization system, including:
 * - Namespace-based translation loading
 * - Translation caching
 * - Measurement of rendering performance
 *
 * Following BuildTrack Pro's design principles:
 * - Mobile-first responsive design
 * - Primary colors: Blue (rgb(24,62,105)), Orange (rgb(236,107,44))
 * - Glassmorphism for overlays
 * - Neumorphism for subtle depth
 * - Accessibility compliance (WCAG 2.1 AA)
 */
export default function I18nPerformancePage() {
  const { t, isReady } = useOptimizedTranslations('common');
  const { translationStats } = useContext(OptimizedIntlContext);
  const [loadTime, setLoadTime] = useState<number>(0);

  // Measure page load time
  useEffect(() => {
    const startTime = performance.now();

    // This will run when the component is mounted
    const onLoad = () => {
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
    };

    // Execute immediately if document is already loaded
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  // Simulate loading multiple namespaces to demonstrate performance
  const [loadedNamespaces, setLoadedNamespaces] = useState<string[]>([]);
  const namespaceOptions = [
    'dashboard',
    'profile',
    'projects',
    'tasks',
    'reports',
  ];

  // Get the context at the component level
  const context = useContext(OptimizedIntlContext);

  const loadNamespace = async (namespace: string) => {
    await context.loadNamespace(namespace);
    setLoadedNamespaces((prev) => [...prev, namespace]);
  };

  // Simulate loading several namespaces
  const loadAllNamespaces = async () => {
    // Reset the list first
    setLoadedNamespaces([]);

    // Load each namespace with a small delay to see the process
    for (const namespace of namespaceOptions) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await loadNamespace(namespace);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse p-6 rounded-2xl bg-white shadow-md mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-100 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded mb-6 w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="p-6 rounded-2xl bg-white shadow-md mb-6">
          <h1 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">
            {t('preferences.language')} - {t('common.languageSelector')}
          </h1>

          <p className="text-gray-700 mb-6">
            This page demonstrates BuildTrack Pro&apos;s optimized
            internationalization system with namespace-based loading and caching
            for improved performance, especially on mobile devices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-5 rounded-xl bg-[rgb(24,62,105)]/5 border border-[rgb(24,62,105)]/10">
              <h2 className="text-lg font-semibold text-[rgb(24,62,105)] mb-3">
                Performance Metrics
              </h2>

              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span>Initial page load time:</span>
                  <span className="font-medium">{loadTime.toFixed(2)} ms</span>
                </li>
                <li className="flex justify-between">
                  <span>Cached namespaces:</span>
                  <span className="font-medium">
                    {translationStats.cachedNamespaces.join(', ') || 'None'}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Cache entries:</span>
                  <span className="font-medium">
                    {translationStats.cacheSize}
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-[rgb(236,107,44)]/5 border border-[rgb(236,107,44)]/10">
              <h2 className="text-lg font-semibold text-[rgb(236,107,44)] mb-3">
                Namespace Loading Demo
              </h2>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">Loaded namespaces:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {loadedNamespaces.length === 0 ? (
                    <span className="text-gray-400 italic">
                      None loaded yet
                    </span>
                  ) : (
                    loadedNamespaces.map((ns) => (
                      <span
                        key={ns}
                        className="px-2 py-1 bg-[rgb(236,107,44)]/10 text-[rgb(236,107,44)] rounded-lg text-sm"
                      >
                        {ns}
                      </span>
                    ))
                  )}
                </div>

                <button
                  onClick={loadAllNamespaces}
                  className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Load All Namespaces
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-[rgb(24,62,105)] mb-4">
              Example Component
            </h2>
            <p className="text-gray-700 mb-4">
              The following component demonstrates the use of the
              withOptimizedTranslations HOC:
            </p>

            {/* OptimizedTranslationExample is wrapped with withOptimizedTranslations HOC 
               which provides all required translation props */}
            <OptimizedTranslationExample showMetrics={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
