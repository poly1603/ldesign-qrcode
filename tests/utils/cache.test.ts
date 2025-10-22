/**
 * Cache System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  QRCodeCacheManager,
  getCacheStats,
  clearCacheSync,
} from '../../src/utils/cache';

describe('QRCodeCacheManager', () => {
  let cache: QRCodeCacheManager;

  beforeEach(() => {
    cache = new QRCodeCacheManager({
      maxSize: 5,
      defaultTTL: 1000,
      enablePersistent: false, // Disable for testing
    });
  });

  describe('Synchronous Operations', () => {
    it('should cache and retrieve data', () => {
      const config = { content: 'test', style: { size: 200 } };
      const dataURL = 'data:image/png;base64,test';

      cache.setSync(config, dataURL);
      const retrieved = cache.getSync(config);

      expect(retrieved).toBe(dataURL);
    });

    it('should return null for cache miss', () => {
      const config = { content: 'test', style: { size: 200 } };
      const retrieved = cache.getSync(config);

      expect(retrieved).toBeNull();
    });

    it('should track hits and misses', () => {
      const config = { content: 'test', style: { size: 200 } };
      const dataURL = 'data:image/png;base64,test';

      // Miss
      cache.getSync(config);

      // Set
      cache.setSync(config, dataURL);

      // Hit
      cache.getSync(config);
      cache.getSync(config);

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it('should calculate hit rate', () => {
      const config = { content: 'test', style: { size: 200 } };
      const dataURL = 'data:image/png;base64,test';

      cache.setSync(config, dataURL);

      cache.getSync(config); // hit
      cache.getSync(config); // hit
      cache.getSync({ content: 'other' }); // miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('should respect TTL', async () => {
      const config = { content: 'test', style: { size: 200 } };
      const dataURL = 'data:image/png;base64,test';

      cache.setSync(config, dataURL, 100); // 100ms TTL

      expect(cache.getSync(config)).toBe(dataURL);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cache.getSync(config)).toBeNull();
    });

    it('should evict oldest when at capacity', () => {
      for (let i = 0; i < 10; i++) {
        cache.setSync(
          { content: `test${i}`, style: { size: 200 } },
          `data:image/png;base64,${i}`
        );
      }

      const stats = cache.getStats();
      expect(stats.size).toBeLessThanOrEqual(5);
      expect(stats.evictions).toBeGreaterThan(0);
    });

    it('should update LRU on access', () => {
      const config1 = { content: 'test1' };
      const config2 = { content: 'test2' };
      const config3 = { content: 'test3' };

      cache.setSync(config1, 'data1');
      cache.setSync(config2, 'data2');
      cache.setSync(config3, 'data3');

      // Access config1 to make it most recently used
      cache.getSync(config1);

      // Add more to trigger eviction
      for (let i = 4; i < 10; i++) {
        cache.setSync({ content: `test${i}` }, `data${i}`);
      }

      // config1 should still be in cache (recently used)
      // config2 should be evicted (least recently used)
      expect(cache.getSync(config1)).toBeTruthy();
    });
  });

  describe('Cache Management', () => {
    it('should clear memory cache', () => {
      cache.setSync({ content: 'test1' }, 'data1');
      cache.setSync({ content: 'test2' }, 'data2');

      cache.clearMemory();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });

    it('should clean expired entries', async () => {
      cache.setSync({ content: 'test1' }, 'data1', 100);
      cache.setSync({ content: 'test2' }, 'data2', 100);

      await new Promise(resolve => setTimeout(resolve, 150));

      const removed = cache.cleanExpired();
      expect(removed).toBeGreaterThan(0);
    });

    it('should check if key exists', () => {
      const config = { content: 'test' };

      expect(cache.has(config)).toBe(false);

      cache.setSync(config, 'data');

      expect(cache.has(config)).toBe(true);
    });

    it('should return cache size', () => {
      cache.setSync({ content: 'test1' }, 'data1');
      cache.setSync({ content: 'test2' }, 'data2');

      expect(cache.size()).toBe(2);
    });
  });

  describe('Statistics', () => {
    it('should track memory hits separately', () => {
      const config = { content: 'test' };
      cache.setSync(config, 'data');

      cache.getSync(config);
      cache.getSync(config);

      const stats = cache.getStats();
      expect(stats.memoryHits).toBe(2);
    });

    it('should provide detailed statistics', () => {
      cache.setSync({ content: 'test1' }, 'data1');
      cache.getSync({ content: 'test2' }); // miss

      const stats = cache.getStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('memoryHits');
      expect(stats).toHaveProperty('evictions');
    });
  });
});

describe('Global Cache', () => {
  beforeEach(() => {
    clearCacheSync();
  });

  it('should get global cache stats', () => {
    const stats = getCacheStats();

    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
    expect(stats).toHaveProperty('hits');
    expect(stats).toHaveProperty('misses');
  });

  it('should clear global cache synchronously', () => {
    clearCacheSync();

    const stats = getCacheStats();
    expect(stats.size).toBe(0);
  });
});

describe('Cache Performance', () => {
  it('should be faster on cache hits', () => {
    const cache = new QRCodeCacheManager({ maxSize: 100 });
    const config = { content: 'test-performance' };
    const dataURL = 'data:image/png;base64,large-data-url-here';

    // Set in cache
    cache.setSync(config, dataURL);

    // Warm up
    cache.getSync(config);

    // Measure cache hit performance
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      cache.getSync(config);
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;

    // Should be very fast (< 0.1ms per lookup)
    expect(avgTime).toBeLessThan(0.1);
  });
});


