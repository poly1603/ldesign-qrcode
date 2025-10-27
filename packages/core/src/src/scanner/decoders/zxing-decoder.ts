/**
 * ZXing-based barcode decoder
 * Supports QR codes and multiple barcode formats
 */

export interface DecodeResult {
  data: string;
  format: BarcodeFormat;
  location?: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  confidence?: number;
}

export enum BarcodeFormat {
  QR_CODE = 'QR_CODE',
  CODE_128 = 'CODE_128',
  CODE_39 = 'CODE_39',
  EAN_13 = 'EAN_13',
  EAN_8 = 'EAN_8',
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',
  DATA_MATRIX = 'DATA_MATRIX',
  PDF_417 = 'PDF_417',
  AZTEC = 'AZTEC',
  CODABAR = 'CODABAR',
}

// Type definition for BarcodeDetector (experimental API)
declare class BarcodeDetector {
  constructor(options?: { formats?: string[] });
  static getSupportedFormats(): Promise<string[]>;
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
  cornerPoints?: Array<{ x: number; y: number }>;
}

/**
 * Multi-format decoder using native BarcodeDetector API
 */
export class MultiFormatDecoder {
  private detector: BarcodeDetector | null = null;
  private supportedFormats: BarcodeFormat[] = [];

  constructor(formats?: BarcodeFormat[]) {
    this.initialize(formats);
  }

  /**
   * Initialize barcode detector
   */
  private async initialize(formats?: BarcodeFormat[]): Promise<void> {
    if (typeof BarcodeDetector === 'undefined') {
      console.warn('BarcodeDetector API not available');
      return;
    }

    try {
      // Check supported formats
      const supported = await BarcodeDetector.getSupportedFormats();
      this.supportedFormats = supported as BarcodeFormat[];

      // Create detector with requested formats
      const requestedFormats = formats || this.supportedFormats;
      const formatsToUse = requestedFormats.filter(f =>
        this.supportedFormats.includes(f)
      );

      if (formatsToUse.length > 0) {
        this.detector = new BarcodeDetector({
          formats: formatsToUse as unknown as string[]
        });
      }
    } catch (error) {
      console.error('Failed to initialize BarcodeDetector:', error);
    }
  }

  /**
   * Decode barcode from image source
   */
  async decode(
    imageSource: ImageBitmapSource
  ): Promise<DecodeResult[]> {
    if (!this.detector) {
      throw new Error('BarcodeDetector not available');
    }

    try {
      const barcodes = await this.detector.detect(imageSource);

      return barcodes.map((barcode: DetectedBarcode) => ({
        data: barcode.rawValue,
        format: barcode.format as BarcodeFormat,
        location: barcode.cornerPoints ? {
          topLeft: barcode.cornerPoints[0],
          topRight: barcode.cornerPoints[1],
          bottomRight: barcode.cornerPoints[2],
          bottomLeft: barcode.cornerPoints[3],
        } : undefined,
      }));
    } catch (error) {
      console.error('Decode error:', error);
      return [];
    }
  }

  /**
   * Decode from canvas
   */
  async decodeFromCanvas(canvas: HTMLCanvasElement): Promise<DecodeResult[]> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return this.decode(imageData);
  }

  /**
   * Decode from video frame
   */
  async decodeFromVideo(video: HTMLVideoElement): Promise<DecodeResult[]> {
    return this.decode(video);
  }

  /**
   * Check if a format is supported
   */
  isFormatSupported(format: BarcodeFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  /**
   * Get all supported formats
   */
  getSupportedFormats(): BarcodeFormat[] {
    return [...this.supportedFormats];
  }

  /**
   * Check if API is available
   */
  static isSupported(): boolean {
    return typeof BarcodeDetector !== 'undefined';
  }
}

/**
 * Fallback decoder for browsers without BarcodeDetector API
 * Uses image processing to detect and decode QR codes
 */
