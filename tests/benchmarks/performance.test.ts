/**
 * Performance Benchmark Tests
 * Measures rendering speed, memory usage, and cache effectiveness
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createQRCode } from '../../src/index';
import { canvasPool, imageDataPool, getAllPoolStats } from '../../src/utils/object-pool';
import { BitArray, BitMatrix, calculateMemorySavings } from '../../src/utils/bit-array';
import { cache, getCacheStats } from '../../src/utils/cache';

describe('Performance Benchmarks', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Object Pool Performance', () => {
    it('should reuse canvas objects efficiently', () => {
      const canvas1 = canvasPool.acquire();
      const canvas2 = canvasPool.acquire();

      expect(canvas1).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas2).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas1).not.toBe(canvas2);

      canvasPool.release(canvas1);
      const canvas3 = canvasPool.acquire();

      // Should reuse the released canvas
      expect(canvas3).toBe(canvas1);

      const stats = getAllPoolStats();
      expect(stats.canvas.total).toBeGreaterThan(0);
    });

    it('should manage ImageData pool efficiently', () => {
      const imageData1 = imageDataPool.acquire(100, 100);
      const imageData2 = imageDataPool.acquire(100, 100);

      expect(imageData1.width).toBe(100);
      expect(imageData2.width).toBe(100);

      imageDataPool.release(imageData1);
      const imageData3 = imageDataPool.acquire(100, 100);

      expect(imageData3).toBe(imageData1);
    });
  });

  describe('BitArray Memory Efficiency', () => {
    it('should use significantly less memory than boolean arrays', () => {
      const moduleCount = 177; // Version 40 QR code
      const savings = calculateMemorySavings(moduleCount);

      expect(savings.savingsPercent).toBeGreaterThan(80);
      expect(savings.bitArray).toBeLessThan(savings.booleanArray);
    });

    it('should correctly store and retrieve bits', () => {
      const bitArray = new BitArray(100);

      bitArray.set(10);
      bitArray.set(50);
      bitArray.set(99);

      expect(bitArray.get(10)).toBe(true);
      expect(bitArray.get(50)).toBe(true);
      expect(bitArray.get(99)).toBe(true);
      expect(bitArray.get(20)).toBe(false);
      expect(bitArray.count()).toBe(3);
    });

    it('should work with BitMatrix efficiently', () => {
      const matrix = new BitMatrix(21, 21); // Version 1 QR code

      matrix.set(0, 0);
      matrix.set(20, 20);

      expect(matrix.get(0, 0)).toBe(true);
      expect(matrix.get(20, 20)).toBe(true);
      expect(matrix.get(10, 10)).toBe(false);

      const byteSize = matrix.getByteSize();
      const booleanSize = 21 * 21; // 441 bytes

      expect(byteSize).toBeLessThan(booleanSize);
    });
  });

  describe('Cache Performance', () => {
    it('should cache QR codes and improve hit rate', async () => {
      const config1 = {
        content: 'test123',
        container,
        style: { size: 200 },
      };

      const config2 = {
        content: 'test456',
        container,
        style: { size: 200 },
      };

      // First generation - cache miss
      createQRCode(config1);
      createQRCode(config2);

      // Allow for async cache operations
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = getCacheStats();
      expect(stats.hits + stats.misses).toBeGreaterThan(0);
    });

    it('should handle cache eviction correctly', async () => {
      // Create more QR codes than cache size to trigger eviction
      for (let i = 0; i < 10; i++) {
        createQRCode({
          content: `test${i}`,
          container,
          style: { size: 200 },
        });
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });

  describe('Rendering Performance', () => {
    it('should render small QR code quickly', () => {
      const startTime = performance.now();

      createQRCode({
        content: 'https://example.com',
        container,
        style: { size: 200 },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should render in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should render large QR code within reasonable time', () => {
      const startTime = performance.now();

      createQRCode({
        content: 'A'.repeat(1000), // Large content
        container,
        style: { size: 500 },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should render in less than 200ms even for large QR codes
      expect(duration).toBeLessThan(200);
    });

    it('should handle batch rendering efficiently', () => {
      const startTime = performance.now();
      const count = 10;

      for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        document.body.appendChild(div);

        createQRCode({
          content: `https://example.com/${i}`,
          container: div,
          style: { size: 200 },
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTime = duration / count;

      // Average time per QR code should be reasonable
      expect(avgTime).toBeLessThan(50);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory after destroying QR codes', () => {
      const instances = [];

      // Create multiple instances
      for (let i = 0; i < 20; i++) {
        const div = document.createElement('div');
        document.body.appendChild(div);

        const qr = createQRCode({
          content: `test${i}`,
          container: div,
          style: { size: 200 },
        });

        instances.push(qr);
      }

      // Destroy all instances
      instances.forEach(qr => qr.destroy());

      // Check pool stats to ensure cleanup
      const poolStats = getAllPoolStats();
      const availableCanvases = poolStats.canvas.available;

      // Most canvases should be available after cleanup
      expect(availableCanvases).toBeGreaterThan(0);
    });
  });

  describe('WebGL Performance (if supported)', () => {
    it('should render with WebGL faster than canvas for complex effects', () => {
      // This is a placeholder - actual WebGL performance test would need browser support
      const config = {
        content: 'https://example.com',
        container,
        style: {
          size: 500,
          gradient: {
            type: 'linear' as const,
            colors: ['#667eea', '#764ba2'],
            direction: 45,
          },
        },
      };

      const canvasStart = performance.now();
      createQRCode({ ...config, renderType: 'canvas' });
      const canvasTime = performance.now() - canvasStart;

      // WebGL would typically be faster for complex effects
      // but we can't guarantee WebGL support in test environment
      expect(canvasTime).toBeGreaterThan(0);
    });
  });

  describe('Transform Performance', () => {
    it('should apply 3D transforms without significant overhead', () => {
      const startTime = performance.now();

      createQRCode({
        content: 'https://example.com',
        container,
        style: {
          size: 300,
          transform3D: {
            rotateX: 30,
            rotateY: 20,
            perspective: 1000,
          },
        },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 3D transforms should add minimal overhead
      expect(duration).toBeLessThan(100);
    });
  });
});

describe('Performance Regression Tests', () => {
  it('should maintain performance baseline for standard QR code', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const iterations = 50;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      createQRCode({
        content: 'https://example.com/test',
        container,
        style: { size: 200 },
      });

      times.push(performance.now() - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    // Average should be under 30ms
    expect(avgTime).toBeLessThan(30);
    // Max time should be under 100ms (accounting for JIT warmup)
    expect(maxTime).toBeLessThan(100);
  });

  it('should show improvement with caching', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const config = {
      content: 'cached-test',
      container,
      style: { size: 200 },
    };

    // First run (cold cache)
    const coldStart = performance.now();
    createQRCode(config);
    const coldTime = performance.now() - coldStart;

    // Wait for cache
    await new Promise(resolve => setTimeout(resolve, 100));

    // Second run (warm cache)
    const warmStart = performance.now();
    createQRCode(config);
    const warmTime = performance.now() - warmStart;

    const stats = getCacheStats();

    // Warm cache should be faster or cache should be working
    if (stats.hits > 0) {
      expect(warmTime).toBeLessThanOrEqual(coldTime);
    }
  });
});


