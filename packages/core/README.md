# @ldesign/qrcode-core

Ultra-high performance QR code generator core engine with WebGL acceleration, advanced filters, 3D transforms, and memory optimization.

## Features

- 🚀 **High Performance**: WebGL acceleration for complex QR codes
- 🎨 **Rich Styling**: Multiple dot styles, gradients, filters, and effects
- 📱 **Multi-Format**: Canvas, SVG, and WebGL rendering
- 🔍 **QR Scanner**: Built-in QR code scanner with AI enhancement
- 🎯 **Type-Safe**: Full TypeScript support
- 📦 **Tree-Shakable**: Modular design for optimal bundle size

## Installation

```bash
pnpm add @ldesign/qrcode-core
```

## Quick Start

```typescript
import { createQRCode } from '@ldesign/qrcode-core';

// Create a simple QR code
const qrcode = createQRCode({
  content: 'https://example.com',
  renderType: 'canvas',
  style: {
    size: 300,
    dotStyle: 'rounded',
    fgColor: '#000000',
    bgColor: '#ffffff'
  }
});

// Append to container
document.getElementById('qrcode-container').appendChild(qrcode.getElement());
```

## Advanced Usage

### WebGL Rendering

```typescript
import { createQRCode } from '@ldesign/qrcode-core';

const qrcode = createQRCode({
  content: 'https://example.com',
  renderType: 'webgl',
  style: {
    size: 500,
    gradient: {
      type: 'radial',
      colors: ['#667eea', '#764ba2']
    },
    transform3D: {
      rotateX: 15,
      rotateY: 15
    }
  }
});
```

### QR Code Scanner

```typescript
import { QRCodeScanner } from '@ldesign/qrcode-core';

const scanner = new QRCodeScanner({
  video: videoElement,
  onScan: (result) => {
    console.log('QR code detected:', result.text);
  }
});

scanner.start();
```

## API Documentation

See [full documentation](../../docs) for detailed API reference.

## License

MIT

