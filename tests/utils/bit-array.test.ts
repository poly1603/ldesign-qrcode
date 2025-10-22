/**
 * BitArray and BitMatrix Tests
 */

import { describe, it, expect } from 'vitest';
import { BitArray, BitMatrix, calculateMemorySavings } from '../../src/utils/bit-array';

describe('BitArray', () => {
  it('should create bit array with correct length', () => {
    const bitArray = new BitArray(100);
    expect(bitArray.getLength()).toBe(100);
  });

  it('should set and get bits correctly', () => {
    const bitArray = new BitArray(100);

    bitArray.set(10);
    bitArray.set(50);
    bitArray.set(99);

    expect(bitArray.get(10)).toBe(true);
    expect(bitArray.get(50)).toBe(true);
    expect(bitArray.get(99)).toBe(true);
    expect(bitArray.get(20)).toBe(false);
  });

  it('should clear bits correctly', () => {
    const bitArray = new BitArray(100);

    bitArray.set(10);
    expect(bitArray.get(10)).toBe(true);

    bitArray.clear(10);
    expect(bitArray.get(10)).toBe(false);
  });

  it('should toggle bits', () => {
    const bitArray = new BitArray(100);

    expect(bitArray.get(10)).toBe(false);
    bitArray.toggle(10);
    expect(bitArray.get(10)).toBe(true);
    bitArray.toggle(10);
    expect(bitArray.get(10)).toBe(false);
  });

  it('should count set bits', () => {
    const bitArray = new BitArray(100);

    bitArray.set(10);
    bitArray.set(20);
    bitArray.set(30);

    expect(bitArray.count()).toBe(3);
  });

  it('should handle clearAll', () => {
    const bitArray = new BitArray(100);

    bitArray.set(10);
    bitArray.set(20);
    bitArray.clearAll();

    expect(bitArray.count()).toBe(0);
  });

  it('should handle setAll', () => {
    const bitArray = new BitArray(100);

    bitArray.setAll();

    expect(bitArray.count()).toBe(100);
  });

  it('should clone correctly', () => {
    const bitArray = new BitArray(100);
    bitArray.set(10);
    bitArray.set(20);

    const clone = bitArray.clone();

    expect(clone.get(10)).toBe(true);
    expect(clone.get(20)).toBe(true);
    expect(clone.count()).toBe(2);

    // Modifying clone should not affect original
    clone.set(30);
    expect(clone.count()).toBe(3);
    expect(bitArray.count()).toBe(2);
  });

  it('should convert to and from boolean array', () => {
    const boolArray = [true, false, true, false, true];
    const bitArray = BitArray.fromArray(boolArray);

    expect(bitArray.get(0)).toBe(true);
    expect(bitArray.get(1)).toBe(false);
    expect(bitArray.get(4)).toBe(true);

    const converted = bitArray.toArray();
    expect(converted).toEqual(boolArray);
  });

  it('should throw on out of bounds access', () => {
    const bitArray = new BitArray(10);

    expect(() => bitArray.set(10)).toThrow();
    expect(() => bitArray.get(-1)).toThrow();
    expect(() => bitArray.clear(100)).toThrow();
  });

  it('should use minimal byte size', () => {
    const bitArray = new BitArray(100);
    const byteSize = bitArray.getByteSize();

    // 100 bits = 13 bytes (ceiling of 100/8)
    expect(byteSize).toBe(13);
  });
});

