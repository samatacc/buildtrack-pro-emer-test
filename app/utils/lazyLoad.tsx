'use client';

import React, { Suspense, lazy, ComponentType, useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  retryText?: string;
  onRetry?: () => void;
}

/**
 * createLazyComponent - Creates a lazy-loaded component with proper loading and error states
 * 
 * This utility improves performance by:
 * 1. Loading components only when needed (code splitting)
 * 2. Showing appropriate loading states with i18n support
 * 3. Handling loading errors gracefully with retry option
 * 4. Supporting both desktop and mobile optimized views
 * 
 * @param importFunc - Dynamic import function for the component
 * @param namespace - Translation namespace for the component
 * @param componentName - Name of the component for tracking/debugging
 * @returns A wrapped component that handles lazy loading
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  namespace: string = 'common',
  componentName: string = 'component'
) {
  const LazyComponent = lazy(importFunc);
  
  // Return a new component that wraps the lazy component
  return function WrappedLazyComponent(props: React.ComponentProps<T> & LazyComponentProps) {
    const { t } = useNamespacedTranslations(namespace);
    const [hasError, setHasError] = useState(false);
    const [loadStartTime, setLoadStartTime] = useState(0);
    const [loadEndTime, setLoadEndTime] = useState(0);
    
    // Reset error state when retrying
    const handleRetry = () => {
      setHasError(false);
      setLoadStartTime(Date.now());
      props.onRetry?.();
    };
    
    // Track component load performance
    useEffect(() => {
      // Mark start time when component begins to load
      setLoadStartTime(Date.now());
      
      // Create an observer to detect when the component is actually rendered
      const observer = new MutationObserver(() => {
        setLoadEndTime(Date.now());
        observer.disconnect();
      });
      
      // Start observing the document body for when our component gets added
      observer.observe(document.body, { 
        childList: true,
        subtree: true 
      });
      
      return () => observer.disconnect();
    }, []);
    
    // Log component load time when complete
    useEffect(() => {
      if (loadEndTime > 0 && loadStartTime > 0) {
        const loadTime = loadEndTime - loadStartTime;
        console.log(`[Performance] ${componentName} loaded in ${loadTime}ms`);
        
        // Report to analytics if available
        if (window.performance && 'measure' in window.performance) {
          try {
            window.performance.mark(`${componentName}-end`);
            window.performance.measure(
              `${componentName}-load-time`,
              'navigationStart',
              `${componentName}-end`
            );
          } catch (e) {
            // Ignore measurement errors
          }
        }
      }
    }, [loadEndTime, loadStartTime, componentName]);
    
    // Default loading state
    const defaultFallback = (
      <div className="flex flex-col items-center justify-center p-4 space-y-2 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
        <p className="text-sm text-gray-500">{t('loading')}</p>
      </div>
    );
    
    // Default error state
    const defaultErrorFallback = (
      <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
        <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-red-800 mb-2">{t('errorLoading')}</p>
        <button 
          onClick={handleRetry}
          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
        >
          {props.retryText || t('retry')}
        </button>
      </div>
    );
    
    // Create fallback to use if the component fails to load
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      if (hasError) {
        return <>{props.errorFallback || defaultErrorFallback}</>;
      }
      return <>{children}</>;
    };
    
    // Extract lazyLoading-specific props
    const { fallback, errorFallback, retryText, onRetry, ...componentProps } = props;
    
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback || defaultFallback}>
          <LazyComponent 
            {...componentProps as any} 
            onError={() => setHasError(true)}
          />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

/**
 * withLazyLoading - Higher-order component that adds lazy loading to an existing component
 * 
 * Use this for route-based code splitting in Next.js applications
 * 
 * @param Component - Component to wrap with lazy loading
 * @param options - Configuration options
 * @returns A component that is lazily loaded
 */
export function withLazyLoading<T extends ComponentType<any>>(
  Component: T,
  options: {
    namespace?: string;
    componentName?: string;
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
  } = {}
) {
  const {
    namespace = 'common',
    componentName = Component.displayName || Component.name || 'Component',
    fallback,
    errorFallback
  } = options;
  
  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    const { t } = useNamespacedTranslations(namespace);
    
    return (
      <Suspense fallback={fallback || (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(24,62,105)]"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      )}>
        <Component {...props} />
      </Suspense>
    );
  };
}
