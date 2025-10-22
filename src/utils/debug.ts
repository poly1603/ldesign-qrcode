/**
 * QR Code Debug and Performance Tools
 * Provides debugging utilities and performance analysis
 */

export interface PerformanceMetrics {
  renderTime: number;
  cacheHit: boolean;
  memoryUsage?: number;
  poolStats?: any;
  moduleCount: number;
  dataLength: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  suggestion?: string;
}

/**
 * Performance monitor for QR code generation
 */
export class QRCodePerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private enabled: boolean = true;

  /**
   * Start performance tracking
   */
  start(id: string): void {
    if (!this.enabled) return;

    performance.mark(`qr-${id}-start`);
  }

  /**
   * End performance tracking and record metrics
   */
  end(id: string, metadata?: Partial<PerformanceMetrics>): void {
    if (!this.enabled) return;

    performance.mark(`qr-${id}-end`);
    performance.measure(`qr-${id}`, `qr-${id}-start`, `qr-${id}-end`);

    const measure = performance.getEntriesByName(`qr-${id}`)[0];

    const metrics: PerformanceMetrics = {
      renderTime: measure.duration,
      cacheHit: false,
      moduleCount: 0,
      dataLength: 0,
      ...metadata,
    };

    this.metrics.set(id, metrics);

    // Cleanup
    performance.clearMarks(`qr-${id}-start`);
    performance.clearMarks(`qr-${id}-end`);
    performance.clearMeasures(`qr-${id}`);
  }

  /**
   * Get metrics for a specific ID
   */
  getMetrics(id: string): PerformanceMetrics | undefined {
    return this.metrics.get(id);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Calculate average render time
   */
  getAverageRenderTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.renderTime);
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.metrics.size;
    if (total === 0) return 0;

    const hits = Array.from(this.metrics.values()).filter(m => m.cacheHit).length;
    return (hits / total) * 100;
  }

  /**
   * Export metrics as CSV
   */
  exportCSV(): string {
    const headers = ['ID', 'Render Time (ms)', 'Cache Hit', 'Module Count', 'Data Length'];
    const rows = [headers.join(',')];

    this.metrics.forEach((metrics, id) => {
      rows.push([
        id,
        metrics.renderTime.toFixed(2),
        metrics.cacheHit ? 'Yes' : 'No',
        metrics.moduleCount,
        metrics.dataLength,
      ].join(','));
    });

    return rows.join('\n');
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

/**
 * QR Code debugger with visualization
 */
export class QRCodeDebugger {
  private issues: ValidationIssue[] = [];

  /**
   * Validate QR code configuration
   */
  validateConfig(config: any): ValidationIssue[] {
    this.issues = [];

    // Check content
    if (!config.content) {
      this.addIssue('error', 'MISSING_CONTENT', 'Content is required');
    } else if (config.content.length > 4296) {
      this.addIssue('error', 'CONTENT_TOO_LONG',
        'Content exceeds maximum length (4296 characters)');
    }

    // Check size
    if (config.style?.size) {
      if (config.style.size < 50) {
        this.addIssue('warning', 'SIZE_TOO_SMALL',
          'Size is very small, may be hard to scan',
          'Use size >= 200 for better scannability');
      }
      if (config.style.size > 2000) {
        this.addIssue('warning', 'SIZE_TOO_LARGE',
          'Size is very large, may cause performance issues',
          'Consider using size <= 1000');
      }
    }

    // Check error correction with logo
    if (config.logo && (!config.errorCorrectionLevel || config.errorCorrectionLevel === 'L')) {
      this.addIssue('warning', 'LOW_ERROR_CORRECTION',
        'Low error correction with logo may cause scanning issues',
        'Use error correction level H with logos');
    }

    // Check colors
    if (config.style?.fgColor && config.style?.bgColor) {
      if (config.style.fgColor === config.style.bgColor) {
        this.addIssue('error', 'SAME_COLORS',
          'Foreground and background colors are the same');
      }

      const contrast = this.calculateContrast(
        config.style.fgColor,
        config.style.bgColor
      );

      if (contrast < 3) {
        this.addIssue('warning', 'LOW_CONTRAST',
          'Low contrast between foreground and background',
          'Increase color contrast for better scannability');
      }
    }

    // Check gradient with scanning
    if (config.style?.gradient) {
      this.addIssue('info', 'GRADIENT_SCANNABILITY',
        'Gradients may affect scannability on some scanners',
        'Test thoroughly with target scanning devices');
    }

    return this.issues;
  }

  /**
   * Add validation issue
   */
  private addIssue(
    type: 'error' | 'warning' | 'info',
    code: string,
    message: string,
    suggestion?: string
  ): void {
    this.issues.push({ type, code, message, suggestion });
  }

  /**
   * Calculate color contrast
   */
  private calculateContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = this.relativeLuminance(rgb1);
    const l2 = this.relativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  /**
   * Calculate relative luminance
   */
  private relativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Visualize QR code matrix structure
   */
  visualizeMatrix(matrix: boolean[][]): string {
    const moduleCount = matrix.length;
    let output = `QR Code Matrix (${moduleCount}x${moduleCount}):\n\n`;

    // Draw matrix with characters
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        output += matrix[row][col] ? '██' : '  ';
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Analyze QR code structure
   */
  analyzeStructure(matrix: boolean[][]): {
    version: number;
    moduleCount: number;
    finderPatterns: number;
    timingPatterns: { horizontal: boolean; vertical: boolean };
    dataModules: number;
    functionModules: number;
  } {
    const moduleCount = matrix.length;
    const version = (moduleCount - 17) / 4;

    // Count finder patterns (simplified)
    const finderPatterns = 3; // Always 3 in standard QR codes

    // Check timing patterns
    const timingPatterns = {
      horizontal: this.checkTimingPattern(matrix, 6, true),
      vertical: this.checkTimingPattern(matrix, 6, false),
    };

    // Count module types (simplified)
    let dataModules = 0;
    let functionModules = 0;

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (this.isFunctionModule(row, col, moduleCount)) {
          functionModules++;
        } else {
          dataModules++;
        }
      }
    }

    return {
      version,
      moduleCount,
      finderPatterns,
      timingPatterns,
      dataModules,
      functionModules,
    };
  }

  /**
   * Check timing pattern
   */
  private checkTimingPattern(
    matrix: boolean[][],
    position: number,
    isHorizontal: boolean
  ): boolean {
    const moduleCount = matrix.length;
    let alternating = true;

    for (let i = 8; i < moduleCount - 8; i++) {
      const current = isHorizontal
        ? matrix[position][i]
        : matrix[i][position];
      const expected = i % 2 === 0;

      if (current !== expected) {
        alternating = false;
        break;
      }
    }

    return alternating;
  }

  /**
   * Check if module is a function module
   */
  private isFunctionModule(row: number, col: number, moduleCount: number): boolean {
    // Finder patterns (7x7) at three corners
    if (
      (row < 7 && col < 7) ||
      (row < 7 && col >= moduleCount - 7) ||
      (row >= moduleCount - 7 && col < 7)
    ) {
      return true;
    }

    // Timing patterns
    if (row === 6 || col === 6) {
      return true;
    }

    return false;
  }

  /**
   * Generate debug report
   */
  generateReport(config: any, metrics?: PerformanceMetrics): string {
    const issues = this.validateConfig(config);

    let report = '=== QR Code Debug Report ===\n\n';

    // Configuration
    report += '## Configuration\n';
    report += `Content: ${config.content?.substring(0, 50)}${config.content?.length > 50 ? '...' : ''}\n`;
    report += `Size: ${config.style?.size || 'default'}\n`;
    report += `Error Correction: ${config.errorCorrectionLevel || 'M'}\n`;
    report += `Render Type: ${config.renderType || 'canvas'}\n\n`;

    // Validation Issues
    report += '## Validation Issues\n';
    if (issues.length === 0) {
      report += 'No issues found ✓\n';
    } else {
      issues.forEach(issue => {
        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
        report += `${icon} [${issue.code}] ${issue.message}\n`;
        if (issue.suggestion) {
          report += `   → ${issue.suggestion}\n`;
        }
      });
    }
    report += '\n';

    // Performance Metrics
    if (metrics) {
      report += '## Performance\n';
      report += `Render Time: ${metrics.renderTime.toFixed(2)}ms\n`;
      report += `Cache Hit: ${metrics.cacheHit ? 'Yes' : 'No'}\n`;
      report += `Module Count: ${metrics.moduleCount}\n`;
      report += `Data Length: ${metrics.dataLength}\n`;
      if (metrics.memoryUsage) {
        report += `Memory Usage: ${(metrics.memoryUsage / 1024).toFixed(2)}KB\n`;
      }
      report += '\n';
    }

    report += '===========================\n';

    return report;
  }

  /**
   * Clear issues
   */
  clear(): void {
    this.issues = [];
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new QRCodePerformanceMonitor();

/**
 * Global debugger instance
 */
export const debugger = new QRCodeDebugger();

/**
 * Enable debug mode
 */
export function enableDebugMode(): void {
  performanceMonitor.setEnabled(true);
  console.log('QRCode debug mode enabled');
}

/**
 * Disable debug mode
 */
export function disableDebugMode(): void {
  performanceMonitor.setEnabled(false);
  console.log('QRCode debug mode disabled');
}

/**
 * Get performance report
 */
export function getPerformanceReport(): string {
  const avgTime = performanceMonitor.getAverageRenderTime();
  const cacheHitRate = performanceMonitor.getCacheHitRate();
  const metrics = performanceMonitor.getAllMetrics();

  let report = '=== Performance Report ===\n\n';
  report += `Total QR Codes Generated: ${metrics.size}\n`;
  report += `Average Render Time: ${avgTime.toFixed(2)}ms\n`;
  report += `Cache Hit Rate: ${cacheHitRate.toFixed(1)}%\n\n`;

  report += '## Top 10 Slowest Renders\n';
  const sorted = Array.from(metrics.entries())
    .sort((a, b) => b[1].renderTime - a[1].renderTime)
    .slice(0, 10);

  sorted.forEach(([id, m], index) => {
    report += `${index + 1}. ${id}: ${m.renderTime.toFixed(2)}ms\n`;
  });

  report += '\n========================\n';

  return report;
}


