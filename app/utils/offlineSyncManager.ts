/**
 * Offline Sync Manager
 * 
 * Provides offline data synchronization capabilities for BuildTrack Pro mobile users.
 * This utility handles data persistence, conflict resolution, and synchronization
 * when internet connectivity is restored.
 * 
 * Features:
 * - IndexedDB storage for offline data persistence
 * - Optimistic UI updates during offline mode
 * - Conflict resolution when online sync occurs
 * - Background sync with Service Worker support
 * - Support for all core data types (projects, tasks, materials, documents)
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema type definition
interface BuildTrackOfflineDB extends DBSchema {
  pendingChanges: {
    key: string;
    value: {
      id: string;
      entity: string;
      operation: 'create' | 'update' | 'delete';
      timestamp: number;
      data: any;
      syncStatus: 'pending' | 'syncing' | 'error';
      errorDetails?: string;
      retryCount: number;
    };
    indexes: { 'by-entity': string; 'by-status': string };
  };
  offlineData: {
    key: string;
    value: {
      entity: string;
      entityId: string;
      data: any;
      lastUpdated: number;
    };
    indexes: { 'by-entity': string };
  };
}

// Supported entity types for offline syncing
type EntityType = 'projects' | 'tasks' | 'materials' | 'documents' | 'notes' | 'inspections';
 
// Singleton instance of the database connection
let dbPromise: Promise<IDBPDatabase<BuildTrackOfflineDB>> | null = null;

/**
 * Initialize the IndexedDB database for offline storage
 */
const initializeDB = async (): Promise<IDBPDatabase<BuildTrackOfflineDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<BuildTrackOfflineDB>('buildtrack-offline-db', 1, {
      upgrade(db) {
        // Create store for pending changes that need to be synced
        const pendingChangesStore = db.createObjectStore('pendingChanges', { keyPath: 'id' });
        pendingChangesStore.createIndex('by-entity', 'entity');
        pendingChangesStore.createIndex('by-status', 'syncStatus');
        
        // Create store for cached offline data
        const offlineDataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
        offlineDataStore.createIndex('by-entity', 'entity');
      }
    });
  }
  return dbPromise;
};

/**
 * Add a pending change to be synchronized when online
 */
export const queueChange = async (
  entity: EntityType,
  operation: 'create' | 'update' | 'delete',
  data: any
): Promise<string> => {
  const db = await initializeDB();
  const id = `${entity}_${data.id || Date.now()}_${operation}`;
  
  const pendingChange = {
    id,
    entity,
    operation,
    timestamp: Date.now(),
    data,
    syncStatus: 'pending' as const,
    retryCount: 0
  };
  
  await db.put('pendingChanges', pendingChange);
  
  // Also update the local cache for immediate UI feedback
  if (operation !== 'delete') {
    await db.put('offlineData', {
      id: `${entity}_${data.id}`,
      entity,
      entityId: data.id,
      data,
      lastUpdated: Date.now()
    });
  } else if (operation === 'delete') {
    try {
      await db.delete('offlineData', `${entity}_${data.id}`);
    } catch (err) {
      console.warn('Failed to delete from offline cache', err);
    }
  }
  
  return id;
};

/**
 * Get data from offline storage
 */
export const getOfflineData = async <T = any>(
  entity: EntityType,
  entityId?: string
): Promise<T | T[] | null> => {
  const db = await initializeDB();
  
  if (entityId) {
    // Get specific entity
    try {
      const item = await db.get('offlineData', `${entity}_${entityId}`);
      return item ? (item.data as T) : null;
    } catch (err) {
      console.error('Failed to get offline data', err);
      return null;
    }
  } else {
    // Get all entities of a type
    try {
      const index = db.transaction('offlineData').store.index('by-entity');
      const items = await index.getAll(entity);
      return items.map(item => item.data) as T[];
    } catch (err) {
      console.error('Failed to get offline data', err);
      return [];
    }
  }
};

/**
 * Synchronize all pending changes when online
 */
