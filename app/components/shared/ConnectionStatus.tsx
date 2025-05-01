'use client';

import { useEffect, useState } from 'react';

/**
 * ConnectionStatus Component
 * 
 * Displays the current network connection status
 * following BuildTrack Pro's design system with:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */
export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex items-center">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
        <span className="text-red-500 font-medium text-sm">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
      <span className="text-green-500 font-medium text-sm">Online</span>
    </div>
  );
}
