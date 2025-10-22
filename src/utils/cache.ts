/**
 * QR Code Cache Manager with LRU strategy and IndexedDB persistence
 */

export interface CachedQRCode {
  dataURL: string;
  timestamp: number;
  hits: number;
  ttl?: number;
  size?: number;
  version?: string;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryHits?: number;
  persistentHits?: number;
  evictions?: number;
}

export interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  enablePersistent?: boolean;
  persistentDBName?: string;
  cacheVersion?: string;
  enableWeakMap?: boolean;
}

/**
 * Persistent cache using IndexedDB
 */
class PersistentCache {
  private dbName: string;
  private storeName = 'qrcodes';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(dbName: string = 'qrcode-cache') {
    this.dbName = dbName;
  }

  /**
   * Initialize IndexedDB
   */
  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get cached item
   */
  async get(key: string): Promise<CachedQRCode | null> {
    try {
      await this.init();
      if (!this.db) return null;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  /**
   * Set cached item
   */
  async set(key: string, value: CachedQRCode): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ key, value, timestamp: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Silently fail if IndexedDB unavailable
    }
  }

  /**
   * Delete cached item
   */
  async delete(key: string): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Clear all cached items
   */
  async clear(): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Silently fail
    }
  }
}

/**
 * LRU Cache Manager for QR Codes with tiered caching
 */
export class QRCodeCacheManager {
  private cache: Map<string, CachedQRCode> = new Map();
  private weakCache: WeakMap<object, string> | null = null;
  private lruQueue: string[] = [];
  private maxSize: number;
  private defaultTTL: number;
  private hits = 0;
  private misses = 0;
  private memoryHits = 0;
  private persistentHits = 0;
  private evictions = 0;
  private persistentCache: PersistentCache | null = null;
  private cacheVersion: string;

  constructor(config: CacheConfig = {}) {
    this.maxSize = config.maxSize ?? 100;
    this.defaultTTL = config.defaultTTL ?? 60 * 60 * 1000;
    this.cacheVersion = config.cacheVersion ?? '1.0';

    if (config.enableWeakMap !== false) {
      this.weakCache = new WeakMap();
    }

    if (config.enablePersistent) {
      this.persistentCache = new PersistentCache(config.persistentDBName);
    }
  }

  /**
   * Generate cache key from config
   */
  private generateKey(config: any): string {
    return JSON.stringify(config);
  }

  /**
   * Get cached QR code (with tiered caching)
   */
  async get(config: any): Promise<string | null> {
    const key = this.generateKey(config);

    // L1: Memory cache
    const memCached = this.cache.get(key);
    if (memCached) {
      const now = Date.now();
      const age = now - memCached.timestamp;
      const ttl = memCached.ttl || this.defaultTTL;

      if (age <= ttl) {
        // Update LRU
        this.lruQueue = this.lruQueue.filter(k => k !== key);
        this.lruQueue.push(key);

        // Update stats
        memCached.hits++;
        this.hits++;
        this.memoryHits++;

        return memCached.dataURL;
      } else {
        // Expired, remove
        this.cache.delete(key);
        this.lruQueue = this.lruQueue.filter(k => k !== key);
      }
    }

    // L2: Persistent cache (IndexedDB)
    if (this.persistentCache) {
      try {
        const persistCached = await this.persistentCache.get(key);
        if (persistCached) {
          const now = Date.now();
          const age = now - persistCached.timestamp;
          const ttl = persistCached.ttl || this.defaultTTL;

          if (age <= ttl && persistCached.version === this.cacheVersion) {
            // Promote to memory cache
            this.cache.set(key, persistCached);
            this.lruQueue.push(key);

            // Update stats
            persistCached.hits++;
            this.hits++;
            this.persistentHits++;

            // Update persistent cache with new hit count
            await this.persistentCache.set(key, persistCached);

            return persistCached.dataURL;
          } else {
            // Expired or wrong version, remove
            await this.persistentCache.delete(key);
          }
        }
      } catch {
        // Fallthrough if persistent cache fails
      }
    }

    this.misses++;
    return null;
  }