describe('BitMatrix', () => {
  it('should create matrix with correct dimensions', () => {
    const matrix = new BitMatrix(21, 21);
    expect(matrix.getWidth()).toBe(21);
    expect(matrix.getHeight()).toBe(21);
  });

  it('should set and get values correctly', () => {
    const matrix = new BitMatrix(21, 21);

    matrix.set(10, 10);
    matrix.set(15, 15);

    expect(matrix.get(10, 10)).toBe(true);
    expect(matrix.get(15, 15)).toBe(true);
    expect(matrix.get(5, 5)).toBe(false);
  });

  it('should handle 2D operations', () => {
    const matrix = new BitMatrix(10, 10);

    matrix.set(5, 5);
    expect(matrix.get(5, 5)).toBe(true);

    matrix.clear(5, 5);
    expect(matrix.get(5, 5)).toBe(false);

    matrix.toggle(5, 5);
    expect(matrix.get(5, 5)).toBe(true);
  });

  it('should count set bits', () => {
    const matrix = new BitMatrix(10, 10);

    matrix.set(1, 1);
    matrix.set(2, 2);
    matrix.set(3, 3);

    expect(matrix.count()).toBe(3);
  });

  it('should clone correctly', () => {
    const matrix = new BitMatrix(10, 10);
    matrix.set(5, 5);

    const clone = matrix.clone();
    expect(clone.get(5, 5)).toBe(true);

    clone.set(6, 6);
    expect(matrix.get(6, 6)).toBe(false);
    expect(clone.get(6, 6)).toBe(true);
  });

  it('should convert to and from 2D array', () => {
    const boolArray = [
      [true, false, true],
      [false, true, false],
      [true, false, true],
    ];

    const matrix = BitMatrix.fromArray(boolArray);

    expect(matrix.get(0, 0)).toBe(true);
    expect(matrix.get(1, 1)).toBe(true);
    expect(matrix.get(0, 1)).toBe(false);

    const converted = matrix.toArray();
    expect(converted).toEqual(boolArray);
  });

  it('should handle regions', () => {
    const matrix = new BitMatrix(10, 10);

    matrix.set(2, 2);
    matrix.set(3, 3);
    matrix.set(4, 4);

    const region = matrix.getRegion(2, 2, 3, 3);

    expect(region.get(0, 0)).toBe(true);
    expect(region.get(1, 1)).toBe(true);
    expect(region.get(2, 2)).toBe(true);
  });

  it('should set regions', () => {
    const matrix = new BitMatrix(10, 10);
    const region = new BitMatrix(3, 3);

    region.set(1, 1);
    matrix.setRegion(5, 5, region);

    expect(matrix.get(6, 6)).toBe(true);
  });

  it('should throw on out of bounds access', () => {
    const matrix = new BitMatrix(10, 10);

    expect(() => matrix.set(10, 10)).toThrow();
    expect(() => matrix.get(-1, 5)).toThrow();
  });

  it('should use minimal memory', () => {
    const matrix = new BitMatrix(21, 21);
    const byteSize = matrix.getByteSize();

    // 21x21 = 441 bits = 56 bytes (ceiling of 441/8)
    expect(byteSize).toBe(56);

    // Compare to boolean array: 441 bytes
    expect(byteSize).toBeLessThan(441);
  });
});

describe('calculateMemorySavings', () => {
  it('should calculate savings for Version 1', () => {
    const savings = calculateMemorySavings(21);

    expect(savings.booleanArray).toBe(441);
    expect(savings.bitArray).toBe(56);
    expect(savings.savings).toBe(385);
    expect(savings.savingsPercent).toBeCloseTo(87.3, 1);
  });

  it('should calculate savings for Version 40', () => {
    const savings = calculateMemorySavings(177);

    expect(savings.booleanArray).toBe(31329);
    expect(savings.bitArray).toBe(3917);
    expect(savings.savings).toBe(27412);
    expect(savings.savingsPercent).toBeCloseTo(87.5, 1);
  });

  it('should show increasing savings for larger matrices', () => {
    const v1 = calculateMemorySavings(21);
    const v10 = calculateMemorySavings(57);
    const v40 = calculateMemorySavings(177);

    // All should save ~87%
    expect(v1.savingsPercent).toBeGreaterThan(85);
    expect(v10.savingsPercent).toBeGreaterThan(85);
    expect(v40.savingsPercent).toBeGreaterThan(85);

    // Absolute savings should increase
    expect(v40.savings).toBeGreaterThan(v10.savings);
    expect(v10.savings).toBeGreaterThan(v1.savings);
  });
});

describe('Pool Integration', () => {
  afterEach(() => {
    cleanupAllPools();
  });

  it('should manage multiple pool types', () => {
    const canvas = canvasPool.acquire();
    const imageData = imageDataPool.acquire(100, 100);

    const stats = getAllPoolStats();

    expect(stats.canvas.total).toBeGreaterThan(0);
    expect(Object.keys(stats.imageData).length).toBeGreaterThan(0);
  });

  it('should cleanup all pools at once', () => {
    canvasPool.acquire();
    imageDataPool.acquire(100, 100);

    cleanupAllPools();

    const stats = getAllPoolStats();
    expect(stats).toBeDefined();
  });
});


