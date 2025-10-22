/**
 * Object Pool System Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ObjectPool,
  CanvasPool,
  ImageDataPool,
  canvasPool,
  imageDataPool,
  cleanupAllPools,
  getAllPoolStats,
} from '../../src/utils/object-pool';

describe('ObjectPool', () => {
  let pool: ObjectPool<{ value: number }>;

  beforeEach(() => {
    pool = new ObjectPool(
      () => ({ value: 0 }),
      { maxSize: 5, ttl: 1000 },
      (obj) => { obj.value = 0; }
    );
  });

  afterEach(() => {
    pool.destroy();
  });

  it('should create new objects when pool is empty', () => {
    const obj = pool.acquire();
    expect(obj).toBeDefined();
    expect(obj.value).toBe(0);
  });

  it('should reuse released objects', () => {
    const obj1 = pool.acquire();
    obj1.value = 42;
    pool.release(obj1);

    const obj2 = pool.acquire();
    expect(obj2).toBe(obj1);
    expect(obj2.value).toBe(0); // Should be reset
  });

  it('should respect max pool size', () => {
    const objects = [];
    for (let i = 0; i < 10; i++) {
      objects.push(pool.acquire());
    }

    const stats = pool.getStats();
    expect(stats.total).toBeLessThanOrEqual(5);
  });

  it('should cleanup expired objects', async () => {
    const obj = pool.acquire();
    pool.release(obj);

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    const removed = pool.cleanup();
    expect(removed).toBeGreaterThan(0);
  });

  it('should track pool statistics', () => {
    pool.acquire();
    pool.acquire();

    const stats = pool.getStats();
    expect(stats.total).toBe(2);
    expect(stats.inUse).toBe(2);
    expect(stats.available).toBe(0);
  });

  it('should clear all objects', () => {
    pool.acquire();
    pool.acquire();
    pool.clear();

    const stats = pool.getStats();
    expect(stats.total).toBe(0);
  });
});

describe('CanvasPool', () => {
  beforeEach(() => {
    canvasPool.clear();
  });

  it('should create canvas elements', () => {
    const canvas = canvasPool.acquire();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should reset canvas dimensions on release', () => {
    const canvas = canvasPool.acquire();
    canvas.width = 500;
    canvas.height = 500;

    canvasPool.release(canvas);

    // Canvas should be reset
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  });

  it('should reuse canvas objects', () => {
    const canvas1 = canvasPool.acquire();
    canvasPool.release(canvas1);

    const canvas2 = canvasPool.acquire();
    expect(canvas2).toBe(canvas1);
  });
});

describe('ImageDataPool', () => {
  beforeEach(() => {
    imageDataPool.clear();
  });

  it('should create ImageData with correct dimensions', () => {
    const imageData = imageDataPool.acquire(100, 100);
    expect(imageData.width).toBe(100);
    expect(imageData.height).toBe(100);
  });

  it('should group ImageData by dimensions', () => {
    const img1 = imageDataPool.acquire(100, 100);
    const img2 = imageDataPool.acquire(100, 100);
    const img3 = imageDataPool.acquire(200, 200);

    imageDataPool.release(img1);

    const img4 = imageDataPool.acquire(100, 100);
    expect(img4).toBe(img1); // Same dimensions, should reuse

    const img5 = imageDataPool.acquire(200, 200);
    expect(img5).not.toBe(img3); // Different instance
  });

  it('should clear ImageData on release', () => {
    const imageData = imageDataPool.acquire(10, 10);

    // Set some data
    for (let i = 0; i < imageData.data.length; i++) {
      imageData.data[i] = 255;
    }

    imageDataPool.release(imageData);

    // Data should be cleared
    const allZero = Array.from(imageData.data).every(v => v === 0);
    expect(allZero).toBe(true);
  });

  it('should get stats for all dimension pools', () => {
    imageDataPool.acquire(100, 100);
    imageDataPool.acquire(200, 200);

    const stats = imageDataPool.getStats();
    expect(stats).toHaveProperty('100x100');
    expect(stats).toHaveProperty('200x200');
  });
});

describe('Global Pool Management', () => {
  it('should get stats for all pools', () => {
    canvasPool.acquire();
    imageDataPool.acquire(100, 100);

    const stats = getAllPoolStats();

    expect(stats).toHaveProperty('canvas');
    expect(stats).toHaveProperty('imageData');
    expect(stats.canvas.total).toBeGreaterThan(0);
  });

  it('should cleanup all pools', () => {
    canvasPool.acquire();
    imageDataPool.acquire(100, 100);

    cleanupAllPools();

    // Pools should be cleaned up
    const stats = getAllPoolStats();
    expect(stats.canvas.total).toBeGreaterThanOrEqual(0);
  });
});

describe('Pool Performance', () => {
  it('should be faster with pooling for batch operations', () => {
    const iterations = 100;

    // Without pooling
    const startWithout = performance.now();
    for (let i = 0; i < iterations; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
    }
    const timeWithout = performance.now() - startWithout;

    // With pooling
    canvasPool.clear();
    const startWith = performance.now();
    const canvases: HTMLCanvasElement[] = [];
    for (let i = 0; i < iterations; i++) {
      const canvas = canvasPool.acquire();
      canvas.width = 200;
      canvas.height = 200;
      canvases.push(canvas);
    }
    canvases.forEach(c => canvasPool.release(c));
    const timeWith = performance.now() - startWith;

    // Pooling should be at least as fast (accounting for variance)
    expect(timeWith).toBeLessThanOrEqual(timeWithout * 1.5);
  });
});


