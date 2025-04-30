'use client';

import React from 'react';
import { useSafeTranslations } from '../hooks/useSafeTranslations';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * Higher-Order Component that provides safe translations and error boundary
 *
 * This HOC wraps components with the useSafeTranslations hook and an ErrorBoundary,
 * ensuring consistent handling of internationalization across the application.
 * It follows BuildTrack Pro's mobile-first design principles and error handling patterns.
 *
 * @param Component - The component to wrap
 * @param namespace - Optional translation namespace, defaults to 'common'
 * @returns A wrapped component with safe translations and error boundary
 */
export function withSafeTranslations<P extends object>(
  Component: React.ComponentType<
    P & { t: (key: string, params?: Record<string, any>) => string }
  >,
  namespace: string = 'common',
) {
  // Return a new component that wraps the provided component
  function TranslatedComponent(props: P) {
    // Use our safe translations hook with the specified namespace
    const { t } = useSafeTranslations(namespace);

    // Wrap with ErrorBoundary to catch any translation or rendering errors
    return (
      <ErrorBoundary>
        <Component {...props} t={t} />
      </ErrorBoundary>
    );
  }

  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  TranslatedComponent.displayName = `withSafeTranslations(${displayName})`;

  return TranslatedComponent;
}

/**
 * Type for components that are compatible with the withSafeTranslations HOC
 */
export type WithTranslationsProps = {
  t: (key: string, params?: Record<string, any>) => string;
};