  /**
   * Get cached QR code synchronously (memory only)
   */
  getSync(config: any): string | null {
    const key = this.generateKey(config);
    const cached = this.cache.get(key);

    if (!cached) {
      this.misses++;
      return null;
    }

    // Check TTL
    const now = Date.now();
    const age = now - cached.timestamp;
    const ttl = cached.ttl || this.defaultTTL;

    if (age > ttl) {
      this.cache.delete(key);
      this.lruQueue = this.lruQueue.filter(k => k !== key);
      this.misses++;
      return null;
    }

    // Update LRU
    this.lruQueue = this.lruQueue.filter(k => k !== key);
    this.lruQueue.push(key);

    // Update stats
    cached.hits++;
    this.hits++;
    this.memoryHits++;

    return cached.dataURL;
  }

  /**
   * Set cached QR code
   */
  async set(config: any, dataURL: string, ttl?: number): Promise<void> {
    const key = this.generateKey(config);

    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldest = this.lruQueue.shift();
      if (oldest) {
        const evicted = this.cache.get(oldest);
        this.cache.delete(oldest);
        this.evictions++;

        // Move evicted to persistent cache if enabled
        if (this.persistentCache && evicted) {
          try {
            await this.persistentCache.set(oldest, evicted);
          } catch {
            // Ignore persistent cache errors
          }
        }
      }
    }

    const cachedItem: CachedQRCode = {
      dataURL,
      timestamp: Date.now(),
      hits: 0,
      ttl,
      size: dataURL.length,
      version: this.cacheVersion,
    };

    // Add to memory cache
    this.cache.set(key, cachedItem);

    // Update LRU
    this.lruQueue = this.lruQueue.filter(k => k !== key);
    this.lruQueue.push(key);

    // Also add to persistent cache if enabled
    if (this.persistentCache) {
      try {
        await this.persistentCache.set(key, cachedItem);
      } catch {
        // Ignore persistent cache errors
      }
    }
  }

  /**
   * Set cached QR code synchronously (memory only)
   */
  setSync(config: any, dataURL: string, ttl?: number): void {
    const key = this.generateKey(config);

    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldest = this.lruQueue.shift();
      if (oldest) {
        this.cache.delete(oldest);
        this.evictions++;
      }
    }

    // Add to cache
    this.cache.set(key, {
      dataURL,
      timestamp: Date.now(),
      hits: 0,
      ttl,
      size: dataURL.length,
      version: this.cacheVersion,
    });

    // Update LRU
    this.lruQueue = this.lruQueue.filter(k => k !== key);
    this.lruQueue.push(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.lruQueue = [];
    this.hits = 0;
    this.misses = 0;
    this.memoryHits = 0;
    this.persistentHits = 0;
    this.evictions = 0;

    if (this.persistentCache) {
      try {
        await this.persistentCache.clear();
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Clear memory cache only
   */
  clearMemory(): void {
    this.cache.clear();
    this.lruQueue = [];
  }

  /**
   * Remove expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, cached] of this.cache.entries()) {
      const age = now - cached.timestamp;
      const ttl = cached.ttl || this.defaultTTL;

      if (age > ttl) {
        this.cache.delete(key);
        this.lruQueue = this.lruQueue.filter(k => k !== key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      memoryHits: this.memoryHits,
      persistentHits: this.persistentHits,
      evictions: this.evictions,
    };
  }

  /**
   * Preload cache with predicted entries
   */
  async preload(configs: any[]): Promise<void> {
    // This would be called with predicted/common configs
    // For now, just a placeholder for future ML-based prediction
    for (const config of configs) {
      const key = this.generateKey(config);
      if (!this.cache.has(key) && this.persistentCache) {
        try {
          const cached = await this.persistentCache.get(key);
          if (cached) {
            this.cache.set(key, cached);
            this.lruQueue.push(key);
          }
        } catch {
          // Ignore errors
        }
      }
    }
  }

  /**
   * Check if key exists in cache
   */
  has(config: any): boolean {
    const key = this.generateKey(config);
    return this.cache.has(key);
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Global cache instance with persistent storage enabled
const globalCache = new QRCodeCacheManager({
  maxSize: 100,
  defaultTTL: 60 * 60 * 1000,
  enablePersistent: true,
  enableWeakMap: true,
  cacheVersion: '2.0',
});

export function enableCache(enabled: boolean = true): void {
  if (!enabled) {
    globalCache.clearMemory();
  }
}

export async function clearCache(): Promise<void> {
  await globalCache.clear();
}

export function clearCacheSync(): void {
  globalCache.clearMemory();
}

export function getCacheStats(): CacheStats {
  return globalCache.getStats();
}

export async function preloadCache(configs: any[]): Promise<void> {
  await globalCache.preload(configs);
}

export { globalCache as cache };
export default QRCodeCacheManager;

