/**
 * Optimized cache key generator using hash functions
 * Replaces JSON.stringify for better performance
 */

/**
 * Simple hash function for strings
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Serialize object to a stable string representation
 * Faster than JSON.stringify for known structures
 */
function serializeObject(obj: any): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  
  const type = typeof obj;
  
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    return `[${obj.map(serializeObject).join(',')}]`;
  }
  
  if (type === 'object') {
    const keys = Object.keys(obj).sort();
    const pairs = keys.map(key => `${key}:${serializeObject(obj[key])}`);
    return `{${pairs.join(',')}}`;
  }
  
  return String(obj);
}

/**
 * Generate cache key from QR code configuration
 * Optimized for QRCodeConfig structure
 */
export function generateCacheKey(config: any): string {
  // Fast path for simple configs
  if (typeof config === 'string') {
    return `qr_${hashString(config)}`;
  }
  
  // Extract important fields for cache key
  const keyParts: string[] = [];
  
  // Content is the most important
  if (config.content) {
    keyParts.push(`c:${hashString(config.content)}`);
  }
  
  // Error correction level
  if (config.errorCorrectionLevel) {
    keyParts.push(`e:${config.errorCorrectionLevel}`);
  }
  
  // Render type
  if (config.renderType) {
    keyParts.push(`r:${config.renderType}`);
  }
  
  // Style configuration (hash the entire style object)
  if (config.style) {
    const styleStr = serializeObject(config.style);
    keyParts.push(`s:${hashString(styleStr)}`);
  }
  
  // Logo configuration
  if (config.logo) {
    const logoStr = serializeObject(config.logo);
    keyParts.push(`l:${hashString(logoStr)}`);
  }
  
  // Type number
  if (config.typeNumber !== undefined) {
    keyParts.push(`t:${config.typeNumber}`);
  }
  
  // Mask pattern
  if (config.maskPattern !== undefined) {
    keyParts.push(`m:${config.maskPattern}`);
  }
  
  return `qr_${keyParts.join('_')}`;
}

/**
 * Fast hash map implementation for cache keys
 * Uses string hashing for O(1) lookups
 */
export class FastCacheMap<T> {
  private buckets: Map<number, Map<string, T>>;
  private size: number = 0;
  
  constructor() {
    this.buckets = new Map();
  }
  
  /**
   * Get value by key
   */
  get(key: string): T | undefined {
    const hash = hashString(key);
    const bucket = this.buckets.get(hash);
    return bucket?.get(key);
  }
  
  /**
   * Set value by key
   */
  set(key: string, value: T): void {
    const hash = hashString(key);
    
    if (!this.buckets.has(hash)) {
      this.buckets.set(hash, new Map());
    }
    
    const bucket = this.buckets.get(hash)!;
    
    if (!bucket.has(key)) {
      this.size++;
    }
    
    bucket.set(key, value);
  }
  
  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const hash = hashString(key);
    const bucket = this.buckets.get(hash);
    return bucket?.has(key) || false;
  }
  
  /**
   * Delete by key
   */
  delete(key: string): boolean {
    const hash = hashString(key);
    const bucket = this.buckets.get(hash);
    
    if (bucket?.delete(key)) {
      this.size--;
      
      if (bucket.size === 0) {
        this.buckets.delete(hash);
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Clear all entries
   */
  clear(): void {
    this.buckets.clear();
    this.size = 0;
  }
  
  /**
   * Get size
   */
  getSize(): number {
    return this.size;
  }
  
  /**
   * Get all entries
   */
  entries(): Array<[string, T]> {
    const result: Array<[string, T]> = [];
    
    for (const bucket of this.buckets.values()) {
      for (const [key, value] of bucket.entries()) {
        result.push([key, value]);
      }
    }
    
    return result;
  }
}

/**
 * LRU cache implementation with O(1) operations
 */
export class LRUCache<T> {
  private cache: Map<string, T>;
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  /**
   * Get value and move to front (most recently used)
   */
  get(key: string): T | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to front
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  /**
   * Set value and move to front
   */
  set(key: string, value: T): void {
    // Remove if exists (to reorder)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Add to front (end of Map)
    this.cache.set(key, value);
  }
  
  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Delete entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Get all keys (ordered by LRU)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/**
 * Cache key validator
 */
export class CacheKeyValidator {
  /**
   * Validate cache key format
   */
  static isValid(key: string): boolean {
    return key.startsWith('qr_') && key.length > 3;
  }
  
  /**
   * Extract content hash from cache key
   */
  static extractContentHash(key: string): string | null {
    const match = key.match(/c:(-?\d+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Compare two cache keys for similarity
   */
  static similarity(key1: string, key2: string): number {
    const parts1 = key1.split('_');
    const parts2 = key2.split('_');
    
    let matches = 0;
    const totalParts = Math.max(parts1.length, parts2.length);
    
    for (let i = 0; i < totalParts; i++) {
      if (parts1[i] === parts2[i]) {
        matches++;
      }
    }
    
    return matches / totalParts;
  }
}