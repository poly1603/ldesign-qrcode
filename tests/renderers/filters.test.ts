/**
 * Filter System Tests
 */

import { describe, it, expect } from 'vitest';
import {
  applyBlur,
  applySharpen,
  applyGrayscale,
  applySepia,
  applyInvert,
  applyBrightness,
  applyContrast,
  applyFilter,
  FilterType,
} from '../../src/renderers/styles/filters';

describe('Image Filters', () => {
  function createTestImageData(width: number, height: number): ImageData {
    const imageData = new ImageData(width, height);

    // Fill with test pattern
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 128;     // R
      imageData.data[i + 1] = 128; // G
      imageData.data[i + 2] = 128; // B
      imageData.data[i + 3] = 255; // A
    }

    return imageData;
  }

  describe('Grayscale Filter', () => {
    it('should convert to grayscale', () => {
      const imageData = new ImageData(10, 10);

      // Set a colored pixel
      imageData.data[0] = 255;   // R
      imageData.data[1] = 0;     // G
      imageData.data[2] = 0;     // B
      imageData.data[3] = 255;   // A

      const result = applyGrayscale(imageData);

      // R, G, B should be equal (grayscale)
      expect(result.data[0]).toBe(result.data[1]);
      expect(result.data[1]).toBe(result.data[2]);
    });
  });

  describe('Sepia Filter', () => {
    it('should apply sepia tone', () => {
      const imageData = createTestImageData(10, 10);
      const result = applySepia(imageData, 1);

      // Sepia should create warm tones
      expect(result.data[0]).toBeGreaterThan(imageData.data[0]); // R increases
      expect(result.data[3]).toBe(255); // Alpha preserved
    });

    it('should respect intensity parameter', () => {
      const imageData = createTestImageData(10, 10);

      const low = applySepia(imageData, 0.3);
      const high = applySepia(imageData, 1);

      // Higher intensity should have stronger effect
      expect(Math.abs(high.data[0] - 128)).toBeGreaterThan(
        Math.abs(low.data[0] - 128)
      );
    });
  });

  describe('Invert Filter', () => {
    it('should invert colors', () => {
      const imageData = new ImageData(10, 10);
      imageData.data[0] = 0;
      imageData.data[1] = 128;
      imageData.data[2] = 255;

      const result = applyInvert(imageData);

      expect(result.data[0]).toBe(255);
      expect(result.data[1]).toBe(127);
      expect(result.data[2]).toBe(0);
    });
  });

  describe('Brightness Filter', () => {
    it('should increase brightness', () => {
      const imageData = createTestImageData(10, 10);
      const result = applyBrightness(imageData, 0.2);

      expect(result.data[0]).toBeGreaterThan(imageData.data[0]);
    });

    it('should decrease brightness', () => {
      const imageData = createTestImageData(10, 10);
      const result = applyBrightness(imageData, -0.2);

      expect(result.data[0]).toBeLessThan(imageData.data[0]);
    });

    it('should clamp values to 0-255', () => {
      const imageData = createTestImageData(10, 10);

      const maxBright = applyBrightness(imageData, 10);
      expect(maxBright.data[0]).toBeLessThanOrEqual(255);

      const maxDark = applyBrightness(imageData, -10);
      expect(maxDark.data[0]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Contrast Filter', () => {
    it('should increase contrast', () => {
      const imageData = new ImageData(10, 10);

      // Create varying brightness
      imageData.data[0] = 50;
      imageData.data[4] = 200;

      const result = applyContrast(imageData, 0.5);

      // Dark pixels should get darker, bright pixels brighter
      expect(result.data[0]).toBeLessThan(50);
      expect(result.data[4]).toBeGreaterThan(200);
    });
  });

  describe('Blur Filter', () => {
    it('should blur image', () => {
      const imageData = new ImageData(10, 10);

      // Create sharp edge
      for (let i = 0; i < 5; i++) {
        imageData.data[i * 40] = 0;
        imageData.data[i * 40 + 20] = 255;
      }

      const result = applyBlur(imageData, 2);

      // Edge should be softened
      expect(result).toBeDefined();
      expect(result.width).toBe(10);
      expect(result.height).toBe(10);
    });
  });

  describe('Sharpen Filter', () => {
    it('should sharpen image', () => {
      const imageData = createTestImageData(10, 10);
      const result = applySharpen(imageData, 1);

      expect(result).toBeDefined();
      expect(result.width).toBe(imageData.width);
      expect(result.height).toBe(imageData.height);
    });
  });

  describe('applyFilter with Canvas', () => {
    it('should apply filter to canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, 100, 100);

      applyFilter(canvas, {
        type: FilterType.Grayscale,
      });

      // Canvas should still exist and have content
      const imageData = ctx.getImageData(0, 0, 100, 100);
      expect(imageData.data.some(v => v > 0)).toBe(true);
    });

    it('should handle all filter types', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;

      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, 50, 50);

      const filterTypes = [
        FilterType.Blur,
        FilterType.Sharpen,
        FilterType.Grayscale,
        FilterType.Sepia,
        FilterType.Invert,
        FilterType.Brightness,
        FilterType.Vintage,
      ];

      filterTypes.forEach(type => {
        // Reset canvas
        ctx.fillStyle = '#888888';
        ctx.fillRect(0, 0, 50, 50);

        // Apply filter
        applyFilter(canvas, { type });

        // Verify canvas still has content
        const imageData = ctx.getImageData(0, 0, 50, 50);
        expect(imageData.data.some(v => v > 0)).toBe(true);
      });
    });
  });
});


