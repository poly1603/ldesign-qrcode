# QRCode v3.0 API 参考文档

## 目录

- [核心API](#核心api)
- [渲染器](#渲染器)
- [对象池](#对象池)
- [内存优化](#内存优化)
- [滤镜系统](#滤镜系统)
- [3D变换](#3d变换)
- [扫描器](#扫描器)
- [调试工具](#调试工具)
- [类型定义](#类型定义)

## 核心API

### createQRCode()

创建QR码实例。

```typescript
function createQRCode(config: GenerateOptions): QRCodeInstance
```

**参数**:
- `config.content` - 要编码的内容
- `config.container` - 容器元素
- `config.renderType` - 渲染类型: `'canvas'` | `'svg'` | `'webgl'`
- `config.style` - 样式配置
- `config.logo` - Logo配置

**返回**: `QRCodeInstance`

**示例**:
```typescript
const qr = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
  renderType: 'webgl',
  style: {
    size: 300,
    dotStyle: 'rounded',
  },
});
```

### QRCodeInstance

**方法**:

#### update()
```typescript
async update(config: Partial<QRCodeConfig>): Promise<void>
```

更新QR码配置并重新渲染。

#### toDataURL()
```typescript
toDataURL(format?: 'png' | 'jpeg', quality?: number): string
```

导出为Data URL（Canvas/WebGL）。

#### download()
```typescript
download(options?: DownloadOptions): void
```

下载QR码图片。

#### destroy()
```typescript
destroy(): void
```

销毁实例并清理资源。

## 渲染器

### isWebGLSupported()

检查浏览器是否支持WebGL。

```typescript
function isWebGLSupported(): boolean
```

**示例**:
```typescript
if (isWebGLSupported()) {
  createQRCode({ renderType: 'webgl', ... });
}
```

### WebGLRenderer

WebGL渲染器类（直接使用较少见）。

```typescript
class WebGLRenderer {
  constructor(config: QRCodeConfig)
  render(): void
  getCanvas(): HTMLCanvasElement
  toDataURL(format?: 'png' | 'jpeg', quality?: number): string
  update(config: Partial<QRCodeConfig>): void
  destroy(): void
}
```

### BaseRenderer

渲染器基类，用于创建自定义渲染器。

```typescript
abstract class BaseRenderer {
  registerPlugin(plugin: RendererPlugin): void
  unregisterPlugin(pluginName: string): void
  getConfig(): QRCodeConfig
  destroy(): void
}
```

## 对象池

### canvasPool

全局Canvas对象池。

```typescript
const canvasPool: CanvasPool

// 方法
canvasPool.acquire(): HTMLCanvasElement
canvasPool.release(canvas: HTMLCanvasElement): void
canvasPool.cleanup(): number
canvasPool.clear(): void
canvasPool.getStats(): PoolStats
```

**示例**:
```typescript
import { canvasPool } from '@ldesign/qrcode';

for (const url of urls) {
  const canvas = canvasPool.acquire();
  // 使用 canvas
  canvasPool.release(canvas);
}
```

### imageDataPool

ImageData对象池。

```typescript
const imageDataPool: ImageDataPool

// 方法
imageDataPool.acquire(width: number, height: number): ImageData
imageDataPool.release(imageData: ImageData): void
imageDataPool.clear(): void
imageDataPool.getStats(): Record<string, PoolStats>
```

### getAllPoolStats()

获取所有对象池统计信息。

```typescript
function getAllPoolStats(): {
  canvas: PoolStats;
  imageData: Record<string, PoolStats>;
  path2D: PoolStats | null;
  offscreenCanvas: PoolStats | null;
}
```

### cleanupAllPools()

清理所有对象池。

```typescript
function cleanupAllPools(): void
```

## 内存优化

### BitArray

高效的位数组实现。

```typescript
class BitArray {
  constructor(length: number)
  
  set(index: number): void
  clear(index: number): void
  get(index: number): boolean
  toggle(index: number): void
  
  count(): number
  getByteSize(): number
  clone(): BitArray
  
  toArray(): boolean[]
  static fromArray(arr: boolean[]): BitArray
}
```

**示例**:
```typescript
import { BitArray } from '@ldesign/qrcode';

const bits = new BitArray(1000);
bits.set(10);
bits.set(20);
console.log(bits.count()); // 2
console.log(bits.getByteSize()); // 125 bytes
```

### BitMatrix

2D位矩阵。

```typescript
class BitMatrix {
  constructor(width: number, height: number)
  
  set(row: number, col: number): void
  get(row: number, col: number): boolean
  
  getWidth(): number
  getHeight(): number
  getByteSize(): number
  
  clone(): BitMatrix
  toArray(): boolean[][]
  static fromArray(arr: boolean[][]): BitMatrix
}
```

### calculateMemorySavings()

计算内存节省。

```typescript
function calculateMemorySavings(moduleCount: number): {
  booleanArray: number;
  bitArray: number;
  savings: number;
  savingsPercent: number;
}
```

## 滤镜系统

### FilterType

```typescript
enum FilterType {
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
```

### applyFilter()

应用单个滤镜。

```typescript
function applyFilter(
  canvas: HTMLCanvasElement,
  config: FilterConfig
): void
```

### applyFilterChain()

应用滤镜链。

```typescript
function applyFilterChain(
  canvas: HTMLCanvasElement,
  configs: FilterConfig[]
): void
```

**示例**:
```typescript
import { applyFilterChain, FilterType } from '@ldesign/qrcode';

const qr = createQRCode({ ... });
const canvas = qr.getElement();

applyFilterChain(canvas, [
  { type: FilterType.Sepia, intensity: 0.5 },
  { type: FilterType.Contrast, intensity: 0.2 },
]);
```

## 3D变换

### Matrix4

4x4变换矩阵。

```typescript
class Matrix4 {
  static identity(): Matrix4
  static translation(x: number, y: number, z: number): Matrix4
  static rotationX(angle: number): Matrix4
  static rotationY(angle: number): Matrix4
  static rotationZ(angle: number): Matrix4
  static scaling(x: number, y: number, z: number): Matrix4
  
  multiply(other: Matrix4): Matrix4
  transformPoint(x: number, y: number, z: number): Point3D
  toCSSTransform(): string
}
```

### apply3DTransform()

应用3D变换到Canvas上下文。

```typescript
function apply3DTransform(
  ctx: CanvasRenderingContext2D,
  config: Transform3DConfig,
  width: number,
  height: number
): void
```

### applyIsometricProjection()

应用等距投影。

```typescript
function applyIsometricProjection(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angle?: number
): void
```

## 扫描器

### MultiFormatDecoder

多格式条码解码器。

```typescript
class MultiFormatDecoder {
  constructor(formats?: BarcodeFormat[])
  
  async decode(imageSource: ImageBitmapSource): Promise<DecodeResult[]>
  async decodeFromCanvas(canvas: HTMLCanvasElement): Promise<DecodeResult[]>
  isFormatSupported(format: BarcodeFormat): boolean
  getSupportedFormats(): BarcodeFormat[]
  
  static isSupported(): boolean
}
```

**示例**:
```typescript
import { MultiFormatDecoder, BarcodeFormat } from '@ldesign/qrcode';

const decoder = new MultiFormatDecoder([
  BarcodeFormat.QR_CODE,
  BarcodeFormat.EAN_13,
]);

const results = await decoder.decode(image);
results.forEach(r => {
  console.log(`${r.format}: ${r.data}`);
});
```

### AIEnhancedScanner

AI增强扫描器。

```typescript
class AIEnhancedScanner {
  async preprocessImage(
    imageData: ImageData,
    config?: PreprocessConfig
  ): Promise<ImageData>
  
  calculateImageQuality(imageData: ImageData): QualityScore
  suggestPreprocessing(imageData: ImageData): PreprocessConfig
  
  static async isAvailable(): Promise<boolean>
}
```

**示例**:
```typescript
import { AIEnhancedScanner } from '@ldesign/qrcode';

const aiScanner = new AIEnhancedScanner();
const enhanced = await aiScanner.preprocessImage(imageData, {
  autoCorrect: true,
  enhanceLowLight: true,
  sharpen: true,
});
```

## 调试工具

### enableDebugMode()

启用调试模式。

```typescript
function enableDebugMode(): void
```

### getPerformanceReport()

获取性能报告。

```typescript
function getPerformanceReport(): string
```

### performanceMonitor

全局性能监控器。

```typescript
const performanceMonitor: QRCodePerformanceMonitor

// 方法
performanceMonitor.start(id: string): void
performanceMonitor.end(id: string, metadata?: Partial<PerformanceMetrics>): void
performanceMonitor.getAverageRenderTime(): number
performanceMonitor.getCacheHitRate(): number
performanceMonitor.exportCSV(): string
```

### qrDebugger

全局调试器。

```typescript
const qrDebugger: QRCodeDebugger

// 方法
qrDebugger.validateConfig(config: QRCodeConfig): ValidationIssue[]
qrDebugger.analyzeStructure(matrix: boolean[][]): StructureInfo
qrDebugger.generateReport(config: any, metrics?: PerformanceMetrics): string
```

## 类型定义

### Transform3DConfig

```typescript
interface Transform3DConfig {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  perspective?: number;
  perspectiveOriginX?: number;
  perspectiveOriginY?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  skewX?: number;
  skewY?: number;
  lightSource?: { x: number; y: number; z: number };
  ambientLight?: number;
  diffuseLight?: number;
}
```

### FilterConfig

```typescript
interface FilterConfig {
  type: FilterType;
  intensity?: number;
  radius?: number;
  threshold?: number;
}
```

### PreprocessConfig

```typescript
interface PreprocessConfig {
  autoCorrect?: boolean;
  enhanceLowLight?: boolean;
  sharpen?: boolean;
  upscale?: boolean;
  denoise?: boolean;
}
```

### DecodeResult

```typescript
interface DecodeResult {
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
```

## 完整导出列表

```typescript
// 核心
export {
  createQRCode,
  generateQRCode,
  toDataURL,
  toSVGString,
}

// 渲染器
export {
  isWebGLSupported,
  WebGLRenderer,
  BaseRenderer,
  CanvasBaseRenderer,
  SVGBaseRenderer,
}

// 对象池
export {
  ObjectPool,
  CanvasPool,
  ImageDataPool,
  canvasPool,
  imageDataPool,
  path2DPool,
  offscreenCanvasPool,
  cleanupAllPools,
  getAllPoolStats,
}

// 内存优化
export {
  BitArray,
  BitMatrix,
  calculateMemorySavings,
}

// 缓存
export {
  QRCodeCacheManager,
  enableCache,
  clearCache,
  clearCacheSync,
  getCacheStats,
  preloadCache,
  cache,
}

// 滤镜
export {
  FilterType,
  applyFilter,
  applyFilterChain,
}

// 3D变换
export {
  Matrix4,
  apply3DTransform,
  apply3DTransformWithLighting,
  applyIsometricProjection,
  applyPerspectiveProjection,
}

// 扫描器
export {
  QRCodeScanner,
  MultiFormatDecoder,
  AutoDecoder,
  BarcodeFormat,
  BarcodeFormatHelper,
}

// AI扫描
export {
  AIEnhancedScanner,
  autoPreprocessImage,
  calculateScanConfidence,
}

// Worker
export {
  EnhancedWorkerPool,
  workerPool,
  batchDownloadEnhanced,
}

// 工具
export {
  QRContentHelper,
  QRCodePresets,
  QRCodeValidator,
  QRCodeOptimizer,
}

// 调试
export {
  QRCodePerformanceMonitor,
  QRCodeDebugger,
  performanceMonitor,
  qrDebugger,
  enableDebugMode,
  disableDebugMode,
  getPerformanceReport,
}

// 编辑器
export {
  QRCodeEditor,
  createQRCodeEditor,
}

// 动画
export {
  applyAnimation,
  injectAnimationStyles,
}
```

---

**完整API数量**: 50+ 个导出项

更多详细信息请参考源代码和TypeScript类型定义。

