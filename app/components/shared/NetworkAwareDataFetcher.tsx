'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ConnectionStatus from './ConnectionStatus';
import { processQueuedMutations } from '@/app/utils/storage';

interface NetworkAwareDataFetcherProps {
  children: React.ReactNode;
}

/**
 * NetworkAwareDataFetcher component
 * 
 * A higher-order component that provides network awareness to the application.
 * It monitors online/offline status and synchronizes data when connectivity is restored.
 * Following BuildTrack Pro's mobile-first approach for construction professionals
 * working in environments with potentially limited connectivity.
 */
export default function NetworkAwareDataFetcher({ children }: NetworkAwareDataFetcherProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();
  
  // Monitor online/offline status
  useEffect(() => {
    function handleOnline() {
      console.log('App is now online, syncing data...');
      setIsOnline(true);
      
      // Process any mutations that were queued while offline
      processQueuedMutations().then(() => {
        console.log('Queued mutations processed');
        
        // Refresh data from server
        queryClient.invalidateQueries();
      });
    }
    
    function handleOffline() {
      console.log('App is now offline, switching to cached data');
      setIsOnline(false);
    }
    
    // Set initial status
    setIsOnline(navigator.onLine);
    setIsInitializing(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);
  
  // Set up periodic sync when online
  useEffect(() => {
    if (!isOnline) return;
    
    // Process queued mutations every 5 minutes when online
    const interval = setInterval(() => {
      processQueuedMutations().then(() => {
        console.log('Periodic sync completed');
      });
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isOnline]);
  
  // Process any queued mutations on initial load if online
  useEffect(() => {
    if (isInitializing) return;
    
    if (isOnline) {
      processQueuedMutations().then(() => {
        console.log('Initial sync completed');
      });
    }
  }, [isInitializing, isOnline]);
  
  return (
    <>
      {children}
      <ConnectionStatus />
    </>
  );
}
