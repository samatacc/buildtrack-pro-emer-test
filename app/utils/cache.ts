/**
 * Simple in-memory cache utility
 * Used to cache generated images and other expensive operations
 */

interface CacheEntry<T> {
  value: T;
  expiry: number | null; // Timestamp in milliseconds, null for no expiry
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to store
   * @param ttlSeconds - Time-to-live in seconds (optional, default: no expiry)
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if the entry has expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Remove a value from the cache
   * @param key - The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all values from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   */
  get size(): number {
    // Clean up expired entries before returning the size
    this.cleanup();
    return this.cache.size;
  }

  /**
   * Remove all expired entries from the cache
   * @private
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry && now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const cache = new Cache();
