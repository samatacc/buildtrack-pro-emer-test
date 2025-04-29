/**
 * BuildTrack Pro Service Worker
 * 
 * Provides offline functionality, background syncing, and resource caching
 * for improved performance and reliability in field environments.
 * 
 * Features:
 * - Offline mode with background sync
 * - App shell caching for instant loading
 * - Strategic caching of API responses
 * - Precaching of critical assets
 * - Push notifications for field updates
 * 
 * Version: 1.0.0
 * Last updated: April 29, 2025
 */

const CACHE_VERSION = 'buildtrack-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-appshell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const API_CACHE = `${CACHE_VERSION}-api`;
const DOCUMENT_CACHE = `${CACHE_VERSION}-documents`;

// App Shell - critical files that make up the app's core
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/styles/main.css',
  '/js/bundle.js',
  '/js/vendor.js',
  '/images/logo.svg',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
];

// Critical assets to pre-cache
const CRITICAL_ASSETS = [
  '/images/backgrounds/dashboard-bg.jpg',
  '/images/placeholder-project.jpg',
  '/fonts/inter-var.woff2'
];

// Install event - cache the app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  // Cache app shell files
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching App Shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        // Pre-cache critical assets
        return caches.open(ASSET_CACHE)
          .then((cache) => {
            console.log('[Service Worker] Caching Critical Assets');
            return cache.addAll(CRITICAL_ASSETS);
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          // Delete any old caches that don't match our current version prefix
          if (key.indexOf(CACHE_VERSION) !== 0) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Different strategies for different types of requests
  
  // 1. API requests - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // 2. Document files - cache first, fallback to network
  if (url.pathname.startsWith('/documents/') || url.pathname.includes('.pdf')) {
    event.respondWith(handleDocumentRequest(event.request));
    return;
  }
  
  // 3. Static assets - cache first, fallback to network
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/styles/') ||
    url.pathname.includes('.jpg') ||
    url.pathname.includes('.png') ||
    url.pathname.includes('.svg') ||
    url.pathname.includes('.webp') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.js')
  ) {
    event.respondWith(handleAssetRequest(event.request));
    return;
  }
  
  // 4. HTML navigation - network first, fallback to app shell
  event.respondWith(handleNavigationRequest(event.request));
});

// Background sync for offline changes
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync', event.tag);
  
  if (event.tag === 'sync-pending-changes') {
    event.waitUntil(syncPendingChanges());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received');
  
  if (!event.data) {
    console.log('[Service Worker] No payload');
    return;
  }
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'BuildTrack Pro Update',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      datestamp: new Date().toISOString()
    },
    actions: data.actions || [
      { action: 'view', title: 'View' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'BuildTrack Pro', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        const url = event.notification.data?.url || '/';
        
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle API requests - network first, fallback to cache
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (request.method === 'GET' && networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(API_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, falling back to cache');
    
    // If network fails, try from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If this is a mutation (POST/PUT/DELETE), store for later sync
    if (request.method !== 'GET') {
      await saveForBackgroundSync(request);
      return new Response(JSON.stringify({ 
        status: 'offline',
        message: 'Your changes will be saved when you are back online' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If no cache and not a mutation, return a generic offline response
    return new Response(JSON.stringify({ 
      error: 'Network error', 
      offline: true,
      message: 'You are offline and this data is not cached' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle document requests - cache first, fallback to network
async function handleDocumentRequest(request) {
  // Try to get from cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(DOCUMENT_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // If no cache and network failed, return offline document placeholder
    if (request.headers.get('accept').includes('application/pdf')) {
      return caches.match('/offline-document.pdf');
    }
    
    // Generic error response
    return new Response('Document not available offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle asset requests - cache first, fallback to network
async function handleAssetRequest(request) {
  // Try to get from cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(ASSET_CACHE).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // For images, return a placeholder
    if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return caches.match('/images/placeholder.png');
    }
    
    // For other assets, return a minimal response
    return new Response('Asset not available offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle navigation requests - network first, fallback to app shell
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, falling back to app shell');
    
    // If network fails, try from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, return the offline page
    return caches.match('/offline.html');
  }
}

// Save request for background sync
async function saveForBackgroundSync(request) {
  try {
    // Create a record of the request for later syncing
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Array.from(request.headers.entries()),
      body: await request.clone().text(),
      timestamp: Date.now()
    };
    
    // Open the IndexedDB database
    const dbPromise = indexedDB.open('buildtrack-offline-requests', 1);
    
    dbPromise.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('requests', 'readwrite');
      const store = tx.objectStore('requests');
      
      store.add(requestData);
      
      // Register for background sync if supported
      if ('sync' in self.registration) {
        self.registration.sync.register('sync-pending-changes')
          .catch(err => console.error('Background sync registration failed:', err));
      }
    };
    
    dbPromise.onerror = (error) => {
      console.error('Error opening IndexedDB:', error);
    };
  } catch (error) {
    console.error('Error saving request for background sync:', error);
  }
}

// Sync pending changes when back online
async function syncPendingChanges() {
  try {
    // Open the IndexedDB database
    const dbPromise = indexedDB.open('buildtrack-offline-requests', 1);
    
    dbPromise.onsuccess = async (event) => {
      const db = event.target.result;
      const tx = db.transaction('requests', 'readwrite');
      const store = tx.objectStore('requests');
      
      // Get all pending requests
      const requests = await store.getAll();
      
      // Process each request
      for (const requestData of requests) {
        try {
          // Recreate the request
          const request = new Request(requestData.url, {
            method: requestData.method,
            headers: new Headers(requestData.headers),
            body: requestData.method !== 'GET' ? requestData.body : null
          });
          
          // Try to resend
          const response = await fetch(request);
          
          if (response.ok) {
            // If successful, remove from store
            store.delete(requestData.id);
            console.log('[Service Worker] Successfully synced:', requestData.url);
          } else {
            console.error('[Service Worker] Failed to sync:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('[Service Worker] Error syncing request:', error);
        }
      }
    };
    
    dbPromise.onerror = (error) => {
      console.error('[Service Worker] Error opening IndexedDB:', error);
    };
  } catch (error) {
    console.error('[Service Worker] Error syncing pending changes:', error);
    throw error; // Important: Let sync API know it failed so it can retry
  }
}
