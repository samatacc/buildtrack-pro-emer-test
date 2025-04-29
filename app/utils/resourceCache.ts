/**
 * Resource Cache Service
 * 
 * Provides caching mechanisms for API responses, assets, and static resources.
 * This service improves performance and offline capabilities by:
 * - Reducing network requests through smart caching
 * - Enabling offline access to previously cached resources
 * - Optimizing resource loading based on connection quality
 * - Handling cache invalidation and refresh strategies
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { isOnline } from './offlineSyncManager';

// Cache database schema
interface CacheDBSchema extends DBSchema {
  'api-cache': {
    key: string;
    value: {
      url: string;
      data: any;
      expires: number;
      lastUpdated: number;
      etag?: string;
      lastModified?: string;
    };
    indexes: { 'by-expiry': number };
  };
  'asset-cache': {
    key: string;
    value: {
      url: string;
      blob: Blob;
      mimeType: string;
      size: number;
      expires: number;
      lastUpdated: number;
    };
    indexes: { 'by-expiry': number; 'by-size': number };
  };
  'cache-metadata': {
    key: string;
    value: {
      totalSize: number;
      lastCleanup: number;
      maxSize: number;
      version: number;
    };
  };
}

// Configurable cache options
export interface CacheOptions {
  /** Cache TTL in milliseconds */
  ttl?: number;
  /** Force fetch from network, ignore cache */
  forceRefresh?: boolean;
  /** Cache even if offline */
  cacheIfOffline?: boolean;
  /** Use stale cache while revalidating */
  staleWhileRevalidate?: boolean;
  /** Priority level (1-5, higher = more important) */
  priority?: number;
  /** HTTP Request headers to include */
  headers?: Record<string, string>;
}

// Singleton instance of the database connection
let dbPromise: Promise<IDBPDatabase<CacheDBSchema>> | null = null;

const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50 MB
const CACHE_DB_VERSION = 1;

/**
 * Initialize the cache database
 */
const initializeDB = async (): Promise<IDBPDatabase<CacheDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<CacheDBSchema>('buildtrack-resource-cache', CACHE_DB_VERSION, {
      upgrade(db) {
        // Create API response cache store
        const apiCache = db.createObjectStore('api-cache', { keyPath: 'url' });
        apiCache.createIndex('by-expiry', 'expires');
        
        // Create asset cache store
        const assetCache = db.createObjectStore('asset-cache', { keyPath: 'url' });
        assetCache.createIndex('by-expiry', 'expires');
        assetCache.createIndex('by-size', 'size');
        
        // Create metadata store
        db.createObjectStore('cache-metadata', { keyPath: 'key' });
        
        // Initialize metadata
        const tx = db.transaction('cache-metadata', 'readwrite');
        tx.store.put({
          key: 'stats',
          totalSize: 0,
          lastCleanup: Date.now(),
          maxSize: MAX_CACHE_SIZE,
          version: CACHE_DB_VERSION
        });
      }
    });
  }
  return dbPromise;
};

/**
 * Fetch and cache API response with smart caching logic
 */
