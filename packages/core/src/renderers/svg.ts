import type { QRCodeConfig, QRCodeStyle, LogoConfig, DotStyle } from '../types';
import { QRCodeGenerator } from '../core/generator';
import { getDotSVGPath } from './styles/dots';

/**
 * Default style configuration
 */
const DEFAULT_STYLE = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  size: 200,
  margin: 4,
  cornerRadius: 0,
  rotate: 0,
  invert: false,
};

/**
 * SVG renderer for QR codes
 */
export class SVGRenderer {
  private svg: SVGSVGElement;
  private generator: QRCodeGenerator;
  private config: QRCodeConfig;
  private style: Required<QRCodeStyle>;

  constructor(config: QRCodeConfig) {
    this.config = config;
    this.style = { ...DEFAULT_STYLE, ...config.style };
    this.generator = new QRCodeGenerator(config);

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.render();
  }

  /**
   * Render QR code as SVG
   */
  private render(): void {
    const moduleCount = this.generator.getModuleCount();
    const margin = this.style.margin;
    const totalModules = moduleCount + margin * 2;
    const moduleSize = this.style.size / totalModules;

    // Apply invert (swap foreground and background colors)
    if (this.config.style?.invert) {
      const temp = this.style.fgColor;
      this.style.fgColor = this.style.bgColor;
      this.style.bgColor = temp;
    }

    // Clear existing content
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }

    // Set SVG attributes
    this.svg.setAttribute('width', String(this.style.size));
    this.svg.setAttribute('height', String(this.style.size));
    this.svg.setAttribute('viewBox', `0 0 ${this.style.size} ${this.style.size}`);
    this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Create background rectangle
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', this.style.bgColor);
    this.svg.appendChild(bg);

    // Create defs for gradient if configured
    const gradient = this.config.style?.gradient;
    let fillValue = this.style.fgColor;

    if (gradient) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const gradientId = `qr-gradient-${Date.now()}`;

      if (gradient.type === 'radial') {
        const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        radialGradient.setAttribute('id', gradientId);
        radialGradient.setAttribute('cx', '50%');
        radialGradient.setAttribute('cy', '50%');
        radialGradient.setAttribute('r', '50%');

        gradient.colors.forEach((color, index) => {
          const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          stop.setAttribute('offset', `${(index / (gradient.colors.length - 1)) * 100}%`);
          stop.setAttribute('stop-color', color);
          radialGradient.appendChild(stop);
        });

        defs.appendChild(radialGradient);
      } else {
        const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        linearGradient.setAttribute('id', gradientId);

        // Calculate gradient direction
        const direction = gradient.direction || 0;
        const rad = (direction * Math.PI) / 180;
        const x1 = 50 - Math.cos(rad) * 50;
        const y1 = 50 - Math.sin(rad) * 50;
        const x2 = 50 + Math.cos(rad) * 50;
        const y2 = 50 + Math.sin(rad) * 50;

        linearGradient.setAttribute('x1', `${x1}%`);
        linearGradient.setAttribute('y1', `${y1}%`);
        linearGradient.setAttribute('x2', `${x2}%`);
        linearGradient.setAttribute('y2', `${y2}%`);

        gradient.colors.forEach((color, index) => {
          const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          stop.setAttribute('offset', `${(index / (gradient.colors.length - 1)) * 100}%`);
          stop.setAttribute('stop-color', color);
          linearGradient.appendChild(stop);
        });

        defs.appendChild(linearGradient);
      }

