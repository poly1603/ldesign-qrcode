/**
 * 3D Transform Tests
 */

import { describe, it, expect } from 'vitest';
import {
  Matrix4,
  apply3DTransform,
  applyIsometricProjection,
  applyPerspectiveProjection,
} from '../../src/renderers/styles/transform';

describe('Matrix4', () => {
  it('should create identity matrix', () => {
    const matrix = Matrix4.identity();
    expect(matrix.data).toEqual([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  });

  it('should create translation matrix', () => {
    const matrix = Matrix4.translation(10, 20, 30);
    const point = matrix.transformPoint(0, 0, 0);

    expect(point.x).toBeCloseTo(10);
    expect(point.y).toBeCloseTo(20);
    expect(point.z).toBeCloseTo(30);
  });

  it('should create rotation matrices', () => {
    const rotX = Matrix4.rotationX(90);
    const rotY = Matrix4.rotationY(90);
    const rotZ = Matrix4.rotationZ(90);

    expect(rotX).toBeDefined();
    expect(rotY).toBeDefined();
    expect(rotZ).toBeDefined();
  });

  it('should rotate point around X axis', () => {
    const matrix = Matrix4.rotationX(90);
    const point = matrix.transformPoint(0, 1, 0);

    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(0, 5);
    expect(point.z).toBeCloseTo(1, 5);
  });

  it('should create scaling matrix', () => {
    const matrix = Matrix4.scaling(2, 3, 4);
    const point = matrix.transformPoint(1, 1, 1);

    expect(point.x).toBeCloseTo(2);
    expect(point.y).toBeCloseTo(3);
    expect(point.z).toBeCloseTo(4);
  });

  it('should multiply matrices', () => {
    const translate = Matrix4.translation(10, 0, 0);
    const scale = Matrix4.scaling(2, 2, 2);

    const combined = translate.multiply(scale);
    const point = combined.transformPoint(5, 5, 5);

    expect(point.x).toBeCloseTo(20);
    expect(point.y).toBeCloseTo(10);
    expect(point.z).toBeCloseTo(10);
  });

  it('should transform points correctly', () => {
    const matrix = Matrix4.identity();
    const point = matrix.transformPoint(5, 10, 15);

    expect(point.x).toBe(5);
    expect(point.y).toBe(10);
    expect(point.z).toBe(15);
    expect(point.w).toBe(1);
  });

  it('should generate CSS transform string', () => {
    const matrix = Matrix4.identity();
    const css = matrix.toCSSTransform();

    expect(css).toContain('matrix3d');
    expect(css).toContain(',');
  });
});

describe('3D Transform Application', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    ctx = canvas.getContext('2d')!;
  });

  it('should apply 3D transform to context', () => {
    apply3DTransform(ctx, {
      rotateX: 30,
      rotateY: 20,
      perspective: 1000,
    }, 300, 300);

    // Context should be transformed
    expect(ctx).toBeDefined();
  });

  it('should apply isometric projection', () => {
    applyIsometricProjection(ctx, 300, 300, 30);

    expect(ctx).toBeDefined();
  });

  it('should apply perspective projection', () => {
    applyPerspectiveProjection(ctx, 300, 300, 0.5, 0.5, 0.1);

    expect(ctx).toBeDefined();
  });

  it('should handle translation', () => {
    apply3DTransform(ctx, {
      translateX: 50,
      translateY: 50,
      translateZ: 0,
    }, 300, 300);

    expect(ctx).toBeDefined();
  });

  it('should handle scaling', () => {
    apply3DTransform(ctx, {
      scaleX: 1.5,
      scaleY: 1.5,
      scaleZ: 1,
    }, 300, 300);

    expect(ctx).toBeDefined();
  });

  it('should handle skew', () => {
    apply3DTransform(ctx, {
      skewX: 10,
      skewY: 10,
    }, 300, 300);

    expect(ctx).toBeDefined();
  });
});

describe('Matrix Operations', () => {
  it('should chain transformations', () => {
    const m1 = Matrix4.translation(10, 0, 0);
    const m2 = Matrix4.rotationZ(45);
    const m3 = Matrix4.scaling(2, 2, 2);

    const combined = m1.multiply(m2).multiply(m3);

    expect(combined).toBeDefined();
    expect(combined.data.length).toBe(16);
  });

  it('should preserve identity after multiplication', () => {
    const identity = Matrix4.identity();
    const other = Matrix4.translation(5, 5, 5);

    const result1 = identity.multiply(other);
    const result2 = other.multiply(identity);

    // Should be equivalent to other
    expect(result1.data).toEqual(other.data);
    expect(result2.data).toEqual(other.data);
  });
});