export const fetchWithCache = async <T = any>(
  url: string,
  options: CacheOptions = {}
): Promise<T> => {
  const {
    ttl = DEFAULT_CACHE_TTL,
    forceRefresh = false,
    cacheIfOffline = true,
    staleWhileRevalidate = true,
    headers = {}
  } = options;
  
  const db = await initializeDB();
  const cacheKey = url;
  const now = Date.now();
  
  // Check cache if not forced to refresh
  if (!forceRefresh) {
    try {
      const cachedResponse = await db.get('api-cache', cacheKey);
      
      // Return valid cache
      if (cachedResponse && cachedResponse.expires > now) {
        return cachedResponse.data as T;
      }
      
      // Return stale cache if configured and offline
      if (cachedResponse && staleWhileRevalidate && !isOnline()) {
        return cachedResponse.data as T;
      }
    } catch (err) {
      console.warn('Error reading from cache:', err);
    }
  }
  
  // Return stale cache if offline
  if (!isOnline()) {
    const cachedResponse = await db.get('api-cache', cacheKey);
    if (cachedResponse) {
      return cachedResponse.data as T;
    }
    throw new Error('No internet connection and no cached data available');
  }
  
  // Fetch fresh data
  try {
    // Prepare fetch with conditional headers if we have a cached response
    const cachedResponse = await db.get('api-cache', cacheKey);
    
    const fetchHeaders = new Headers(headers);
    
    // Add conditional headers if we have a cached response
    if (cachedResponse) {
      if (cachedResponse.etag) {
        fetchHeaders.set('If-None-Match', cachedResponse.etag);
      }
      if (cachedResponse.lastModified) {
        fetchHeaders.set('If-Modified-Since', cachedResponse.lastModified);
      }
    }
    
    const response = await fetch(url, {
      headers: fetchHeaders
    });
    
    // Handle 304 Not Modified - reuse cached data with updated expiry
    if (response.status === 304 && cachedResponse) {
      await db.put('api-cache', {
        ...cachedResponse,
        expires: now + ttl,
        lastUpdated: now
      });
      return cachedResponse.data as T;
    }
    
    // Process new response
    if (response.ok) {
      const data = await response.json();
      
      // Cache the response
      await db.put('api-cache', {
        url: cacheKey,
        data,
        expires: now + ttl,
        lastUpdated: now,
        etag: response.headers.get('ETag') || undefined,
        lastModified: response.headers.get('Last-Modified') || undefined
      });
      
      // Update cache stats
      updateCacheStats();
      
      return data as T;
    } else {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // If we failed to fetch but have a stale cached response, return it
    if (staleWhileRevalidate) {
      const cachedResponse = await db.get('api-cache', cacheKey);
      if (cachedResponse) {
        console.warn('Using stale cache due to fetch error:', error);
        return cachedResponse.data as T;
      }
    }
    throw error;
  }
};

/**
 * Cache a Blob asset (images, PDFs, etc.) for offline use
 */
export const cacheAsset = async (
  url: string,
  blob: Blob,
  options: CacheOptions = {}
): Promise<void> => {
  const { ttl = DEFAULT_CACHE_TTL } = options;
  const db = await initializeDB();
  const now = Date.now();
  
  await db.put('asset-cache', {
    url,
    blob,
    mimeType: blob.type,
    size: blob.size,
    expires: now + ttl,
    lastUpdated: now
  });
  
  // Update cache stats and cleanup if needed
  await updateCacheStats();
};

/**
 * Get a cached asset by URL
 */
export const getCachedAsset = async (
  url: string,
  options: CacheOptions = {}
): Promise<Blob | null> => {
  const { forceRefresh = false } = options;
  
  if (forceRefresh) return null;
  
  const db = await initializeDB();
  const cachedAsset = await db.get('asset-cache', url);
  
  if (!cachedAsset || cachedAsset.expires < Date.now()) {
    return null;
  }
  
  return cachedAsset.blob;
};

/**
 * Prefetch and cache multiple APIs in the background
 */
export const prefetchAPIs = async (
  urls: string[],
  options: CacheOptions = {}
): Promise<void> => {
  // Only prefetch when online
  if (!isOnline()) return;
  
  // Prefetch in parallel with low priority
  const prefetchPromises = urls.map(url => 
    fetchWithCache(url, { ...options, priority: 1 })
      .catch(err => console.warn(`Failed to prefetch ${url}:`, err))
  );
  
  // Don't await - this runs in the background
  Promise.all(prefetchPromises).then(() => 
    console.log(`Prefetched ${urls.length} APIs`)
  );
};

/**
 * Prefetch and cache multiple assets in the background
 */
export const prefetchAssets = async (
  urls: string[],
  options: CacheOptions = {}
): Promise<void> => {
  // Only prefetch when online
  if (!isOnline()) return;
  
  // Prefetch in parallel with low priority
  const prefetchPromises = urls.map(async url => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await cacheAsset(url, blob, options);
    } catch (err) {
      console.warn(`Failed to prefetch asset ${url}:`, err);
    }
  });
  
  // Don't await - this runs in the background
  Promise.all(prefetchPromises).then(() => 
    console.log(`Prefetched ${urls.length} assets`)
  );
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = async (): Promise<void> => {
  const db = await initializeDB();
  const now = Date.now();
  
  // Clear expired API cache
  const expiredApiTx = db.transaction('api-cache', 'readwrite');
  const expiredApiCursor = await expiredApiTx.store.index('by-expiry').openCursor();
  
  while (expiredApiCursor && expiredApiCursor.value.expires < now) {
    await expiredApiCursor.delete();
    await expiredApiCursor.continue();
  }
  
  // Clear expired asset cache
  const expiredAssetTx = db.transaction('asset-cache', 'readwrite');
  const expiredAssetCursor = await expiredAssetTx.store.index('by-expiry').openCursor();
  
  while (expiredAssetCursor && expiredAssetCursor.value.expires < now) {
    await expiredAssetCursor.delete();
    await expiredAssetCursor.continue();
  }
  
  // Update cache stats
  await updateCacheStats();
};

