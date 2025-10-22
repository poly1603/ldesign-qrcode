/**
 * WebGL Renderer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WebGLRenderer, isWebGLSupported } from '../../src/renderers/webgl';
import { DotStyle } from '../../src/types';

describe('WebGL Renderer', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should detect WebGL support', () => {
    const supported = isWebGLSupported();
    expect(typeof supported).toBe('boolean');
  });

  describe('Rendering (if WebGL supported)', () => {
    it('should create WebGL renderer', () => {
      if (!isWebGLSupported()) {
        console.log('WebGL not supported, skipping test');
        return;
      }

      const renderer = new WebGLRenderer({
        content: 'https://example.com',
        style: { size: 200 },
      });

      expect(renderer).toBeDefined();
      expect(renderer.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should render with gradient', () => {
      if (!isWebGLSupported()) return;

      const renderer = new WebGLRenderer({
        content: 'https://example.com',
        style: {
          size: 300,
          gradient: {
            type: 'linear',
            colors: ['#667eea', '#764ba2'],
            direction: 45,
          },
        },
      });

      const canvas = renderer.getCanvas();
      expect(canvas.width).toBe(300);
      expect(canvas.height).toBe(300);
    });

    it('should support different dot styles', () => {
      if (!isWebGLSupported()) return;

      const styles = [
        DotStyle.Square,
        DotStyle.Rounded,
        DotStyle.Dots,
        DotStyle.Diamond,
      ];

      styles.forEach(dotStyle => {
        const renderer = new WebGLRenderer({
          content: 'test',
          style: { size: 200, dotStyle },
        });

        expect(renderer.getCanvas()).toBeDefined();
        renderer.destroy();
      });
    });

    it('should convert to data URL', () => {
      if (!isWebGLSupported()) return;

      const renderer = new WebGLRenderer({
        content: 'test',
        style: { size: 200 },
      });

      const dataURL = renderer.toDataURL('png');
      expect(dataURL).toMatch(/^data:image\/png/);

      const jpegURL = renderer.toDataURL('jpeg', 0.9);
      expect(jpegURL).toMatch(/^data:image\/jpeg/);
    });

    it('should update configuration', () => {
      if (!isWebGLSupported()) return;

      const renderer = new WebGLRenderer({
        content: 'initial',
        style: { size: 200 },
      });

      renderer.update({
        content: 'updated',
        style: { size: 300 },
      });

      const canvas = renderer.getCanvas();
      expect(canvas.width).toBe(300);
    });

    it('should cleanup resources on destroy', () => {
      if (!isWebGLSupported()) return;

      const renderer = new WebGLRenderer({
        content: 'test',
        style: { size: 200 },
      });

      const canvas = renderer.getCanvas();
      renderer.destroy();

      // Context should be lost
      const gl = canvas.getContext('webgl');
      expect(gl?.isContextLost()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      if (!isWebGLSupported()) return;

      const start = performance.now();

      const renderer = new WebGLRenderer({
        content: 'performance-test',
        style: { size: 500 },
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      renderer.destroy();
    });

    it('should handle complex gradients efficiently', () => {
      if (!isWebGLSupported()) return;

      const start = performance.now();

      const renderer = new WebGLRenderer({
        content: 'gradient-test',
        style: {
          size: 500,
          gradient: {
            type: 'radial',
            colors: ['#667eea', '#764ba2', '#f093fb'],
          },
        },
      });

      const duration = performance.now() - start;

      // Should be faster than 50ms even with complex gradient
      expect(duration).toBeLessThan(50);
      renderer.destroy();
    });
  });
});


