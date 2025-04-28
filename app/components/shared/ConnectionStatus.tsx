'use client';

import React, { useState, useEffect } from 'react';

/**
 * ConnectionStatus component
 * 
 * Displays the current online/offline status with visual feedback.
 * Follows BuildTrack Pro's design system with the specified colors
 * and provides important feedback for construction professionals in the field.
 */
export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setIsVisible(true);
      
      // Hide the notification after 3 seconds when going back online
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    function handleOffline() {
      setIsOnline(false);
      setIsVisible(true); // Always show when offline
    }
    
    // Set initial status
    setIsOnline(navigator.onLine);
    setHasInitialized(true);
    
    // Only show on initial load if offline
    if (!navigator.onLine) {
      setIsVisible(true);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Don't render anything during SSR or before initialization
  if (!hasInitialized) {
    return null;
  }
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`
        px-4 
        py-2 
        rounded-full 
        shadow-lg 
        flex 
        items-center 
        space-x-2
        transition-all 
        duration-300
        ${isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
        }
      `}>
        <div className={`
          h-3 
          w-3 
          rounded-full 
          ${isOnline 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-red-500'
          }
        `} />
        <span className="text-sm font-medium">
          {isOnline ? 'Back Online' : 'Offline Mode'}
        </span>
        {isOnline && (
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-2 text-green-700 hover:text-green-900"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