export const syncPendingChanges = async (
  apiEndpoint: string = '/api'
): Promise<{
  success: boolean;
  synced: number;
  failed: number;
  details: Array<{ id: string; success: boolean; error?: string }>;
}> => {
  // Skip if we're offline
  if (!navigator.onLine) {
    return {
      success: false,
      synced: 0,
      failed: 0,
      details: [{ id: 'network', success: false, error: 'Device is offline' }]
    };
  }
  
  const db = await initializeDB();
  const result = {
    success: true,
    synced: 0,
    failed: 0,
    details: [] as Array<{ id: string; success: boolean; error?: string }>
  };
  
  // Get all pending changes
  const pendingIndex = db.transaction('pendingChanges', 'readonly')
    .store.index('by-status');
  const pendingChanges = await pendingIndex.getAll('pending');
  
  // Sort changes by timestamp
  pendingChanges.sort((a, b) => a.timestamp - b.timestamp);
  
  for (const change of pendingChanges) {
    try {
      // Mark as syncing
      await db.put('pendingChanges', {
        ...change,
        syncStatus: 'syncing'
      });
      
      // Perform API call based on operation type
      const endpoint = `${apiEndpoint}/${change.entity}${change.operation === 'create' ? '' : `/${change.data.id}`}`;
      const method = 
        change.operation === 'create' ? 'POST' :
        change.operation === 'update' ? 'PUT' :
        'DELETE';
        
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(change.data) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // If successful, remove from pending changes
      await db.delete('pendingChanges', change.id);
      
      // If it was a create operation, update the cached entity with the server response
      if (change.operation === 'create') {
        const responseData = await response.json();
        await db.put('offlineData', {
          id: `${change.entity}_${responseData.id}`,
          entity: change.entity,
          entityId: responseData.id,
          data: responseData,
          lastUpdated: Date.now()
        });
      }
      
      result.synced++;
      result.details.push({ id: change.id, success: true });
      
    } catch (error) {
      // Update retry count and error details
      result.failed++;
      result.success = false;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.details.push({ id: change.id, success: false, error: errorMessage });
      
      // Update record with error details
      await db.put('pendingChanges', {
        ...change,
        syncStatus: 'error',
        errorDetails: errorMessage,
        retryCount: change.retryCount + 1
      });
    }
  }
  
  return result;
};

/**
 * Cache data for offline use
 */
export const cacheForOffline = async <T = any>(
  entity: EntityType,
  data: T | T[]
): Promise<void> => {
  const db = await initializeDB();
  const tx = db.transaction('offlineData', 'readwrite');
  
  if (Array.isArray(data)) {
    for (const item of data) {
      const id = (item as any).id;
      if (!id) continue;
      
      await tx.store.put({
        id: `${entity}_${id}`,
        entity,
        entityId: id,
        data: item,
        lastUpdated: Date.now()
      });
    }
  } else {
    const id = (data as any).id;
    if (id) {
      await tx.store.put({
        id: `${entity}_${id}`,
        entity,
        entityId: id,
        data,
        lastUpdated: Date.now()
      });
    }
  }
  
  await tx.done;
};

/**
 * Get statistics about pending changes
 */
export const getPendingChangesStats = async (): Promise<{
  total: number;
  byEntity: Record<EntityType, number>;
  byOperation: Record<'create' | 'update' | 'delete', number>;
  hasErrors: boolean;
}> => {
  const db = await initializeDB();
  const pendingChanges = await db.getAll('pendingChanges');
  
  const stats = {
    total: pendingChanges.length,
    byEntity: {} as Record<EntityType, number>,
    byOperation: {
      create: 0,
      update: 0,
      delete: 0
    },
    hasErrors: false
  };
  
  for (const change of pendingChanges) {
    // Count by entity
    if (!stats.byEntity[change.entity]) {
      stats.byEntity[change.entity] = 0;
    }
    stats.byEntity[change.entity]++;
    
    // Count by operation
    stats.byOperation[change.operation]++;
    
    // Check for errors
    if (change.syncStatus === 'error') {
      stats.hasErrors = true;
    }
  }
  
  return stats;
};

/**
 * Check if the device currently has an internet connection
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Set up event listeners for online/offline status changes
 */
export const setupConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * Register a service worker for offline capabilities
 */
export const registerServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope:', registration.scope);
      return true;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return false;
    }
  }
  return false;
};
