/**
 * Advanced Filter System for QR Code Rendering
 * Provides image processing filters and artistic effects
 */

export enum FilterType {
  None = 'none',
  Blur = 'blur',
  Sharpen = 'sharpen',
  EdgeDetect = 'edge-detect',
  Emboss = 'emboss',
  Grayscale = 'grayscale',
  Sepia = 'sepia',
  Invert = 'invert',
  Brightness = 'brightness',
  Contrast = 'contrast',
  Saturation = 'saturation',
  Hue = 'hue',
  Vintage = 'vintage',
  Sketch = 'sketch',
  Pixelate = 'pixelate',
}

export interface FilterConfig {
  type: FilterType;
  intensity?: number; // 0-1
  radius?: number; // for blur
  threshold?: number; // for edge detect, sketch
}

/**
 * Apply convolution filter
 */
function applyConvolution(
  imageData: ImageData,
  kernel: number[],
  divisor?: number,
  offset?: number
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const kSize = Math.sqrt(kernel.length);
  const half = Math.floor(kSize / 2);
  const div = divisor || kernel.reduce((sum, val) => sum + val, 0) || 1;
  const off = offset || 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = Math.min(Math.max(x + kx - half, 0), width - 1);
          const py = Math.min(Math.max(y + ky - half, 0), height - 1);
          const idx = (py * width + px) * 4;
          const k = kernel[ky * kSize + kx];

          r += data[idx] * k;
          g += data[idx + 1] * k;
          b += data[idx + 2] * k;
        }
      }

      const outIdx = (y * width + x) * 4;
      output.data[outIdx] = Math.min(Math.max(r / div + off, 0), 255);
      output.data[outIdx + 1] = Math.min(Math.max(g / div + off, 0), 255);
      output.data[outIdx + 2] = Math.min(Math.max(b / div + off, 0), 255);
      output.data[outIdx + 3] = data[outIdx + 3]; // preserve alpha
    }
  }

  return output;
}

/**
 * Blur filter
 */
export function applyBlur(imageData: ImageData, radius: number = 5): ImageData {
  const size = radius * 2 + 1;
  const kernel = new Array(size * size).fill(1);
  return applyConvolution(imageData, kernel);
}

/**
 * Sharpen filter
 */
export function applySharpen(imageData: ImageData, intensity: number = 1): ImageData {
  const center = 5 + intensity * 4;
  const kernel = [
    0, -1, 0,
    -1, center, -1,
    0, -1, 0,
  ];
  return applyConvolution(imageData, kernel, 1);
}

/**
 * Edge detection filter (Sobel)
 */
export function applyEdgeDetect(imageData: ImageData): ImageData {
  const kernelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1,
  ];

  const kernelY = [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1,
  ];

  const gradX = applyConvolution(imageData, kernelX, 1);
  const gradY = applyConvolution(imageData, kernelY, 1);

  const { width, height } = imageData;
  const output = new ImageData(width, height);

  for (let i = 0; i < gradX.data.length; i += 4) {
    const gx = gradX.data[i];
    const gy = gradY.data[i];
    const magnitude = Math.sqrt(gx * gx + gy * gy);

    output.data[i] = magnitude;
    output.data[i + 1] = magnitude;
    output.data[i + 2] = magnitude;
    output.data[i + 3] = 255;
  }

  return output;
}

/**
 * Emboss filter
 */
export function applyEmboss(imageData: ImageData): ImageData {
  const kernel = [
    -2, -1, 0,
    -1, 1, 1,
    0, 1, 2,
  ];
  return applyConvolution(imageData, kernel, 1, 128);
}

/**
 * Grayscale filter
 */
export function applyGrayscale(imageData: ImageData): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    output.data[i] = gray;
    output.data[i + 1] = gray;
    output.data[i + 2] = gray;
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * Sepia filter
 */
export function applySepia(imageData: ImageData, intensity: number = 1): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const tr = r * 0.393 + g * 0.769 + b * 0.189;
    const tg = r * 0.349 + g * 0.686 + b * 0.168;
    const tb = r * 0.272 + g * 0.534 + b * 0.131;

    output.data[i] = Math.min(r + (tr - r) * intensity, 255);
    output.data[i + 1] = Math.min(g + (tg - g) * intensity, 255);
    output.data[i + 2] = Math.min(b + (tb - b) * intensity, 255);
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * Invert colors filter
 */
export function applyInvert(imageData: ImageData): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    output.data[i] = 255 - data[i];
    output.data[i + 1] = 255 - data[i + 1];
    output.data[i + 2] = 255 - data[i + 2];
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * Brightness adjustment
 */
