'use client';

import React, { useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import IntlErrorBoundary from '@/app/components/shared/IntlErrorBoundary';

/**
 * I18n Test Page
 * 
 * A minimal test page to isolate internationalization issues
 * This page uses a self-contained approach to internationalization
 * that doesn't depend on the global setup
 */
export default function I18nTestPage() {
  const [translationResult, setTranslationResult] = useState('Loading translations...');
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<Record<string, any>>({});
  const [locale, setLocale] = useState('en');
  
  // Load messages directly in this component
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Try to load direct from English common file
        const response = await fetch('/messages/en/common.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load messages: ${response.status}`);
        }
        
        const commonMessages = await response.json();
        setMessages({ common: commonMessages });
        
        // Extract app name if available
        if (commonMessages?.app?.name) {
          setTranslationResult(commonMessages.app.name);
        } else {
          setTranslationResult('BuildTrack Pro (Fallback)');
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading messages'));
        setTranslationResult('BuildTrack Pro (Error Fallback)');
        // Provide minimal fallback messages
        setMessages({
          common: {
            app: { name: 'BuildTrack Pro (Fallback)' }
          }
        });
      }
    };
    
    loadMessages();
  }, []);
  
  return (
    <IntlErrorBoundary>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-center mb-6 text-[rgb(24,62,105)]">
              Internationalization Test Page
            </h1>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-md dark:bg-gray-700">
              <h2 className="text-lg font-medium mb-2">Translation Result:</h2>
              <div className="p-2 bg-white rounded border dark:bg-gray-600 dark:border-gray-500">
                {translationResult}
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-md dark:bg-red-900/20">
                <h2 className="text-lg font-medium mb-2 text-red-700 dark:text-red-400">Error Details:</h2>
                <pre className="whitespace-pre-wrap text-sm p-2 bg-white rounded border border-red-200 dark:bg-gray-600 dark:border-red-800">
                  {error.message}
                </pre>
              </div>
            )}
            
            <div className="mb-6 p-4 bg-blue-50 rounded-md dark:bg-blue-900/20">
              <h2 className="text-lg font-medium mb-2 text-blue-700 dark:text-blue-400">System Information:</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>URL: <span className="font-mono">{typeof window !== 'undefined' ? window.location.href : 'Server Rendering'}</span></li>
                <li>Rendering: <span className="font-mono">{typeof window !== 'undefined' ? 'Client' : 'Server'}</span></li>
                <li>Window defined: <span className="font-mono">{typeof window !== 'undefined' ? 'Yes' : 'No'}</span></li>
              </ul>
            </div>
            
            <div className="flex justify-center space-x-3">
              <a href="/" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                Home
              </a>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,49,84)] transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </NextIntlClientProvider>
    </IntlErrorBoundary>
  );
}
