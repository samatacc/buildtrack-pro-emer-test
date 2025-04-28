/**
 * Optimized Translation Example Component
 *
 * This example demonstrates how to use the optimized translation system
 * in BuildTrack Pro components to achieve better performance, especially
 * on mobile devices.
 *
 * The component showcases:
 * - Dynamic namespace loading
 * - Performance metrics
 * - Proper usage of the withOptimizedTranslations HOC
 * - BuildTrack Pro's mobile-first design principles
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
  withOptimizedTranslations,
  WithOptimizedTranslationsProps,
} from '@/app/utils/withOptimizedTranslations';
import { useContext } from 'react';
import { OptimizedIntlContext } from '@/app/providers/OptimizedIntlProvider';

interface OptimizedTranslationExampleProps
  extends WithOptimizedTranslationsProps {
  showMetrics?: boolean;
}

function OptimizedTranslationExample({
  t,
  formatDate,
  formatNumber,
  currentLocale,
  isTranslationsReady,
  showMetrics = true,
}: OptimizedTranslationExampleProps) {
  const { translationStats } = useContext(OptimizedIntlContext);
  const [renderTime, setRenderTime] = useState<number>(0);

  // Measure component render time
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };
  }, []);

  // Current date for demonstration
  const currentDate = new Date();

  return (
    <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-[rgb(24,62,105)] mb-4">
        {t('example.optimizedTitle')}
      </h2>

      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50">
            <h3 className="font-medium text-[rgb(24,62,105)] mb-2">
              {t('example.translatedContent')}
            </h3>
            <p className="text-gray-700 mb-2">{t('example.description')}</p>
            <p className="text-gray-700 mb-3">
              {t('example.currentUser', { username: 'John Doe' })}
            </p>

            <div className="flex flex-col space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">{t('example.date')}:</span>{' '}
                <span className="font-medium">
                  {formatDate(currentDate, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">{t('example.number')}:</span>{' '}
                <span className="font-medium">
                  {formatNumber(1234567.89, {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">{t('example.percent')}:</span>{' '}
                <span className="font-medium">
                  {formatNumber(0.8756, {
                    style: 'percent',
                    maximumFractionDigits: 1,
                  })}
                </span>
              </div>
            </div>
          </div>

          {showMetrics && (
            <div className="p-4 rounded-xl bg-gray-50">
              <h3 className="font-medium text-[rgb(24,62,105)] mb-2">
                {t('example.metrics')}
              </h3>

              <div className="text-sm space-y-2">
                <div>
                  <span className="text-gray-500">
                    {t('example.currentLocale')}:
                  </span>{' '}
                  <span className="font-medium">{currentLocale}</span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {t('example.translationsReady')}:
                  </span>{' '}
                  <span className="font-medium">
                    {isTranslationsReady ? '✅' : '⏳'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {t('example.renderTime')}:
                  </span>{' '}
                  <span className="font-medium">
                    {renderTime.toFixed(2)} ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {t('example.cacheSize')}:
                  </span>{' '}
                  <span className="font-medium">
                    {translationStats.cacheSize}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {t('example.cachedNamespaces')}:
                  </span>{' '}
                  <span className="font-medium">
                    {translationStats.cachedNamespaces.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
          {t('common.submit')}
        </button>
      </div>
    </div>
  );
}

// Wrap with our optimized translations HOC using the 'example' namespace
export default withOptimizedTranslations(
  OptimizedTranslationExample,
  'example',
);
