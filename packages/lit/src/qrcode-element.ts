/**
 * Lit Web Components - QR Code 组件
 */
import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import {
  createQRCode,
  QRCodeInstance,
  QRCodeConfig,
  DotStyle,
  ErrorCorrectionLevel,
  RenderType
} from '@ldesign/qrcode-core';

@customElement('qr-code')
export class QRCodeElement extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
    
    .qrcode-container {
      display: inline-block;
      position: relative;
    }
    
    .qrcode-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      color: #666;
    }
    
    .qrcode-error {
      color: #ff0000;
      padding: 10px;
      border: 1px solid #ffcccc;
      background: #ffeeee;
      border-radius: 4px;
    }
    
    :host([animated]) .qrcode-container {
      animation: qrcode-fade-in 1s ease-in-out;
    }
    
    @keyframes qrcode-fade-in {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
  `;

  // Basic properties
  @property({ type: String })
  content = '';

  @property({ type: String, attribute: 'error-correction-level' })
  errorCorrectionLevel: ErrorCorrectionLevel = 'M';

  @property({ type: String, attribute: 'render-type' })
  renderType: RenderType = 'canvas';

  @property({ type: Number })
  size = 200;

  @property({ type: Number })
  margin = 4;

  // Style properties
  @property({ type: String, attribute: 'fg-color' })
  fgColor = '#000000';

  @property({ type: String, attribute: 'bg-color' })
  bgColor = '#ffffff';

  @property({ type: Number, attribute: 'corner-radius' })
  cornerRadius = 0;

  @property({ type: String, attribute: 'dot-style' })
  dotStyle: DotStyle = 'square';

  // Advanced properties
  @property({ type: Object })
  gradient?: any;

  @property({ type: Object, attribute: 'background-gradient' })
  backgroundGradient?: any;

  @property({ type: Boolean })
  invert = false;

  @property({ type: Number })
  rotate: 0 | 90 | 180 | 270 = 0;

  // Logo property
  @property({ type: Object })
  logo?: any;

  // Other properties
  @property({ type: Number, attribute: 'type-number' })
  typeNumber?: number;

  @property({ type: Boolean })
  animated = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  // State
  @state()
  private isLoading = true;

  @state()
  private error: Error | null = null;

  @query('.qrcode-container')
  private container!: HTMLDivElement;

  private qrInstance?: QRCodeInstance;

  connectedCallback(): void {
    super.connectedCallback();
  }

  firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.generateQRCode();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // Regenerate QR code if any property changed
    const propertiesToWatch = [
      'content',
      'errorCorrectionLevel',
      'renderType',
      'size',
      'margin',
      'fgColor',
      'bgColor',
      'cornerRadius',
      'dotStyle',
      'gradient',
      'backgroundGradient',
      'invert',
      'rotate',
      'logo',
      'typeNumber'
    ];

    const shouldRegenerate = propertiesToWatch.some(prop =>
      changedProperties.has(prop)
    );

    if (shouldRegenerate && changedProperties.size > 0) {
      this.generateQRCode();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cleanup();
  }

  private async generateQRCode(): Promise<void> {
    if (!this.container || !this.content) return;

    try {
      this.isLoading = true;
      this.error = null;

      // Clean up existing instance
      this.cleanup();

      // Clear container
      this.container.innerHTML = '';

      // Create config
      const config: QRCodeConfig = {
        content: this.content,
        errorCorrectionLevel: this.errorCorrectionLevel,
        renderType: this.renderType,
        typeNumber: this.typeNumber,
        style: {
          size: this.size,
          margin: this.margin,
          fgColor: this.fgColor,
          bgColor: this.bgColor,
          cornerRadius: this.cornerRadius,
          dotStyle: this.dotStyle,
          gradient: this.gradient,
          backgroundGradient: this.backgroundGradient,
          invert: this.invert,
          rotate: this.rotate,
        },
        logo: this.logo,
      };

      // Create QR code instance
      this.qrInstance = createQRCode({
        ...config,
        container: this.container,
      });

      this.isLoading = false;

      // Dispatch ready event
      this.dispatchEvent(new CustomEvent('qr-ready', {
        detail: { instance: this.qrInstance },
        bubbles: true,
        composed: true,
      }));
    } catch (err) {
      this.error = err as Error;
      this.isLoading = false;

      // Dispatch error event
      this.dispatchEvent(new CustomEvent('qr-error', {
        detail: { error: err },
        bubbles: true,
        composed: true,
      }));

      console.error('Failed to generate QR code:', err);
    }
  }

  private cleanup(): void {
    if (this.qrInstance) {
      this.qrInstance.destroy();
      this.qrInstance = undefined;
    }
  }

  // Public methods
  public async refresh(): Promise<void> {
    await this.generateQRCode();
  }

  public toDataURL(format?: 'png' | 'jpeg', quality?: number): string {
    if (!this.qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    return this.qrInstance.toDataURL(format, quality);
  }

  public toSVGString(): string {
    if (!this.qrInstance) {
      throw new Error('QR code instance not initialized');
    }
    return this.qrInstance.toSVGString();
  }

  public download(fileName: string = 'qrcode', format: 'png' | 'jpeg' | 'svg' = 'png', quality?: number): void {
    if (!this.qrInstance) {
      throw new Error('QR code instance not initialized');
    }

    if (format === 'svg') {
      const svgString = this.toSVGString();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      this.qrInstance.download({ fileName, format, quality });
    }

    // Dispatch download event
    this.dispatchEvent(new CustomEvent('qr-download', {
      detail: { fileName, format },
      bubbles: true,
      composed: true,
    }));
  }

  public getInstance(): QRCodeInstance | undefined {
    return this.qrInstance;
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="qrcode-loading">
          <slot name="loading">Loading QR Code...</slot>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="qrcode-error">
          <slot name="error">
            <p>Error generating QR code: ${this.error.message}</p>
          </slot>
        </div>
      `;
    }

    return html`
      <div class="qrcode-container">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qr-code': QRCodeElement;
  }
}

