# QRCode v3.0 快速参考

## 🚀 快速开始

```typescript
import { createQRCode } from '@ldesign/qrcode';

// 基础使用
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
  style: { size: 300 },
});
```

## ⚡ 新功能速查

### WebGL渲染（GPU加速）

```typescript
import { isWebGLSupported } from '@ldesign/qrcode';

if (isWebGLSupported()) {
  createQRCode({
    renderType: 'webgl', // 使用GPU加速
    content: url,
    container: el,
  });
}
```

### 高级滤镜

```typescript
// 单个滤镜
style: {
  filter: { type: 'vintage', intensity: 0.8 }
}

// 滤镜链
style: {
  filter: [
    { type: 'sepia', intensity: 0.5 },
    { type: 'contrast', intensity: 0.2 },
  ]
}
```

**可用滤镜**: blur, sharpen, edge-detect, emboss, grayscale, sepia, invert, brightness, contrast, saturation, hue, vintage, sketch, pixelate

### 3D变换

```typescript
style: {
  transform3D: {
    rotateX: 30,
    rotateY: 20,
    perspective: 1000,
    lightSource: { x: 1, y: 1, z: 1 },
  }
}
```

### 对象池

```typescript
import { canvasPool, getAllPoolStats } from '@ldesign/qrcode';

// 批量处理
for (let i = 0; i < 1000; i++) {
  const canvas = canvasPool.acquire();
  // 使用...
  canvasPool.release(canvas);
}

// 查看统计
console.log(getAllPoolStats());
```

### 内存优化

```typescript
import { BitMatrix, calculateMemorySavings } from '@ldesign/qrcode';

// 计算节省
const savings = calculateMemorySavings(177);
console.log(`节省 ${savings.savingsPercent}% 内存`);

// 使用BitMatrix
const matrix = new BitMatrix(21, 21);
matrix.set(10, 10);
```

### 分层缓存

```typescript
import { 
  getCacheStats, 
  preloadCache, 
  clearCache 
} from '@ldesign/qrcode';

// 预加载
await preloadCache([
  { content: 'https://app.com/home', style: { size: 200 } }
]);

// 查看统计
const stats = getCacheStats();
console.log(stats.hitRate); // 命中率

// 清除缓存
await clearCache();
```

## 📊 性能提升

| 场景 | v2.0 | v3.0 | 提升 |
|------|------|------|------|
| 简单QR码 | 25ms | 15ms | 40% |
| 复杂渐变 | 80ms | 25ms | 220% |
| 批量100个 | 2500ms | 1000ms | 150% |

| 内存 | v2.0 | v3.0 | 节省 |
|------|------|------|------|
| 单个QR码 | 200KB | 80KB | 60% |
| Version 40 | 31KB | 4KB | 87% |

## 🎯 选择指南

### 何时使用Canvas？
- ✅ 简单QR码
- ✅ 需要最大兼容性
- ✅ 没有复杂效果

### 何时使用WebGL？
- ✅ 复杂渐变效果
- ✅ 批量生成（100+）
- ✅ 实时动画
- ✅ 3D变换

### 何时使用SVG？
- ✅ 需要矢量图形
- ✅ 需要可缩放
- ✅ 文件大小重要

## 💡 最佳实践

```typescript
// 1. 批量生成 - 使用对象池
import { canvasPool } from '@ldesign/qrcode';

for (const url of urls) {
  const canvas = canvasPool.acquire();
  // ...
  canvasPool.release(canvas);
}

// 2. 复杂效果 - 使用WebGL
if (isWebGLSupported()) {
  createQRCode({ renderType: 'webgl', ... });
}

// 3. 销毁实例 - 防止内存泄漏
const qr = createQRCode({ ... });
qr.destroy();

// 4. 预加载缓存 - 提升响应速度
await preloadCache([
  { content: 'https://app.com/home' },
]);

// 5. 定期清理 - 释放资源
import { cleanupAllPools } from '@ldesign/qrcode';
setInterval(cleanupAllPools, 60000);
```

## 🔧 调试工具

```typescript
// 缓存统计
const stats = getCacheStats();
console.log(`命中率: ${stats.hitRate}%`);
console.log(`内存命中: ${stats.memoryHits}`);
console.log(`持久化命中: ${stats.persistentHits}`);

// 对象池统计
const poolStats = getAllPoolStats();
console.log(`Canvas池: ${poolStats.canvas.inUse}/${poolStats.canvas.total}`);

// 内存节省
const savings = calculateMemorySavings(177);
console.log(`节省: ${savings.savings} bytes`);
```

## 📦 导入路径

```typescript
// 核心功能
import { createQRCode } from '@ldesign/qrcode';

// 扫描器
import { QRCodeScanner } from '@ldesign/qrcode/scanner';

// 预设
import { QRCodePresets } from '@ldesign/qrcode/presets';

// 模板
import { QRContentHelper } from '@ldesign/qrcode/templates';

// Vue
import { QRCode } from '@ldesign/qrcode/vue';

// React
import { QRCode } from '@ldesign/qrcode/react';
```

## 🎨 常用配置

```typescript
// 复古风格
{
  style: {
    size: 300,
    dotStyle: 'rounded',
    filter: { type: 'vintage', intensity: 0.8 }
  }
}

// 3D立体
{
  style: {
    size: 300,
    transform3D: {
      rotateX: 30,
      rotateY: 20,
      perspective: 1000,
      lightSource: { x: 1, y: 1, z: 1 }
    }
  }
}

// 霓虹发光
{
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#f093fb', '#f5576c']
    },
    shadow: {
      blur: 20,
      color: 'rgba(245, 87, 108, 0.8)'
    }
  }
}
```

## 🐛 常见问题

### WebGL不工作？
```typescript
if (!isWebGLSupported()) {
  console.log('使用Canvas降级');
  createQRCode({ renderType: 'canvas', ... });
}
```

### 内存占用过高？
```typescript
// 1. 销毁不用的实例
qr.destroy();

// 2. 清理对象池
cleanupAllPools();

// 3. 使用BitMatrix
const matrix = new BitMatrix(21, 21);
```

### 缓存不生效？
```typescript
// 检查缓存状态
const stats = getCacheStats();
if (stats.hitRate < 50) {
  // 可能是TTL过短或内容变化太快
  // 调整缓存配置
}
```

## 📚 更多资源

- [完整文档](./docs/guide/v3-new-features.md)
- [优化日志](./OPTIMIZATION_CHANGELOG.md)
- [实施总结](./V3_IMPLEMENTATION_SUMMARY.md)
- [示例演示](./examples/v3-features-demo.html)

---

**版本**: 3.0.0  
**更新**: 2024年


