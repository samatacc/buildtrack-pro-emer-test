'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { 
  isOnline, 
  setupConnectivityListeners, 
  getPendingChangesStats, 
  syncPendingChanges 
} from '@/app/utils/offlineSyncManager';

/**
 * FieldModeProvider Component
 * 
 * Provides a context for managing field mode functionality across BuildTrack Pro's mobile interface.
 * Field mode optimizes the app for construction site usage with enhanced offline capabilities,
 * battery optimization, and touch-friendly controls for users wearing gloves or working in
 * challenging environments.
 * 
 * Features:
 * - Network status tracking
 * - Battery-saving optimizations
 * - Pending changes status and sync management
 * - Device orientation and environmental adaptations
 */

interface FieldModeContextType {
  isFieldModeEnabled: boolean;
  toggleFieldMode: () => void;
  isOnline: boolean;
  pendingChanges: number;
  hasSyncErrors: boolean;
  syncData: () => Promise<boolean>;
  batteryLevel: number | null;
  isBatterySaving: boolean;
  isLowDataMode: boolean;
  toggleLowDataMode: () => void;
  lastSyncTime: number | null;
}

const FieldModeContext = createContext<FieldModeContextType>({
  isFieldModeEnabled: false,
  toggleFieldMode: () => {},
  isOnline: true,
  pendingChanges: 0,
  hasSyncErrors: false,
  syncData: async () => false,
  batteryLevel: null,
  isBatterySaving: false,
  isLowDataMode: false,
  toggleLowDataMode: () => {},
  lastSyncTime: null
});

export const useFieldMode = () => useContext(FieldModeContext);

interface FieldModeProviderProps {
  children: ReactNode;
}

export default function FieldModeProvider({ children }: FieldModeProviderProps) {
  const { t } = useNamespacedTranslations('mobile');
  const [isFieldModeEnabled, setIsFieldModeEnabled] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [pendingChanges, setPendingChanges] = useState(0);
  const [hasSyncErrors, setHasSyncErrors] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isBatterySaving, setIsBatterySaving] = useState(false);
  const [isLowDataMode, setIsLowDataMode] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  
  // Initialize field mode from localStorage (if available)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFieldMode = localStorage.getItem('buildtrack-field-mode');
      if (savedFieldMode !== null) {
        setIsFieldModeEnabled(savedFieldMode === 'true');
      }
      
      const savedLowDataMode = localStorage.getItem('buildtrack-low-data-mode');
      if (savedLowDataMode !== null) {
        setIsLowDataMode(savedLowDataMode === 'true');
      }
      
      const lastSync = localStorage.getItem('buildtrack-last-sync');
      if (lastSync !== null) {
        setLastSyncTime(parseInt(lastSync, 10));
      }
    }
  }, []);
  
  // Save field mode preferences when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('buildtrack-field-mode', isFieldModeEnabled.toString());
    }
  }, [isFieldModeEnabled]);
  
  // Save low data mode preferences when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('buildtrack-low-data-mode', isLowDataMode.toString());
    }
  }, [isLowDataMode]);
  
  // Track network status and setup connectivity listeners
  useEffect(() => {
    const cleanup = setupConnectivityListeners(
      // Online handler
      () => {
        setOnline(true);
        // Automatically sync if in field mode
        if (isFieldModeEnabled) {
          syncData();
        }
      },
      // Offline handler
      () => {
        setOnline(false);
      }
    );
    
    return cleanup;
  }, [isFieldModeEnabled]);
  
  // Track battery status if supported
  useEffect(() => {
    if (!('getBattery' in navigator)) {
      return;
    }
    
    let batteryManager: any;
    
    const handleBatteryChange = () => {
      if (batteryManager) {
        setBatteryLevel(batteryManager.level * 100);
        setIsBatterySaving(batteryManager.level <= 0.15);
      }
    };
    
    // @ts-ignore - getBattery is not in the standard navigator type
    navigator.getBattery().then((battery: any) => {
      batteryManager = battery;
      setBatteryLevel(battery.level * 100);
      setIsBatterySaving(battery.level <= 0.15);
      
      battery.addEventListener('levelchange', handleBatteryChange);
    });
    
    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', handleBatteryChange);
      }
    };
  }, []);
  
  // Check pending changes periodically
  useEffect(() => {
    const checkPendingChanges = async () => {
      try {
        const stats = await getPendingChangesStats();
        setPendingChanges(stats.total);
        setHasSyncErrors(stats.hasErrors);
      } catch (error) {
        console.error('Error checking pending changes:', error);
      }
    };
    
    // Initial check
    checkPendingChanges();
    
    // Set up periodic checks if in field mode
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isFieldModeEnabled) {
      intervalId = setInterval(checkPendingChanges, 60000); // Check every minute
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isFieldModeEnabled]);
  
  // Sync data with the server
  const syncData = async (): Promise<boolean> => {
    if (!online) {
      return false;
    }
    
    try {
      const result = await syncPendingChanges();
      setPendingChanges(result.failed);
      setHasSyncErrors(result.failed > 0);
      
      // Update last sync time
      const now = Date.now();
      setLastSyncTime(now);
      localStorage.setItem('buildtrack-last-sync', now.toString());
      
      return result.success;
    } catch (error) {
      console.error('Error syncing data:', error);
      return false;
    }
  };
  
  // Toggle field mode
  const toggleFieldMode = () => {
    setIsFieldModeEnabled(prev => !prev);
    
    // If enabling field mode, perform an initial sync
    if (!isFieldModeEnabled && online) {
      syncData();
    }
  };
  
  // Toggle low data mode
  const toggleLowDataMode = () => {
    setIsLowDataMode(prev => !prev);
  };
  
  // Context value
  const value: FieldModeContextType = {
    isFieldModeEnabled,
    toggleFieldMode,
    isOnline: online,
    pendingChanges,
    hasSyncErrors,
    syncData,
    batteryLevel,
    isBatterySaving,
    isLowDataMode, 
    toggleLowDataMode,
    lastSyncTime
  };
  
  return (
    <FieldModeContext.Provider value={value}>
      {children}
      
      {/* Field Mode Status Bar - only shown when field mode is enabled */}
      {isFieldModeEnabled && (
        <div 
          className={`fixed top-0 left-0 right-0 z-50 py-1 px-2 text-xs flex items-center justify-between
            ${online ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            ${isBatterySaving ? 'border-b-2 border-red-500' : ''}
          `}
        >
          <div className="flex items-center space-x-2">
            <span>
              {online ? '📶 Online' : '📴 ' + t('offlineMode')}
            </span>
            
            {pendingChanges > 0 && (
              <span className={`${hasSyncErrors ? 'text-red-600' : 'text-yellow-600'}`}>
                ({pendingChanges} {t('pendingChanges')})
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {batteryLevel !== null && (
              <span className={isBatterySaving ? 'text-red-600' : ''}>
                🔋 {Math.round(batteryLevel)}%
              </span>
            )}
            
            {isLowDataMode && (
              <span>📉 {t('lowDataMode')}</span>
            )}
          </div>
        </div>
      )}
    </FieldModeContext.Provider>
  );
}