      this.svg.appendChild(defs);
      fillValue = `url(#${gradientId})`;
    }

    // Create group for QR modules
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('fill', fillValue);

    // Apply rotation if configured
    const rotate = this.config.style?.rotate || 0;
    if (rotate !== 0) {
      const centerX = this.style.size / 2;
      const centerY = this.style.size / 2;
      group.setAttribute('transform', `rotate(${rotate} ${centerX} ${centerY})`);
    }

    // Get dotStyle from config
    const dotStyle = this.config.style?.dotStyle || 'square';

    // Draw QR modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (this.generator.isDark(row, col)) {
          const x = (col + margin) * moduleSize;
          const y = (row + margin) * moduleSize;

          // Use getDotSVGPath for styled dots
          const pathData = getDotSVGPath(x, y, moduleSize, dotStyle as DotStyle, this.style.cornerRadius);

          if (pathData) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            group.appendChild(path);
          } else {
            // Fallback to rect for unsupported styles
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', String(x));
            rect.setAttribute('y', String(y));
            rect.setAttribute('width', String(moduleSize));
            rect.setAttribute('height', String(moduleSize));
            if (this.style.cornerRadius > 0) {
              rect.setAttribute('rx', String(moduleSize * this.style.cornerRadius));
              rect.setAttribute('ry', String(moduleSize * this.style.cornerRadius));
            }
            group.appendChild(rect);
          }
        }
      }
    }

    this.svg.appendChild(group);

    // Draw logo if configured
    if (this.config.logo) {
      this.drawLogo(this.config.logo);
    }
  }

  /**
   * Draw logo on SVG
   */
  private drawLogo(logoConfig: LogoConfig): void {
    const size = this.style.size;
    let logoWidth = typeof logoConfig.width === 'number'
      ? logoConfig.width
      : size * (parseFloat(logoConfig.width || '20%') / 100);
    let logoHeight = typeof logoConfig.height === 'number'
      ? logoConfig.height
      : size * (parseFloat(logoConfig.height || '20%') / 100);

    const x = (size - logoWidth) / 2;
    const y = (size - logoHeight) / 2;

    // Create logo group
    const logoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Draw border if configured
    if (logoConfig.border) {
      const borderWidth = logoConfig.borderWidth || 2;
      const borderRadius = logoConfig.borderRadius || 0;
      const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

      border.setAttribute('x', String(x - borderWidth));
      border.setAttribute('y', String(y - borderWidth));
      border.setAttribute('width', String(logoWidth + borderWidth * 2));
      border.setAttribute('height', String(logoHeight + borderWidth * 2));
      border.setAttribute('fill', logoConfig.borderColor || '#ffffff');

      if (borderRadius > 0) {
        border.setAttribute('rx', String(borderRadius));
        border.setAttribute('ry', String(borderRadius));
      }

      logoGroup.appendChild(border);
    }

    // Create defs for clipping path if border radius is specified
    if (logoConfig.borderRadius && logoConfig.borderRadius > 0) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      const clipId = `logo-clip-${Date.now()}`;
      clipPath.setAttribute('id', clipId);

      const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      clipRect.setAttribute('x', String(x));
      clipRect.setAttribute('y', String(y));
      clipRect.setAttribute('width', String(logoWidth));
      clipRect.setAttribute('height', String(logoHeight));
      clipRect.setAttribute('rx', String(logoConfig.borderRadius));
      clipRect.setAttribute('ry', String(logoConfig.borderRadius));

      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);
      this.svg.appendChild(defs);

      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('x', String(x));
      image.setAttribute('y', String(y));
      image.setAttribute('width', String(logoWidth));
      image.setAttribute('height', String(logoHeight));
      image.setAttribute('href', logoConfig.src);
      image.setAttribute('clip-path', `url(#${clipId})`);

      if (logoConfig.crossOrigin) {
        image.setAttribute('crossorigin', logoConfig.crossOrigin);
      }

      logoGroup.appendChild(image);
    } else {
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('x', String(x));
      image.setAttribute('y', String(y));
      image.setAttribute('width', String(logoWidth));
      image.setAttribute('height', String(logoHeight));
      image.setAttribute('href', logoConfig.src);

      if (logoConfig.crossOrigin) {
        image.setAttribute('crossorigin', logoConfig.crossOrigin);
      }

      logoGroup.appendChild(image);
    }

    this.svg.appendChild(logoGroup);
  }

  /**
   * Update QR code
   */
  update(config: Partial<QRCodeConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.style) {
      this.style = { ...this.style, ...config.style };
    }
    this.generator.update(this.config);
    this.render();
  }

  /**
   * Get SVG element
   */
  getSVG(): SVGSVGElement {
    return this.svg;
  }

  /**
   * Get SVG as string
   */
  toString(): string {
    return new XMLSerializer().serializeToString(this.svg);
  }

  /**
   * Download as SVG file
   */
  download(fileName: string = 'qrcode.svg'): void {
    const svgData = this.toString();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
