/**
 * 3D Transform System for QR Code Rendering
 * Provides perspective transformation, rotation, and advanced effects
 */

export interface Transform3DConfig {
  // Rotation
  rotateX?: number; // degrees
  rotateY?: number; // degrees
  rotateZ?: number; // degrees

  // Perspective
  perspective?: number; // perspective distance (px)
  perspectiveOriginX?: number; // 0-1
  perspectiveOriginY?: number; // 0-1

  // Scale
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;

  // Translate
  translateX?: number; // px
  translateY?: number; // px
  translateZ?: number; // px

  // Skew
  skewX?: number; // degrees
  skewY?: number; // degrees

  // Lighting
  lightSource?: { x: number; y: number; z: number };
  ambientLight?: number; // 0-1
  diffuseLight?: number; // 0-1
}

/**
 * 4x4 transformation matrix
 */
export class Matrix4 {
  public data: number[];

  constructor(data?: number[]) {
    this.data = data || [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  }

  /**
   * Create identity matrix
   */
  static identity(): Matrix4 {
    return new Matrix4();
  }

  /**
   * Create translation matrix
   */
  static translation(x: number, y: number, z: number): Matrix4 {
    return new Matrix4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1,
    ]);
  }

  /**
   * Create X rotation matrix
   */
  static rotationX(angleInDegrees: number): Matrix4 {
    const angle = angleInDegrees * Math.PI / 180;
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Matrix4([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ]);
  }

  /**
   * Create Y rotation matrix
   */
  static rotationY(angleInDegrees: number): Matrix4 {
    const angle = angleInDegrees * Math.PI / 180;
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Matrix4([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ]);
  }

  /**
   * Create Z rotation matrix
   */
  static rotationZ(angleInDegrees: number): Matrix4 {
    const angle = angleInDegrees * Math.PI / 180;
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Matrix4([
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  /**
   * Create scaling matrix
   */
  static scaling(x: number, y: number, z: number): Matrix4 {
    return new Matrix4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    ]);
  }

  /**
   * Create perspective projection matrix
   */
  static perspective(fov: number, near: number, far: number): Matrix4 {
    const f = 1 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    return new Matrix4([
      f, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0,
    ]);
  }

  /**
   * Multiply two matrices
   */
  multiply(other: Matrix4): Matrix4 {
    const a = this.data;
    const b = other.data;
    const result = new Array(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] =
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }

    return new Matrix4(result);
  }

  /**
   * Transform a point
   */
  transformPoint(x: number, y: number, z: number = 0): { x: number; y: number; z: number; w: number } {
    const m = this.data;
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];

    return {
      x: (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
      y: (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
      z: (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
      w,
    };
  }

  /**
   * Get CSS 3D transform string
   */
  toCSSTransform(): string {
    const m = this.data;
    return `matrix3d(${m.join(',')})`;
  }
}

/**
 * Apply 3D transform to canvas using context transformation
 */
export function apply3DTransform(
  ctx: CanvasRenderingContext2D,
  config: Transform3DConfig,
  width: number,
  height: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  // Save context state
  ctx.save();

  // Move to center
  ctx.translate(centerX, centerY);

  // Build transformation matrix
  let matrix = Matrix4.identity();

  // Apply translation
  if (config.translateX || config.translateY || config.translateZ) {
    matrix = matrix.multiply(
      Matrix4.translation(
        config.translateX || 0,
        config.translateY || 0,
        config.translateZ || 0
      )
    );
  }

  // Apply rotation
  if (config.rotateX) {
    matrix = matrix.multiply(Matrix4.rotationX(config.rotateX));
  }
  if (config.rotateY) {
    matrix = matrix.multiply(Matrix4.rotationY(config.rotateY));
  }
  if (config.rotateZ) {
    matrix = matrix.multiply(Matrix4.rotationZ(config.rotateZ));
  }

  // Apply scaling
  if (config.scaleX || config.scaleY || config.scaleZ) {
    matrix = matrix.multiply(
      Matrix4.scaling(
        config.scaleX || 1,
        config.scaleY || 1,
        config.scaleZ || 1
      )
    );
  }

  // For 2D canvas, we need to project 3D to 2D
  // This is a simplified projection
  const perspective = config.perspective || 1000;
  const scale = perspective / (perspective + (config.translateZ || 0));

  // Apply the 2D projection
  ctx.scale(scale, scale);

  // Apply skew
  if (config.skewX || config.skewY) {
    const skewXRad = (config.skewX || 0) * Math.PI / 180;
    const skewYRad = (config.skewY || 0) * Math.PI / 180;
    ctx.transform(1, Math.tan(skewYRad), Math.tan(skewXRad), 1, 0, 0);
  }

  // Move back
  ctx.translate(-centerX, -centerY);
}

/**
 * Calculate lighting for a surface
 */
export function calculateLighting(
  normal: { x: number; y: number; z: number },
  lightSource: { x: number; y: number; z: number },
  ambientLight: number = 0.3,
  diffuseLight: number = 0.7
): number {
  // Normalize normal vector
  const nLength = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
  const nx = normal.x / nLength;
  const ny = normal.y / nLength;
  const nz = normal.z / nLength;

  // Normalize light direction
  const lLength = Math.sqrt(lightSource.x ** 2 + lightSource.y ** 2 + lightSource.z ** 2);
  const lx = lightSource.x / lLength;
  const ly = lightSource.y / lLength;
  const lz = lightSource.z / lLength;

  // Calculate dot product (cosine of angle)
  const dotProduct = Math.max(0, nx * lx + ny * ly + nz * lz);

  // Combine ambient and diffuse lighting
  return ambientLight + diffuseLight * dotProduct;
}

/**
 * Apply 3D transform with lighting to canvas
 */
export function apply3DTransformWithLighting(
  ctx: CanvasRenderingContext2D,
  config: Transform3DConfig,
  width: number,
  height: number
): void {
  apply3DTransform(ctx, config, width, height);

  // Apply lighting if configured
  if (config.lightSource) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Calculate surface normal (simplified - assumes flat surface)
    const normal = { x: 0, y: 0, z: 1 };

    // Apply rotation to normal
    if (config.rotateX || config.rotateY || config.rotateZ) {
      let matrix = Matrix4.identity();

      if (config.rotateX) matrix = matrix.multiply(Matrix4.rotationX(config.rotateX));
      if (config.rotateY) matrix = matrix.multiply(Matrix4.rotationY(config.rotateY));
      if (config.rotateZ) matrix = matrix.multiply(Matrix4.rotationZ(config.rotateZ));

      const transformed = matrix.transformPoint(normal.x, normal.y, normal.z);
      normal.x = transformed.x;
      normal.y = transformed.y;
      normal.z = transformed.z;
    }

    const lighting = calculateLighting(
      normal,
      config.lightSource,
      config.ambientLight,
      config.diffuseLight
    );

    // Apply lighting to image data
    for (let i = 0; i < data.length; i += 4) {
      data[i] *= lighting;
      data[i + 1] *= lighting;
      data[i + 2] *= lighting;
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

/**
 * Create isometric projection
 */
export function applyIsometricProjection(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angle: number = 30
): void {
  apply3DTransform(ctx, {
    rotateX: angle,
    rotateZ: 45,
  }, width, height);
}

/**
 * Create perspective projection
 */
export function applyPerspectiveProjection(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  vanishingPointX: number = 0.5,
  vanishingPointY: number = 0.5,
  depth: number = 0.1
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Apply perspective using setTransform
  const vpx = (vanishingPointX - 0.5) * depth;
  const vpy = (vanishingPointY - 0.5) * depth;

  ctx.transform(1, vpy, vpx, 1, 0, 0);
  ctx.translate(-centerX, -centerY);
}

/**
 * Apply shadow projection (like object casting shadow)
 */
export function applyShadowProjection(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  angle: number = 45,
  distance: number = 20,
  blur: number = 10,
  opacity: number = 0.3
): void {
  const { width, height } = sourceCanvas;

  ctx.save();

  // Calculate shadow offset
  const angleRad = angle * Math.PI / 180;
  const offsetX = Math.cos(angleRad) * distance;
  const offsetY = Math.sin(angleRad) * distance;

  // Draw shadow
  ctx.globalAlpha = opacity;
  ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(sourceCanvas, offsetX, offsetY);

  ctx.restore();

  // Draw original on top
  ctx.drawImage(sourceCanvas, 0, 0);
}

/**
 * Apply depth of field effect
 */
export function applyDepthOfField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  focalPoint: number = 0.5,
  focalRange: number = 0.2,
  maxBlur: number = 10
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);

  // Clear original
  ctx.clearRect(0, 0, width, height);

  // Draw with varying blur based on distance from focal point
  for (let y = 0; y < height; y++) {
    const distance = Math.abs(y / height - focalPoint);
    const blur = distance > focalRange
      ? Math.min((distance - focalRange) / (1 - focalRange) * maxBlur, maxBlur)
      : 0;

    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
    } else {
      ctx.filter = 'none';
    }

    ctx.drawImage(tempCanvas, 0, y, width, 1, 0, y, width, 1);
  }

  ctx.filter = 'none';
}