export class FallbackDecoder {
  /**
   * Simple QR code detection using edge detection
   * NOTE: This is a placeholder - real implementation would require full QR decoding
   */
  async decode(_imageData: ImageData): Promise<DecodeResult | null> {
    // Simplified implementation - real QR decoding would be much more complex
    // Real implementation would:
    // 1. Convert to grayscale
    // 2. Find finder patterns (1:1:3:1:1 ratio)
    // 3. Locate alignment patterns
    // 4. Extract and decode data modules
    // 5. Apply error correction

    console.warn('FallbackDecoder.decode() is a placeholder - use native BarcodeDetector API when available');
    return null;
  }

  /* Helper methods for future implementation
  private toGrayscale(imageData: ImageData): Uint8ClampedArray {
    const { data, width, height } = imageData;
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return gray;
  }

  private findFinderPatterns(gray: Uint8ClampedArray): Array<{ x: number; y: number }> {
    // Ratio-based detection (1:1:3:1:1)
    const patterns: Array<{ x: number; y: number }> = [];
    return patterns;
  }
  */
}

/**
 * Auto-detecting decoder that uses native API when available,
 * falls back to software decoder otherwise
 */
export class AutoDecoder {
  private nativeDecoder: MultiFormatDecoder | null = null;
  private fallbackDecoder: FallbackDecoder | null = null;
  private useNative: boolean = false;

  constructor(formats?: BarcodeFormat[]) {
    if (MultiFormatDecoder.isSupported()) {
      this.nativeDecoder = new MultiFormatDecoder(formats);
      this.useNative = true;
    } else {
      this.fallbackDecoder = new FallbackDecoder();
      console.info('Using fallback decoder (BarcodeDetector not available)');
    }
  }

  /**
   * Decode using best available method
   */
  async decode(imageSource: ImageBitmapSource): Promise<DecodeResult[]> {
    if (this.useNative && this.nativeDecoder) {
      return this.nativeDecoder.decode(imageSource);
    }

    // Fallback to software decoder
    if (this.fallbackDecoder && imageSource instanceof ImageData) {
      const result = await this.fallbackDecoder.decode(imageSource);
      return result ? [result] : [];
    }

    return [];
  }

  /**
   * Check which decoder is being used
   */
  getDecoderType(): 'native' | 'fallback' {
    return this.useNative ? 'native' : 'fallback';
  }
}

/**
 * Format-specific decoder helpers
 */
export class BarcodeFormatHelper {
  /**
   * Get human-readable format name
   */
  static getFormatName(format: BarcodeFormat): string {
    const names: Record<BarcodeFormat, string> = {
      [BarcodeFormat.QR_CODE]: 'QR Code',
      [BarcodeFormat.CODE_128]: 'Code 128',
      [BarcodeFormat.CODE_39]: 'Code 39',
      [BarcodeFormat.EAN_13]: 'EAN-13',
      [BarcodeFormat.EAN_8]: 'EAN-8',
      [BarcodeFormat.UPC_A]: 'UPC-A',
      [BarcodeFormat.UPC_E]: 'UPC-E',
      [BarcodeFormat.DATA_MATRIX]: 'Data Matrix',
      [BarcodeFormat.PDF_417]: 'PDF417',
      [BarcodeFormat.AZTEC]: 'Aztec Code',
      [BarcodeFormat.CODABAR]: 'Codabar',
    };
    return names[format] || format;
  }

  /**
   * Check if format is 2D
   */
  static is2DFormat(format: BarcodeFormat): boolean {
    return [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417,
      BarcodeFormat.AZTEC,
    ].includes(format);
  }

  /**
   * Check if format is 1D
   */
  static is1DFormat(format: BarcodeFormat): boolean {
    return !this.is2DFormat(format);
  }

  /**
   * Validate barcode data for format
   */
  static validateData(data: string, format: BarcodeFormat): boolean {
    switch (format) {
      case BarcodeFormat.EAN_13:
        return /^\d{13}$/.test(data);
      case BarcodeFormat.EAN_8:
        return /^\d{8}$/.test(data);
      case BarcodeFormat.UPC_A:
        return /^\d{12}$/.test(data);
      case BarcodeFormat.UPC_E:
        return /^\d{8}$/.test(data);
      default:
        return true; // No specific validation
    }
  }
}

