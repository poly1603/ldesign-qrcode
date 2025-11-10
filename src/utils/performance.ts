/**
 * Performance monitoring and optimization utilities
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  /** Total render time in milliseconds */
  renderTime: number;
  /** Data generation time */
  dataGenerationTime: number;
  /** Canvas/SVG drawing time */
  drawingTime: number;
  /** Logo loading time */
  logoLoadTime?: number;
  /** Cache hit/miss */
  cacheHit: boolean;
  /** Memory usage estimate in bytes */
  memoryUsage?: number;
  /** Module count */
  moduleCount: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Performance tracker for QR code generation
 */
export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private timers: Map<string, number> = new Map();
  private enabled: boolean = true;

  /**
   * Enable or disable performance tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start timing a specific operation
   */
  startTimer(key: string): void {
    if (!this.enabled) return;
    this.timers.set(key, performance.now());
  }

  /**
   * End timing and return elapsed time
   */
  endTimer(key: string): number {
    if (!this.enabled) return 0;
    
    const startTime = this.timers.get(key);
    if (!startTime) return 0;
    
    const elapsed = performance.now() - startTime;
    this.timers.delete(key);
    return elapsed;
  }

  /**
   * Record complete metrics for a QR code generation
   */
  recordMetrics(id: string, metrics: PerformanceMetrics): void {
    if (!this.enabled) return;
    this.metrics.set(id, metrics);
    
    // Keep only last 100 metrics to prevent memory leak
    if (this.metrics.size > 100) {
      const firstKey = this.metrics.keys().next().value;
      this.metrics.delete(firstKey);
    }
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
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get average metrics
   */
  getAverageMetrics(): Partial<PerformanceMetrics> {
    const allMetrics = this.getAllMetrics();
    if (allMetrics.length === 0) return {};
    
    const sum = allMetrics.reduce((acc, m) => ({
      renderTime: (acc.renderTime || 0) + m.renderTime,
      dataGenerationTime: (acc.dataGenerationTime || 0) + m.dataGenerationTime,
      drawingTime: (acc.drawingTime || 0) + m.drawingTime,
      logoLoadTime: (acc.logoLoadTime || 0) + (m.logoLoadTime || 0),
      memoryUsage: (acc.memoryUsage || 0) + (m.memoryUsage || 0),
    }), {} as Partial<PerformanceMetrics>);
    
    const count = allMetrics.length;
    return {
      renderTime: sum.renderTime! / count,
      dataGenerationTime: sum.dataGenerationTime! / count,
      drawingTime: sum.drawingTime! / count,
      logoLoadTime: sum.logoLoadTime! / count,
      memoryUsage: sum.memoryUsage! / count,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const avg = this.getAverageMetrics();
    const total = this.metrics.size;
    const cacheHits = Array.from(this.metrics.values()).filter(m => m.cacheHit).length;
    const cacheHitRate = total > 0 ? (cacheHits / total * 100).toFixed(1) : '0';
    
    return `
Performance Report:
==================
Total generations: ${total}
Average render time: ${avg.renderTime?.toFixed(2)}ms
  - Data generation: ${avg.dataGenerationTime?.toFixed(2)}ms
  - Drawing: ${avg.drawingTime?.toFixed(2)}ms
  - Logo loading: ${avg.logoLoadTime?.toFixed(2)}ms
Cache hit rate: ${cacheHitRate}%
Average memory usage: ${this.formatBytes(avg.memoryUsage || 0)}
    `.trim();
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Memory estimator for QR codes
 */
export class MemoryEstimator {
  /**
   * Estimate memory usage of a QR code
   */
  static estimate(config: {
    moduleCount: number;
    renderType: 'canvas' | 'svg' | 'webgl';
    hasLogo: boolean;
    size: number;
  }): number {
    let memory = 0;
    
    // Base matrix memory (boolean array)
    memory += config.moduleCount * config.moduleCount;
    
    // Render specific memory
    switch (config.renderType) {
      case 'canvas':
        // Canvas bitmap memory: 4 bytes per pixel (RGBA)
        memory += config.size * config.size * 4;
        break;
      case 'svg':
        // SVG string memory (estimated)
        memory += config.moduleCount * config.moduleCount * 50; // ~50 bytes per module
        break;
      case 'webgl':
        // WebGL buffer memory
        memory += config.moduleCount * config.moduleCount * 16; // vertex data
        break;
    }
    
    // Logo memory
    if (config.hasLogo) {
      // Estimate logo image memory
      memory += config.size * config.size; // simplified estimate
    }
    
    return memory;
  }
}

/**
 * Performance optimization suggestions
 */
export class PerformanceOptimizer {
  /**
   * Analyze configuration and suggest optimizations
   */
  static analyze(config: any): string[] {
    const suggestions: string[] = [];
    
    // Check size
    if (config.style?.size > 1000) {
      suggestions.push('Consider reducing QR code size for better performance');
    }
    
    // Check error correction with logo
    if (config.logo && config.errorCorrectionLevel !== 'H') {
      suggestions.push('Use error correction level "H" when using logos');
    }
    
    // Check render type
    if (config.renderType === 'canvas' && config.style?.size > 500) {
      suggestions.push('Consider using WebGL renderer for large QR codes');
    }
    
    // Check effects
    if (config.style?.transform3D) {
      suggestions.push('3D transforms are computationally expensive, use sparingly');
    }
    
    if (config.style?.filter && Array.isArray(config.style.filter)) {
      if (config.style.filter.length > 2) {
        suggestions.push('Multiple filters can impact performance, consider reducing');
      }
    }
    
    // Check animation
    if (config.animated && config.animationDuration > 2000) {
      suggestions.push('Long animations may impact user experience');
    }
    
    return suggestions;
  }

  /**
   * Get optimal configuration for performance
   */
  static getOptimalConfig(baseConfig: any): any {
    const optimal = { ...baseConfig };
    
    // Use appropriate render type based on size
    if (!optimal.renderType) {
      const size = optimal.style?.size || 200;
      if (size > 500) {
        optimal.renderType = 'webgl';
      } else if (size < 200) {
        optimal.renderType = 'svg';
      } else {
        optimal.renderType = 'canvas';
      }
    }
    
    // Optimize error correction
    if (!optimal.errorCorrectionLevel) {
      optimal.errorCorrectionLevel = optimal.logo ? 'H' : 'M';
    }
    
    // Optimize margin
    if (!optimal.style) {
      optimal.style = {};
    }
    if (optimal.style.margin === undefined) {
      optimal.style.margin = 4; // Standard margin
    }
    
    return optimal;
  }
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback wrapper
 */
export function whenIdle(callback: () => void, timeout: number = 1000): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * Batch processor for multiple QR codes
 */
export class BatchProcessor {
  private queue: Array<{ config: any; callback: (result: any) => void }> = [];
  private processing = false;
  private batchSize = 5;
  private delay = 10;

  /**
   * Add item to batch queue
   */
  add(config: any, callback: (result: any) => void): void {
    this.queue.push({ config, callback });
    
    if (!this.processing) {
      this.process();
    }
  }

  /**
   * Process batch queue
   */
  private async process(): Promise<void> {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      // Process batch
      await Promise.all(batch.map(async (item) => {
        try {
          // Process item (placeholder - actual implementation would generate QR)
          const result = await this.processItem(item.config);
          item.callback(result);
        } catch (error) {
          item.callback({ error });
        }
      }));
      
      // Small delay between batches
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    this.processing = false;
  }

  /**
   * Process single item (placeholder)
   */
  private async processItem(config: any): Promise<any> {
    // Actual QR code generation would happen here
    return { success: true, config };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Global performance tracker instance
export const globalPerformanceTracker = new PerformanceTracker();

// Export convenience functions
export const startTimer = (key: string) => globalPerformanceTracker.startTimer(key);
export const endTimer = (key: string) => globalPerformanceTracker.endTimer(key);
export const recordMetrics = (id: string, metrics: PerformanceMetrics) => 
  globalPerformanceTracker.recordMetrics(id, metrics);
export const getPerformanceReport = () => globalPerformanceTracker.getReport();