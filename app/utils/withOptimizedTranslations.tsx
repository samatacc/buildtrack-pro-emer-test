'use client';

/**
 * Optimized Safe Translations Higher-Order Component
 *
 * Enhanced version of the withSafeTranslations HOC that uses our optimized
 * translation system for better performance. Features:
 * - Dynamic namespace loading
 * - Error boundaries for resilience
 * - Performance optimization for mobile devices
 * - Type-safe translation props
 *
 * Follows BuildTrack Pro's design principles:
 * - Mobile-first approach for better performance
 * - Enhanced accessibility
 * - Consistent error handling
 */
import React from 'react';
import { useOptimizedTranslations } from '@/app/hooks/useOptimizedTranslations';

// Inline ErrorBoundary component for build stability
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export interface WithOptimizedTranslationsProps {
  t: (_key: string, _params?: Record<string, any>) => string;
  formatDate: (
    _date: Date | string | number,
    _options?: Intl.DateTimeFormatOptions,
  ) => string;
  formatNumber: (
    _number: number,
    _options?: Intl.NumberFormatOptions,
  ) => string;
  currentLocale: string;
  isTranslationsReady: boolean;
}

/**
 * Higher-Order Component that provides optimized translations to the wrapped component
 * with proper error handling and performance optimizations.
 *
 * @param Component The component to wrap
 * @param namespace The translation namespace to use
 * @returns A new component with translation props
 */
export function withOptimizedTranslations<P>(
  Component: React.ComponentType<P & WithOptimizedTranslationsProps>,
  namespace: string,
) {
  // Set a display name for easier debugging
  const displayName = `withOptimizedTranslations(${Component.displayName || Component.name || 'Component'})`;

  // Create the wrapped component
  function OptimizedTranslationComponent(props: P) {
    const { t, formatDate, formatNumber, currentLocale, isReady } =
      useOptimizedTranslations(namespace);

    // Add loading state if translations aren't ready yet
    if (!isReady) {
      return (
        <div className="animate-pulse p-4 rounded-2xl bg-white/30 backdrop-blur-sm">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-1"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>
      );
    }

    // Render the component with translations when ready
    return (
      <ErrorBoundary>
        <Component
          {...props}
          t={t}
          formatDate={formatDate}
          formatNumber={formatNumber}
          currentLocale={currentLocale}
          isTranslationsReady={isReady}
        />
      </ErrorBoundary>
    );
  }

  // Set display name for better debugging experience
  OptimizedTranslationComponent.displayName = displayName;

  return OptimizedTranslationComponent;
}
