/**
 * Shared base adapter for framework integrations
 * Reduces code duplication between React and Vue adapters
 */

import type {
  QRCodeConfig,
  QRCodeInstance,
  DownloadOptions,
} from '../../types';
import { createQRCode } from '../../index';

/**
 * Common adapter configuration
 */
export interface BaseAdapterConfig extends Partial<QRCodeConfig> {
  container?: HTMLElement;
  immediate?: boolean;
  animated?: boolean;
  animationType?: 'fade' | 'scale' | 'rotate' | 'slide';
  animationDuration?: number;
  onSuccess?: (instance: QRCodeInstance) => void;
  onError?: (error: Error) => void;
}

/**
 * Base adapter state
 */
export interface BaseAdapterState {
  instance?: QRCodeInstance;
  isReady: boolean;
  isGenerating: boolean;
  error: Error | null;
}

/**
 * Abstract base class for framework adapters
 */
export abstract class BaseAdapter {
  protected config: QRCodeConfig;
  protected state: BaseAdapterState;
  protected container?: HTMLElement;
  protected animationConfig: {
    enabled: boolean;
    type: string;
    duration: number;
  };

  constructor(config: BaseAdapterConfig) {
    this.config = {
      content: config.content || '',
      errorCorrectionLevel: config.errorCorrectionLevel || 'M',
      renderType: config.renderType || 'canvas',
      style: config.style,
      logo: config.logo,
      typeNumber: config.typeNumber,
      maskPattern: config.maskPattern,
    };

    this.state = {
      isReady: false,
      isGenerating: false,
      error: null,
    };

    this.container = config.container;
    this.animationConfig = {
      enabled: config.animated || false,
      type: config.animationType || 'fade',
      duration: config.animationDuration || 1000,
    };
  }

  /**
   * Generate QR code
   */
  async generate(newConfig?: Partial<QRCodeConfig>): Promise<void> {
    try {
      this.state.error = null;
      this.state.isReady = false;
      this.state.isGenerating = true;

      // Update config
      if (newConfig) {
        Object.assign(this.config, newConfig);
      }

      // Validate
      this.validateConfig();

      // Clean up existing instance
      if (this.state.instance) {
        this.state.instance.destroy();
      }

      // Apply exit animation if enabled
      if (this.animationConfig.enabled && this.container) {
        await this.animateOut();
      }

      // Create new instance
      this.state.instance = createQRCode({
        ...this.config,
        container: this.container,
      });

      this.state.isReady = true;

      // Apply enter animation if enabled
      if (this.animationConfig.enabled && this.container) {
        await this.animateIn();
      }

      // Success callback
      this.onGenerateSuccess();
    } catch (error) {
      this.state.error = error as Error;
      this.onGenerateError(error as Error);
      throw error;
    } finally {
      this.state.isGenerating = false;
    }
  }

  /**
   * Update existing QR code
   */
  async update(config: Partial<QRCodeConfig>): Promise<void> {
    if (!this.state.instance) {
      throw new Error('QR code instance not initialized');
    }

    Object.assign(this.config, config);
    await this.state.instance.update(config);
  }

  /**
   * Get data URL
   */
  toDataURL(format: 'png' | 'jpeg' = 'png', quality: number = 0.92): string {
    if (!this.state.instance) {
      throw new Error('QR code instance not initialized');
    }
    return this.state.instance.toDataURL(format, quality);
  }

  /**
   * Get SVG string
   */
  toSVGString(): string {
    if (!this.state.instance) {
      throw new Error('QR code instance not initialized');
    }
    return this.state.instance.toSVGString();
  }

  /**
   * Download QR code
   */
  download(options: DownloadOptions = {}): void {
    if (!this.state.instance) {
      throw new Error('QR code instance not initialized');
    }

    const {
      fileName = 'qrcode',
      format = 'png',
      quality = 0.92,
    } = options;

    if (format === 'svg' && this.config.renderType === 'svg') {
      // Handle SVG download
      const svgString = this.toSVGString();
      this.downloadBlob(
        new Blob([svgString], { type: 'image/svg+xml' }),
        `${fileName}.svg`
      );
    } else {
      // Use instance download method
      this.state.instance.download(options);
    }
  }

  /**
   * Destroy instance
   */
  destroy(): void {
    if (this.state.instance) {
      this.state.instance.destroy();
      this.state.instance = undefined;
      this.state.isReady = false;
    }
  }

  /**
   * Get current state
   */
  getState(): BaseAdapterState {
    return { ...this.state };
  }

  /**
   * Get current config
   */
  getConfig(): QRCodeConfig {
    return { ...this.config };
  }

  /**
   * Get instance
   */
  getInstance(): QRCodeInstance | undefined {
    return this.state.instance;
  }

  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    if (!this.config.content) {
      throw new Error('QR code content is required');
    }

    if (this.config.style?.size && this.config.style.size < 50) {
      throw new Error('QR code size must be at least 50 pixels');
    }

    // Add more validation as needed
  }

  /**
   * Download blob helper
   */
  protected downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Animation methods (to be implemented by subclasses)
   */
  protected abstract animateIn(): Promise<void>;
  protected abstract animateOut(): Promise<void>;

  /**
   * Lifecycle hooks (to be implemented by subclasses)
   */
  protected abstract onGenerateSuccess(): void;
  protected abstract onGenerateError(error: Error): void;
}

/**
 * Animation utilities
 */
export class AnimationUtils {
  /**
   * Apply CSS animation class
   */
  static async applyAnimation(
    element: HTMLElement,
    animationType: string,
    duration: number,
    direction: 'in' | 'out' = 'in'
  ): Promise<void> {
    const animationClass = `qr-animation-${animationType}-${direction}`;
    
    // Add animation styles if not exists
    this.ensureAnimationStyles();
    
    // Apply animation class
    element.classList.add(animationClass);
    element.style.animationDuration = `${duration}ms`;
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Clean up
    element.classList.remove(animationClass);
    element.style.animationDuration = '';
  }

  /**
   * Ensure animation styles are injected
   */
  private static ensureAnimationStyles(): void {
    const styleId = 'qr-animation-styles';
    
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes qr-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes qr-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes qr-scale-in {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      
      @keyframes qr-scale-out {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(1.1); opacity: 0; }
      }
      
      @keyframes qr-rotate-in {
        from { transform: rotate(-180deg) scale(0.5); opacity: 0; }
        to { transform: rotate(0) scale(1); opacity: 1; }
      }
      
      @keyframes qr-rotate-out {
        from { transform: rotate(0) scale(1); opacity: 1; }
        to { transform: rotate(180deg) scale(0.5); opacity: 0; }
      }
      
      @keyframes qr-slide-in {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes qr-slide-out {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-20px); opacity: 0; }
      }
      
      .qr-animation-fade-in { animation-name: qr-fade-in; }
      .qr-animation-fade-out { animation-name: qr-fade-out; }
      .qr-animation-scale-in { animation-name: qr-scale-in; }
      .qr-animation-scale-out { animation-name: qr-scale-out; }
      .qr-animation-rotate-in { animation-name: qr-rotate-in; }
      .qr-animation-rotate-out { animation-name: qr-rotate-out; }
      .qr-animation-slide-in { animation-name: qr-slide-in; }
      .qr-animation-slide-out { animation-name: qr-slide-out; }
    `;
    
    document.head.appendChild(style);
  }
}