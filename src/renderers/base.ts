/**
 * Base Renderer Abstract Class
 * Provides unified interface for all QR code renderers
 */

import type { QRCodeConfig, QRCodeStyle } from '../types';
import { QRCodeGenerator } from '../core/generator';

/**
 * Render pipeline stages
 */
export enum RenderStage {
  Initialize = 'initialize',
  PreRender = 'pre-render',
  DrawBackground = 'draw-background',
  DrawModules = 'draw-modules',
  DrawEyes = 'draw-eyes',
  DrawLogo = 'draw-logo',
  ApplyEffects = 'apply-effects',
  PostRender = 'post-render',
  Complete = 'complete',
}

/**
 * Render context for pipeline
 */
export interface RenderContext {
  generator: QRCodeGenerator;
  config: QRCodeConfig;
  style: QRCodeStyle;
  moduleCount: number;
  moduleSize: number;
  margin: number;
  totalSize: number;
}

/**
 * Renderer plugin interface
 */
export interface RendererPlugin {
  name: string;
  stage: RenderStage;
  execute(context: RenderContext, renderer: BaseRenderer): void | Promise<void>;
}

/**
 * Abstract base renderer class
 */
export abstract class BaseRenderer {
  protected generator: QRCodeGenerator;
  protected config: QRCodeConfig;
  protected plugins: Map<RenderStage, RendererPlugin[]> = new Map();
  protected currentStage: RenderStage = RenderStage.Initialize;

  constructor(config: QRCodeConfig) {
    this.config = config;
    this.generator = new QRCodeGenerator(config);
    this.initializePlugins();
  }

  /**
   * Initialize plugins (override in subclasses)
   */
  protected initializePlugins(): void {
    // Default: no plugins
  }

  /**
   * Register a plugin
   */
  public registerPlugin(plugin: RendererPlugin): void {
    if (!this.plugins.has(plugin.stage)) {
      this.plugins.set(plugin.stage, []);
    }
    this.plugins.get(plugin.stage)!.push(plugin);
  }

  /**
   * Unregister a plugin
   */
  public unregisterPlugin(pluginName: string): void {
    this.plugins.forEach((plugins, stage) => {
      const filtered = plugins.filter(p => p.name !== pluginName);
      this.plugins.set(stage, filtered);
    });
  }

  /**
   * Execute plugins for a stage
   */
  protected async executePlugins(
    stage: RenderStage,
    context: RenderContext
  ): Promise<void> {
    const plugins = this.plugins.get(stage) || [];

    for (const plugin of plugins) {
      await plugin.execute(context, this);
    }
  }

  /**
   * Create render context
   */
  protected createRenderContext(): RenderContext {
    const style = this.config.style || {};
    const moduleCount = this.generator.getModuleCount();
    const margin = style.margin ?? 4;
    const totalModules = moduleCount + margin * 2;
    const size = style.size || 200;
    const moduleSize = size / totalModules;

    return {
      generator: this.generator,
      config: this.config,
      style,
      moduleCount,
      moduleSize,
      margin,
      totalSize: size,
    };
  }

  /**
   * Main render pipeline
   */
  protected async renderPipeline(): Promise<void> {
    const context = this.createRenderContext();

    const stages = [
      RenderStage.Initialize,
      RenderStage.PreRender,
      RenderStage.DrawBackground,
      RenderStage.DrawModules,
      RenderStage.DrawEyes,
      RenderStage.DrawLogo,
      RenderStage.ApplyEffects,
      RenderStage.PostRender,
      RenderStage.Complete,
    ];

    for (const stage of stages) {
      this.currentStage = stage;

      // Execute stage-specific rendering
      await this.executeStage(stage, context);

      // Execute plugins for this stage
      await this.executePlugins(stage, context);
    }
  }

  /**
   * Execute specific render stage (override in subclasses)
   */
  protected abstract executeStage(
    stage: RenderStage,
    context: RenderContext
  ): void | Promise<void>;