export function applyBrightness(imageData: ImageData, value: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;
  const adjustment = value * 255;

  for (let i = 0; i < data.length; i += 4) {
    output.data[i] = Math.min(Math.max(data[i] + adjustment, 0), 255);
    output.data[i + 1] = Math.min(Math.max(data[i + 1] + adjustment, 0), 255);
    output.data[i + 2] = Math.min(Math.max(data[i + 2] + adjustment, 0), 255);
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * Contrast adjustment
 */
export function applyContrast(imageData: ImageData, value: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;
  const factor = (259 * (value * 255 + 255)) / (255 * (259 - value * 255));

  for (let i = 0; i < data.length; i += 4) {
    output.data[i] = Math.min(Math.max(factor * (data[i] - 128) + 128, 0), 255);
    output.data[i + 1] = Math.min(Math.max(factor * (data[i + 1] - 128) + 128, 0), 255);
    output.data[i + 2] = Math.min(Math.max(factor * (data[i + 2] - 128) + 128, 0), 255);
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * RGB to HSL conversion
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [h, s, l];
}

/**
 * HSL to RGB conversion
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

/**
 * Saturation adjustment
 */
export function applySaturation(imageData: ImageData, value: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const newS = Math.min(Math.max(s + value, 0), 1);
    const [r, g, b] = hslToRgb(h, newS, l);

    output.data[i] = r;
    output.data[i + 1] = g;
    output.data[i + 2] = b;
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * Hue rotation
 */
export function applyHue(imageData: ImageData, rotation: number): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const newH = (h + rotation / 360) % 1;
    const [r, g, b] = hslToRgb(newH, s, l);

    output.data[i] = r;
    output.data[i + 1] = g;
    output.data[i + 2] = b;
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * Vintage/retro filter
 */
export function applyVintage(imageData: ImageData): ImageData {
  let output = applySepia(imageData, 0.6);
  output = applyContrast(output, 0.15);
  output = applyBrightness(output, -0.1);
  return output;
}

/**
 * Sketch filter
 */
export function applySketch(imageData: ImageData, threshold: number = 128): ImageData {
  let output = applyGrayscale(imageData);
  output = applyEdgeDetect(output);

  // Apply threshold
  const { data } = output;
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  return output;
}

/**
 * Pixelate filter
 */
export function applyPixelate(imageData: ImageData, pixelSize: number = 10): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);

  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Calculate average color in pixel block
      let r = 0, g = 0, b = 0, count = 0;

      for (let py = y; py < Math.min(y + pixelSize, height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, width); px++) {
          const idx = (py * width + px) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }

      r /= count;
      g /= count;
      b /= count;

      // Fill pixel block with average color
      for (let py = y; py < Math.min(y + pixelSize, height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, width); px++) {
          const idx = (py * width + px) * 4;
          output.data[idx] = r;
          output.data[idx + 1] = g;
          output.data[idx + 2] = b;
          output.data[idx + 3] = data[idx + 3];
        }
      }
    }
  }

  return output;
}

/**
 * Apply filter to canvas
 */
export function applyFilter(
  canvas: HTMLCanvasElement,
  config: FilterConfig
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let output = imageData;

  switch (config.type) {
    case FilterType.Blur:
      output = applyBlur(imageData, config.radius || 5);
      break;
    case FilterType.Sharpen:
      output = applySharpen(imageData, config.intensity || 1);
      break;
    case FilterType.EdgeDetect:
      output = applyEdgeDetect(imageData);
      break;
    case FilterType.Emboss:
      output = applyEmboss(imageData);
      break;
    case FilterType.Grayscale:
      output = applyGrayscale(imageData);
      break;
    case FilterType.Sepia:
      output = applySepia(imageData, config.intensity || 1);
      break;
    case FilterType.Invert:
      output = applyInvert(imageData);
      break;
    case FilterType.Brightness:
      output = applyBrightness(imageData, config.intensity || 0);
      break;
    case FilterType.Contrast:
      output = applyContrast(imageData, config.intensity || 0);
      break;
    case FilterType.Saturation:
      output = applySaturation(imageData, config.intensity || 0);
      break;
    case FilterType.Hue:
      output = applyHue(imageData, config.intensity || 0);
      break;
    case FilterType.Vintage:
      output = applyVintage(imageData);
      break;
    case FilterType.Sketch:
      output = applySketch(imageData, config.threshold || 128);
      break;
    case FilterType.Pixelate:
      output = applyPixelate(imageData, config.radius || 10);
      break;
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Chain multiple filters
 */
export function applyFilterChain(
  canvas: HTMLCanvasElement,
  configs: FilterConfig[]
): void {
  for (const config of configs) {
    applyFilter(canvas, config);
  }
}


