/**
 * Object Pool for Canvas, ImageData, and other reusable objects
 * Reduces memory allocation overhead and GC pressure
 */

export interface PoolOptions {
  /** Maximum pool size */
  maxSize?: number;
  /** Time to live in milliseconds */
  ttl?: number;
  /** Enable automatic cleanup */
  autoCleanup?: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval?: number;
}

export interface PooledObject<T> {
  object: T;
  timestamp: number;
  inUse: boolean;
}

/**
 * Generic object pool implementation
 */
export class ObjectPool<T> {
  private pool: PooledObject<T>[] = [];
  private factory: () => T;
  private reset?: (obj: T) => void;
  private maxSize: number;
  private ttl: number;
  private cleanupTimer?: number;

  constructor(
    factory: () => T,
    options: PoolOptions = {},
    reset?: (obj: T) => void
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = options.maxSize ?? 50;
    this.ttl = options.ttl ?? 5 * 60 * 1000; // 5 minutes default

    if (options.autoCleanup !== false) {
      const interval = options.cleanupInterval ?? 60 * 1000; // 1 minute
      this.cleanupTimer = window.setInterval(() => this.cleanup(), interval);
    }
  }

  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    // Find available object
    const available = this.pool.find(item => !item.inUse);

    if (available) {
      available.inUse = true;
      available.timestamp = Date.now();
      return available.object;
    }

    // Create new object if pool not at max
    if (this.pool.length < this.maxSize) {
      const obj = this.factory();
      this.pool.push({
        object: obj,
        timestamp: Date.now(),
        inUse: true,
      });
      return obj;
    }

    // Pool exhausted, create temporary object (not pooled)
    console.warn(`Object pool exhausted (max: ${this.maxSize}), creating temporary object`);
    return this.factory();
  }

  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    const pooled = this.pool.find(item => item.object === obj);

    if (pooled) {
      pooled.inUse = false;
      pooled.timestamp = Date.now();

      // Reset object state if reset function provided
      if (this.reset) {
        this.reset(obj);
      }
    }
  }

  /**
   * Clean up expired objects
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    this.pool = this.pool.filter(item => {
      if (!item.inUse && (now - item.timestamp > this.ttl)) {
        removed++;
        return false;
      }
      return true;
    });

    return removed;
  }

  /**
   * Clear entire pool
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const inUse = this.pool.filter(item => item.inUse).length;
    return {
      total: this.pool.length,
      inUse,
      available: this.pool.length - inUse,
      maxSize: this.maxSize,
    };
  }

  /**
   * Destroy pool and cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * Canvas Pool - reuse canvas elements
 */
export class CanvasPool extends ObjectPool<HTMLCanvasElement> {
  constructor(options: PoolOptions = {}) {
    super(
      () => document.createElement('canvas'),
      options,
      (canvas) => {
        // Reset canvas state
        canvas.width = 0;
        canvas.height = 0;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    );
  }
}

/**
 * OffscreenCanvas Pool - for better performance
 */
export class OffscreenCanvasPool extends ObjectPool<OffscreenCanvas> {
  constructor(options: PoolOptions = {}) {
    super(
      () => new OffscreenCanvas(1, 1),
      options,
      (canvas) => {
        canvas.width = 1;
        canvas.height = 1;
      }
    );
  }

  /**
   * Check if OffscreenCanvas is supported
   */
  static isSupported(): boolean {
    return typeof OffscreenCanvas !== 'undefined';
  }
}

/**
 * ImageData Pool - reuse ImageData objects
 */
export class ImageDataPool {
  private pools: Map<string, ObjectPool<ImageData>> = new Map();

  /**
   * Get pool key from dimensions
   */
  private getKey(width: number, height: number): string {
    return `${width}x${height}`;
  }

  /**
   * Acquire ImageData with specific dimensions
   */
  acquire(width: number, height: number): ImageData {
    const key = this.getKey(width, height);

    if (!this.pools.has(key)) {
      this.pools.set(key, new ObjectPool(
        () => new ImageData(width, height),
        { maxSize: 10 },
        (imageData) => {
          // Clear ImageData
          imageData.data.fill(0);
        }
      ));
    }

    return this.pools.get(key)!.acquire();
  }

  /**
   * Release ImageData back to pool
   */
  release(imageData: ImageData): void {
    const key = this.getKey(imageData.width, imageData.height);
    const pool = this.pools.get(key);

    if (pool) {
      pool.release(imageData);
    }
  }

  /**
   * Clear all ImageData pools
   */
  clear(): void {
    this.pools.forEach(pool => pool.clear());
    this.pools.clear();
  }

  /**
   * Get statistics for all pools
   */
  getStats() {
    const stats: Record<string, any> = {};
    this.pools.forEach((pool, key) => {
      stats[key] = pool.getStats();
    });
    return stats;
  }
}

/**
 * Path2D Pool - for SVG rendering optimization
 */
export class Path2DPool extends ObjectPool<Path2D> {
  constructor(options: PoolOptions = {}) {
    super(
      () => new Path2D(),
      options,
      () => {
        // Path2D doesn't have a reset method, return new instance
      }
    );
  }

  /**
   * Check if Path2D is supported
   */
  static isSupported(): boolean {
    return typeof Path2D !== 'undefined';
  }
}

// Global pool instances
export const canvasPool = new CanvasPool({ maxSize: 20 });
export const imageDataPool = new ImageDataPool();
export const path2DPool = Path2DPool.isSupported() ? new Path2DPool({ maxSize: 30 }) : null;
export const offscreenCanvasPool = OffscreenCanvasPool.isSupported()
  ? new OffscreenCanvasPool({ maxSize: 15 })
  : null;

/**
 * Cleanup all pools
 */
export function cleanupAllPools(): void {
  canvasPool.cleanup();
  imageDataPool.clear();
  path2DPool?.cleanup();
  offscreenCanvasPool?.cleanup();
}

/**
 * Get statistics for all pools
 */
export function getAllPoolStats() {
  return {
    canvas: canvasPool.getStats(),
    imageData: imageDataPool.getStats(),
    path2D: path2DPool?.getStats() ?? null,
    offscreenCanvas: offscreenCanvasPool?.getStats() ?? null,
  };
}


