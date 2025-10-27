/**
 * Visual QR Code Editor Component
 * Provides interactive configuration interface
 */

import { createQRCode } from '../../index';
import type { QRCodeConfig, QRCodeInstance, DotStyle } from '../../types';

export interface EditorConfig {
  container: HTMLElement;
  initialConfig?: Partial<QRCodeConfig>;
  onConfigChange?: (config: QRCodeConfig) => void;
  showPreview?: boolean;
  showCodeExport?: boolean;
}

/**
 * QR Code Visual Editor
 */
export class QRCodeEditor {
  private container: HTMLElement;
  private config: QRCodeConfig;
  private qrInstance: QRCodeInstance | null = null;
  private previewContainer: HTMLElement | null = null;
  private controlsContainer: HTMLElement | null = null;
  private onConfigChange?: (config: QRCodeConfig) => void;

  constructor(options: EditorConfig) {
    this.container = options.container;
    this.config = {
      content: 'https://example.com',
      style: { size: 300 },
      ...options.initialConfig,
    };
    this.onConfigChange = options.onConfigChange;

    this.render();
  }

  /**
   * Render editor UI
   */
  private render(): void {
    this.container.innerHTML = '';
    this.container.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    `;

    // Controls panel
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
    this.renderControls();

    // Preview panel
    this.previewContainer = document.createElement('div');
    this.previewContainer.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    this.renderPreview();

    this.container.appendChild(this.controlsContainer);
    this.container.appendChild(this.previewContainer);
  }

  /**
   * Render control panel
   */
  private renderControls(): void {
    if (!this.controlsContainer) return;

    const html = `
      <h2 style="margin: 0 0 20px 0; color: #333;">配置面板</h2>
      
      <!-- Content -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">内容</label>
        <input 
          type="text" 
          id="qr-content" 
          value="${this.config.content}"
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
        />
      </div>

      <!-- Size -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">
          尺寸: <span id="size-value">${this.config.style?.size || 300}</span>px
        </label>
        <input 
          type="range" 
          id="qr-size" 
          min="100" 
          max="800" 
          value="${this.config.style?.size || 300}"
          style="width: 100%;"
        />
      </div>

      <!-- Error Correction -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">纠错级别</label>
        <select id="qr-ec-level" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="L">L (7%)</option>
          <option value="M" selected>M (15%)</option>
          <option value="Q">Q (25%)</option>
          <option value="H">H (30%)</option>
        </select>
      </div>

      <!-- Render Type -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">渲染类型</label>
        <select id="qr-render-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="canvas">Canvas</option>
          <option value="webgl">WebGL (GPU)</option>
          <option value="svg">SVG</option>
        </select>
      </div>

      <!-- Dot Style -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">点样式</label>
        <select id="qr-dot-style" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="square">方形</option>
          <option value="rounded">圆角</option>
          <option value="dots">圆点</option>
          <option value="diamond">菱形</option>
          <option value="star">星形</option>
        </select>
      </div>

      <!-- Colors -->
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">前景色</label>
        <input 
          type="color" 
          id="qr-fg-color" 
          value="#000000"
          style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px;"
        />
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">背景色</label>
        <input 
          type="color" 
          id="qr-bg-color" 
          value="#ffffff"
          style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px;"
        />
      </div>

      <!-- Buttons -->
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button 
          id="btn-update" 
          style="flex: 1; padding: 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          更新预览
        </button>
        <button 
          id="btn-download" 
          style="flex: 1; padding: 10px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          下载
        </button>
      </div>

      <div style="margin-top: 20px;">
        <button 
          id="btn-export-code" 
          style="width: 100%; padding: 10px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          导出代码
        </button>
      </div>
    `;

    this.controlsContainer.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to controls
   */
  private attachEventListeners(): void {
    const content = document.getElementById('qr-content') as HTMLInputElement;
    const size = document.getElementById('qr-size') as HTMLInputElement;
    const sizeValue = document.getElementById('size-value');
    const ecLevel = document.getElementById('qr-ec-level') as HTMLSelectElement;
    const renderType = document.getElementById('qr-render-type') as HTMLSelectElement;
    const dotStyle = document.getElementById('qr-dot-style') as HTMLSelectElement;
    const fgColor = document.getElementById('qr-fg-color') as HTMLInputElement;
    const bgColor = document.getElementById('qr-bg-color') as HTMLInputElement;
    const btnUpdate = document.getElementById('btn-update');
    const btnDownload = document.getElementById('btn-download');
    const btnExport = document.getElementById('btn-export-code');

    // Size slider
    size?.addEventListener('input', () => {
      if (sizeValue) {
        sizeValue.textContent = size.value;
      }
    });

    // Update button
    btnUpdate?.addEventListener('click', () => {
      this.updateConfig({
        content: content?.value || '',
        errorCorrectionLevel: ecLevel?.value as any,
        renderType: renderType?.value as any,
        style: {
          size: parseInt(size?.value || '300'),
          dotStyle: dotStyle?.value as DotStyle,
          fgColor: fgColor?.value,
          bgColor: bgColor?.value,
        },
      });
      this.updatePreview();
    });

    // Download button
    btnDownload?.addEventListener('click', () => {
      if (this.qrInstance) {
        this.qrInstance.download({ fileName: 'qrcode', format: 'png' });
      }
    });

    // Export code button
    btnExport?.addEventListener('click', () => {
      this.exportCode();
    });
  }

  /**
   * Render preview panel
   */
  private renderPreview(): void {
    if (!this.previewContainer) return;

    this.previewContainer.innerHTML = '<h2 style="margin: 0 0 20px 0; color: #333;">预览</h2>';

    const qrDiv = document.createElement('div');
    qrDiv.style.cssText = 'padding: 20px; background: #f3f4f6; border-radius: 8px;';
    this.previewContainer.appendChild(qrDiv);

    this.qrInstance = createQRCode({
      ...this.config,
      container: qrDiv,
    });
  }

  /**
   * Update configuration
   */
  private updateConfig(newConfig: Partial<QRCodeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.onConfigChange?.(this.config);
  }

  /**
   * Update preview
   */
  private async updatePreview(): Promise<void> {
    if (this.qrInstance) {
      await this.qrInstance.update(this.config);
    } else {
      this.renderPreview();
    }
  }

  /**
   * Export configuration as code
   */
  private exportCode(): void {
    const code = `
import { createQRCode } from '@ldesign/qrcode';

createQRCode({
  content: '${this.config.content}',
  container: document.getElementById('qr'),
  errorCorrectionLevel: '${this.config.errorCorrectionLevel || 'M'}',
  renderType: '${this.config.renderType || 'canvas'}',
  style: {
    size: ${this.config.style?.size || 300},
    dotStyle: '${this.config.style?.dotStyle || 'square'}',
    fgColor: '${this.config.style?.fgColor || '#000000'}',
    bgColor: '${this.config.style?.bgColor || '#ffffff'}',
  },
});
`.trim();

    // Show in modal or copy to clipboard
    this.showCodeModal(code);
  }

  /**
   * Show code export modal
   */
  private showCodeModal(code: string): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
    `;

    content.innerHTML = `
      <h3 style="margin: 0 0 15px 0;">导出代码</h3>
      <pre style="background: #f3f4f6; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 13px;">${code}</pre>
      <button id="copy-code" style="margin-right: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
        复制代码
      </button>
      <button id="close-modal" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
        关闭
      </button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Copy button
    content.querySelector('#copy-code')?.addEventListener('click', () => {
      navigator.clipboard.writeText(code);
      alert('代码已复制到剪贴板！');
    });

    // Close button
    const closeModal = () => {
      document.body.removeChild(modal);
    };

    content.querySelector('#close-modal')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  /**
   * Get current configuration
   */
  public getConfig(): QRCodeConfig {
    return { ...this.config };
  }

  /**
   * Set configuration programmatically
   */
  public setConfig(config: Partial<QRCodeConfig>): void {
    this.updateConfig(config);
    this.updatePreview();
  }

  /**
   * Destroy editor
   */
  public destroy(): void {
    if (this.qrInstance) {
      this.qrInstance.destroy();
    }
    this.container.innerHTML = '';
  }
}

/**
 * Create QR code editor
 */
export function createQRCodeEditor(options: EditorConfig): QRCodeEditor {
  return new QRCodeEditor(options);
}