  /**
   * Get rendered element
   */
  public abstract getElement(): HTMLElement | null;

  /**
   * Convert to data URL
   */
  public abstract toDataURL(format?: 'png' | 'jpeg', quality?: number): string;

  /**
   * Download rendered QR code
   */
  public abstract download(fileName: string, format?: 'png' | 'jpeg', quality?: number): void;

  /**
   * Update configuration and re-render
   */
  public async update(config: Partial<QRCodeConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    this.generator.update(config);
    await this.renderPipeline();
  }

  /**
   * Get current render stage
   */
  public getCurrentStage(): RenderStage {
    return this.currentStage;
  }

  /**
   * Get configuration
   */
  public getConfig(): QRCodeConfig {
    return { ...this.config };
  }

  /**
   * Get generator
   */
  public getGenerator(): QRCodeGenerator {
    return this.generator;
  }

  /**
   * Destroy renderer and cleanup resources
   */
  public destroy(): void {
    // Override in subclasses for cleanup
  }
}

/**
 * Canvas-based renderer base class
 */
export abstract class CanvasBaseRenderer extends BaseRenderer {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;

  constructor(config: QRCodeConfig) {
    super(config);

    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    this.ctx = ctx;
  }

  public getElement(): HTMLCanvasElement {
    return this.canvas;
  }

  public toDataURL(format: 'png' | 'jpeg' = 'png', quality?: number): string {
    if (format === 'jpeg') {
      return this.canvas.toDataURL('image/jpeg', quality);
    }
    return this.canvas.toDataURL('image/png');
  }

  public download(fileName: string, format: 'png' | 'jpeg' = 'png', quality?: number): void {
    const dataURL = this.toDataURL(format, quality);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    link.click();
  }

  /**
   * Clear canvas
   */
  protected clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Set canvas size
   */
  protected setCanvasSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

/**
 * SVG-based renderer base class
 */
export abstract class SVGBaseRenderer extends BaseRenderer {
  protected svg: SVGSVGElement;

  constructor(config: QRCodeConfig) {
    super(config);

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  public getElement(): SVGSVGElement {
    return this.svg;
  }

  public toDataURL(_format?: 'png' | 'jpeg', _quality?: number): string {
    throw new Error('SVG renderer does not support toDataURL');
  }

  public download(fileName: string): void {
    const svgString = this.toString();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Convert SVG to string
   */
  public abstract toString(): string;

  /**
   * Set SVG dimensions
   */
  protected setSVGSize(width: number, height: number): void {
    this.svg.setAttribute('width', width.toString());
    this.svg.setAttribute('height', height.toString());
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }
}

/**
 * Example plugin: Performance logger
 */
export class PerformanceLoggerPlugin implements RendererPlugin {
  public name = 'performance-logger';
  public stage = RenderStage.Complete;
  private startTime: number = 0;

  constructor() {
    this.startTime = performance.now();
  }

  execute(_context: RenderContext): void {
    const duration = performance.now() - this.startTime;
    console.log(`[PerformanceLogger] Render completed in ${duration.toFixed(2)}ms`);
  }
}

/**
 * Example plugin: Debug overlay
 */
export class DebugOverlayPlugin implements RendererPlugin {
  public name = 'debug-overlay';
  public stage = RenderStage.PostRender;

  execute(context: RenderContext, renderer: BaseRenderer): void {
    if (renderer instanceof CanvasBaseRenderer) {
      const ctx = renderer['ctx'];

      // Draw debug info
      ctx.save();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(0, 0, context.totalSize, context.totalSize);

      ctx.fillStyle = '#ff0000';
      ctx.font = '12px monospace';
      ctx.fillText(`Modules: ${context.moduleCount}x${context.moduleCount}`, 10, 20);
      ctx.fillText(`Size: ${context.totalSize}px`, 10, 35);

      ctx.restore();
    }
  }
}


