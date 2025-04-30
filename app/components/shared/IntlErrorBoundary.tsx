'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * IntlErrorBoundary Component
 * 
 * A specialized error boundary for catching internationalization-related errors.
 * This helps diagnose and handle errors related to missing translations or 
 * internationalization context issues.
 * 
 * Follows BuildTrack Pro's error handling approach with detailed reporting
 * and recovery options.
 */
class IntlErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('IntlErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Check if this is a translation-related error
    const isIntlError = error.message.includes('useTranslation') || 
                        error.message.includes('useTranslations') ||
                        error.message.includes('MISSING_MESSAGE') ||
                        error.message.includes('locale') ||
                        error.message.includes('translation') ||
                        error.message.includes('i18n');
    
    if (isIntlError) {
      console.warn('Detected internationalization-related error:', error.message);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ 
      hasError: false,
      error: null 
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI for internationalization errors
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg my-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Translation Error</h2>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            {this.state.error?.message || 'An error occurred with internationalization.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={this.resetErrorBoundary}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
            >
              Reload Page
            </button>
          </div>
          {this.state.error && (
            <details className="mt-2 text-xs">
              <summary className="text-red-500 dark:text-red-400 cursor-pointer">Technical Details</summary>
              <pre className="mt-1 whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default IntlErrorBoundary;
