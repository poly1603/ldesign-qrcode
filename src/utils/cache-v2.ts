/**
 * Optimized QR Code Cache Manager V2
 * Integrates high-performance cache key generation
 */

import { generateCacheKey, LRUCache, FastCacheMap } from './cache-key';
import { MemoryEstimator } from './performance';

export interface CachedQRCode {
  dataURL: string;
  timestamp: number;
  hits: number;
  ttl?: number;
  size?: number;
  version?: string;
  memoryUsage?: number;
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
  totalMemory?: number;
}

export interface CacheConfig {
  maxSize?: number;
  maxMemoryMB?: number;
  defaultTTL?: number;
  enablePersistent?: boolean;
  persistentDBName?: string;
  cacheVersion?: string;
  enableWeakMap?: boolean;
  enableCompression?: boolean;
}

/**
 * Persistent cache using IndexedDB
 */
class PersistentCacheV2 {
  private dbName: string;
  private storeName = 'qrcodes';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(dbName: string = 'qrcode-cache-v2') {
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

      const request = indexedDB.open(this.dbName, 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Delete old store if exists
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }
        
        // Create new store with indices
        const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('hits', 'hits', { unique: false });
        store.createIndex('size', 'size', { unique: false });
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
        const request = store.put({ 
          key, 
          value, 
          timestamp: Date.now(),
          hits: value.hits || 0,
          size: value.size || 0
        });

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

  /**
   * Get items by index
   */
  async getByIndex(indexName: string, range?: IDBKeyRange, limit?: number): Promise<CachedQRCode[]> {
    try {
      await this.init();
      if (!this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index(indexName);
        const request = range ? index.openCursor(range) : index.openCursor();
        
        const results: CachedQRCode[] = [];
        let count = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && (!limit || count < limit)) {
            results.push(cursor.value.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }
}

/**
 * Optimized LRU Cache Manager for QR Codes V2
 */
export class QRCodeCacheManagerV2 {
  private memoryCache: LRUCache<CachedQRCode>;
  private weakCache: WeakMap<object, string> | null = null;
  private persistentCache: PersistentCacheV2 | null = null;
  private stats = {
    hits: 0,
    misses: 0,
    memoryHits: 0,
    persistentHits: 0,
    evictions: 0,
  };
  private config: Required<CacheConfig>;
  private currentMemoryUsage = 0;
  private maxMemoryBytes: number;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      maxMemoryMB: config.maxMemoryMB ?? 50,
      defaultTTL: config.defaultTTL ?? 60 * 60 * 1000,
      enablePersistent: config.enablePersistent ?? true,
      persistentDBName: config.persistentDBName ?? 'qrcode-cache-v2',
      cacheVersion: config.cacheVersion ?? '2.0',
      enableWeakMap: config.enableWeakMap ?? true,
      enableCompression: config.enableCompression ?? false,
    };

    this.maxMemoryBytes = this.config.maxMemoryMB * 1024 * 1024;
    this.memoryCache = new LRUCache<CachedQRCode>(this.config.maxSize);

    if (this.config.enableWeakMap) {
      this.weakCache = new WeakMap();
    }

    if (this.config.enablePersistent) {
      this.persistentCache = new PersistentCacheV2(this.config.persistentDBName);
    }
  }

  /**
   * Get cached QR code (with tiered caching)
   */
  async get(config: any): Promise<string | null> {
    const key = generateCacheKey(config);

    // L1: Memory cache (O(1) operation)
    const memCached = this.memoryCache.get(key);
    if (memCached && this.isValid(memCached)) {
      memCached.hits++;
      this.stats.hits++;
      this.stats.memoryHits++;
      return memCached.dataURL;
    }

    // L2: Persistent cache
    if (this.persistentCache) {
      try {
        const persistCached = await this.persistentCache.get(key);
        if (persistCached && this.isValid(persistCached)) {
          // Promote to memory cache if space available
          if (this.canFitInMemory(persistCached)) {
            this.memoryCache.set(key, persistCached);
            this.currentMemoryUsage += persistCached.memoryUsage || 0;
          }

          persistCached.hits++;
          this.stats.hits++;
          this.stats.persistentHits++;

          // Update persistent cache asynchronously
          this.persistentCache.set(key, persistCached).catch(() => {});

          return persistCached.dataURL;
        }
      } catch {
        // Fallthrough if persistent cache fails
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Get cached QR code synchronously (memory only)
   */
  getSync(config: any): string | null {
    const key = generateCacheKey(config);
    const cached = this.memoryCache.get(key);

    if (!cached || !this.isValid(cached)) {
      this.stats.misses++;
      return null;
    }

    cached.hits++;
    this.stats.hits++;
    this.stats.memoryHits++;

    return cached.dataURL;
  }

  /**
   * Set cached QR code
   */
  async set(config: any, dataURL: string, ttl?: number): Promise<void> {
    const key = generateCacheKey(config);

    const cachedItem: CachedQRCode = {
      dataURL,
      timestamp: Date.now(),
      hits: 0,
      ttl: ttl || this.config.defaultTTL,
      size: dataURL.length,
      version: this.config.cacheVersion,
      memoryUsage: this.estimateMemoryUsage(dataURL, config),
    };

    // Check memory limit before adding to memory cache
    if (this.canFitInMemory(cachedItem)) {
      // Check if we need to evict
      if (this.memoryCache.size() >= this.config.maxSize) {
        const evictedKey = this.memoryCache.keys()[0];
        const evicted = this.memoryCache.get(evictedKey);
        if (evicted) {
          this.currentMemoryUsage -= evicted.memoryUsage || 0;
          this.stats.evictions++;

          // Move to persistent cache
          if (this.persistentCache) {
            await this.persistentCache.set(evictedKey, evicted);
          }
        }
      }

      this.memoryCache.set(key, cachedItem);
      this.currentMemoryUsage += cachedItem.memoryUsage || 0;
    }

    // Always add to persistent cache if enabled
    if (this.persistentCache) {
      await this.persistentCache.set(key, cachedItem);
    }
  }

  /**
   * Check if cached item is valid
   */
  private isValid(cached: CachedQRCode): boolean {
    const now = Date.now();
    const age = now - cached.timestamp;
    const ttl = cached.ttl || this.config.defaultTTL;

    return age <= ttl && cached.version === this.config.cacheVersion;
  }

  /**
   * Check if item can fit in memory
   */
  private canFitInMemory(item: CachedQRCode): boolean {
    const itemSize = item.memoryUsage || 0;
    return this.currentMemoryUsage + itemSize <= this.maxMemoryBytes;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(dataURL: string, config: any): number {
    // Data URL size
    let memory = dataURL.length * 2; // UTF-16 in JavaScript

    // Estimate based on QR config
    if (config.style?.size) {
      const moduleCount = Math.ceil(config.style.size / 10); // Rough estimate
      memory += MemoryEstimator.estimate({
        moduleCount,
        renderType: config.renderType || 'canvas',
        hasLogo: !!config.logo,
        size: config.style.size,
      });
    }

    return memory;
  }

  /**
   * Clear cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.currentMemoryUsage = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      memoryHits: 0,
      persistentHits: 0,
      evictions: 0,
    };

    if (this.persistentCache) {
      await this.persistentCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.memoryCache.size(),
      maxSize: this.config.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      memoryHits: this.stats.memoryHits,
      persistentHits: this.stats.persistentHits,
      evictions: this.stats.evictions,
      totalMemory: this.currentMemoryUsage,
    };
  }

  /**
   * Prune expired entries
   */
  async pruneExpired(): Promise<number> {
    const now = Date.now();
    let pruned = 0;

    // Prune memory cache
    for (const key of this.memoryCache.keys()) {
      const cached = this.memoryCache.get(key);
      if (cached && !this.isValid(cached)) {
        this.memoryCache.delete(key);
        this.currentMemoryUsage -= cached.memoryUsage || 0;
        pruned++;
      }
    }

    // Prune persistent cache
    if (this.persistentCache) {
      // This would require iterating through all items
      // Implementation depends on specific needs
    }

    return pruned;
  }

  /**
   * Warm up cache with frequently used configs
   */
  async warmUp(configs: any[]): Promise<void> {
    if (!this.persistentCache) return;

    for (const config of configs) {
      const key = generateCacheKey(config);
      
      // Check if already in memory
      if (this.memoryCache.has(key)) continue;

      // Try to load from persistent
      const cached = await this.persistentCache.get(key);
      if (cached && this.isValid(cached) && this.canFitInMemory(cached)) {
        this.memoryCache.set(key, cached);
        this.currentMemoryUsage += cached.memoryUsage || 0;
      }
    }
  }
}

// Global optimized cache instance
export const globalCacheV2 = new QRCodeCacheManagerV2({
  maxSize: 100,
  maxMemoryMB: 50,
  defaultTTL: 60 * 60 * 1000,
  enablePersistent: true,
  cacheVersion: '2.0',
});

// Export convenience functions
export const getCachedQR = (config: any) => globalCacheV2.get(config);
export const setCachedQR = (config: any, dataURL: string, ttl?: number) => 
  globalCacheV2.set(config, dataURL, ttl);
export const clearQRCache = () => globalCacheV2.clear();
export const getQRCacheStats = () => globalCacheV2.getStats();