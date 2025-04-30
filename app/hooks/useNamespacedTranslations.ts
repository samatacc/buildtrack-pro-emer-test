'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { namespaces, loadNamespaceMessages } from '@/i18n';

/**
 * Hook for loading translations by namespace with performance metrics
 * 
 * Benefits:
 * - Only loads translations needed by the component
 * - Reduces initial bundle size for faster loading
 * - Tracks loading performance for optimization
 * - Falls back gracefully when translations are missing
 * 
 * @param namespace The translation namespace to load
 * @param locale Optional locale to override the current app locale
 * @returns Translation function and loading metrics
 */
export function useNamespacedTranslations(namespace: string, locale?: string) {
  // Initialize with default metrics
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    cacheHit: false,
    namespaceSize: 0,
    loaded: false,
    errors: 0
  });
  
  // Wrap the base translate function with error handling
  let baseTranslate;
  try {
    baseTranslate = useNextIntlTranslations(namespace);
  } catch (error) {
    console.warn(`Error loading translations for namespace '${namespace}':`, error);
    // Provide a fallback translation function that won't crash
    baseTranslate = (key: string, params?: Record<string, any>) => {
      console.warn(`Translation missing for key: ${namespace}.${key}`);
      return key.split('.').pop() || key;
    };
    
    // Update metrics to reflect the error
    setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }));
  }

  useEffect(() => {
    // Skip in SSR context
    if (typeof window === 'undefined') return;

    // Create a namespace cache in localStorage if it doesn't exist
    const namespaceCache = JSON.parse(localStorage.getItem('buildtrack-translations-cache') || '{}');
    
    // Check if the namespace is already cached for the current locale
    const currentLocale = locale || document.documentElement.lang || 'en';
    const cacheKey = `${currentLocale}:${namespace}`;
    const cachedData = namespaceCache[cacheKey];
    
    // If we have valid cached data, just update metrics
    if (cachedData && cachedData.expires > Date.now()) {
      setMetrics({
        loadTime: 0,
        cacheHit: true,
        namespaceSize: JSON.stringify(cachedData.data).length,
        loaded: true,
        errors: 0
      });
      return;
    }
    
    // Otherwise load the namespace
    const startTime = performance.now();
    
    // Load the namespace translations
    loadNamespaceMessages(currentLocale, namespace)
      .then(messages => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Cache the namespace for future use (expires in 1 hour)
        namespaceCache[cacheKey] = {
          data: messages,
          expires: Date.now() + 3600000, // 1 hour
          loadTime
        };
        
        // Update localStorage
        localStorage.setItem('buildtrack-translations-cache', JSON.stringify(namespaceCache));
        
        // Update metrics
        setMetrics({
          loadTime,
          cacheHit: false,
          namespaceSize: JSON.stringify(messages).length,
          loaded: true,
          errors: 0
        });
        
        // Log performance data for analytics
        if (process.env.NODE_ENV === 'development') {
          console.log(`[i18n] Loaded ${namespace} in ${loadTime.toFixed(2)}ms (${currentLocale})`);
        }
      })
      .catch(error => {
        console.error(`[i18n] Error loading namespace ${namespace}:`, error);
        setMetrics({
          loadTime: 0,
          cacheHit: false,
          namespaceSize: 0,
          loaded: false,
          errors: 1
        });
      });
  }, [namespace, locale]);

  // Extend the translation function with additional features
  const enhancedTranslate = (key: string, params?: Record<string, any>) => {
    try {
      return baseTranslate(key, params);
    } catch (error) {
      // Fall back to just the key for better UX than showing an error
      console.warn(`[i18n] Missing translation: ${namespace}.${key}`);
      
      // Return the last part of the key as a fallback display value
      const keyParts = key.split('.');
      return keyParts[keyParts.length - 1].replace(/([A-Z])/g, ' $1').trim();
    }
  };

  return { 
    t: enhancedTranslate, 
    metrics 
  };
}

/**
 * Get all available namespaces
 * 
 * @returns Array of available translation namespaces
 */
export function getAvailableNamespaces() {
  return namespaces;
}

/**
 * Preload translations for multiple namespaces
 * 
 * Use this to preload translations before they are needed
 * for smoother user experience.
 * 
 * @param namespaceList List of namespaces to preload
 * @param locale Optional locale override
 */
export async function preloadNamespaces(namespaceList: string[], locale?: string) {
  const currentLocale = locale || 
    (typeof document !== 'undefined' ? document.documentElement.lang : 'en');
  
  return Promise.all(namespaceList.map(ns => 
    loadNamespaceMessages(currentLocale, ns)
  ));
}