/**
 * Update cache metadata statistics
 */
const updateCacheStats = async (): Promise<void> => {
  const db = await initializeDB();
  
  // Get all asset sizes
  const assets = await db.getAll('asset-cache');
  const totalAssetSize = assets.reduce((total, asset) => total + asset.size, 0);
  
  // Estimate API response sizes (rough approximation)
  const apis = await db.getAll('api-cache');
  const totalApiSize = apis.reduce((total, api) => {
    const estimatedSize = JSON.stringify(api.data).length;
    return total + estimatedSize;
  }, 0);
  
  const totalSize = totalAssetSize + totalApiSize;
  
  // Update metadata
  const metadata = await db.get('cache-metadata', 'stats') || {
    key: 'stats',
    totalSize: 0,
    lastCleanup: Date.now(),
    maxSize: MAX_CACHE_SIZE,
    version: CACHE_DB_VERSION
  };
  
  await db.put('cache-metadata', {
    ...metadata,
    totalSize,
    lastCleanup: Date.now()
  });
  
  // Check if we need to clean up based on size
  if (totalSize > metadata.maxSize) {
    await cleanupCacheBySize(totalSize - metadata.maxSize);
  }
};

/**
 * Clean up cache to free up the specified amount of space
 */
const cleanupCacheBySize = async (bytesToFree: number): Promise<void> => {
  const db = await initializeDB();
  let freedBytes = 0;
  
  // Start with asset cache, sorted by size (smallest first)
  const assetTx = db.transaction('asset-cache', 'readwrite');
  const assetCursor = await assetTx.store.index('by-size').openCursor();
  
  while (assetCursor && freedBytes < bytesToFree) {
    const asset = assetCursor.value;
    
    // Skip high-priority items (future implementation)
    // For now, just delete based on size
    freedBytes += asset.size;
    await assetCursor.delete();
    await assetCursor.continue();
  }
  
  // If we still need to free up space, start clearing API cache
  // (only in extreme cases, as these are smaller)
  if (freedBytes < bytesToFree) {
    const apiTx = db.transaction('api-cache', 'readwrite');
    const apiCursor = await apiTx.store.openCursor();
    
    while (apiCursor && freedBytes < bytesToFree) {
      const api = apiCursor.value;
      const estimatedSize = JSON.stringify(api.data).length;
      
      freedBytes += estimatedSize;
      await apiCursor.delete();
      await apiCursor.continue();
    }
  }
  
  console.log(`Cleaned up ${(freedBytes / 1024 / 1024).toFixed(2)} MB from cache`);
};

/**
 * Clear all cached data
 */
export const clearAllCache = async (): Promise<void> => {
  const db = await initializeDB();
  
  await db.clear('api-cache');
  await db.clear('asset-cache');
  
  // Reset metadata stats
  const metadata = await db.get('cache-metadata', 'stats');
  if (metadata) {
    await db.put('cache-metadata', {
      ...metadata,
      totalSize: 0,
      lastCleanup: Date.now()
    });
  }
  
  console.log('All cache cleared');
};
