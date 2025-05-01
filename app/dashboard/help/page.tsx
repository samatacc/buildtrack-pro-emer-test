'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the HelpCenter component with loading fallback
const HelpCenter = dynamic(() => import('@/app/components/help/HelpCenter'), {
  loading: () => <LoadingFallback />,
  ssr: false // Disable SSR for this component to avoid build issues
});

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading Help Center...</p>
    </div>
  );
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by error boundary:', event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">We're having trouble loading the Help Center. Please try again later.</p>
        <button 
          onClick={() => setHasError(false)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <HelpCenter />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
