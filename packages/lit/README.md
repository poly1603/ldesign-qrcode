# @ldesign/qrcode-lit

Lit Web Components for QR code generator with full TypeScript support.

## Features

- ⚡ **Web Components**: Standard Web Components
- 🔥 **Lit**: Built with Lit framework
- 🎨 **Customizable**: Extensive styling options
- 🔧 **Type-Safe**: Full TypeScript support
- 📦 **Framework Agnostic**: Works with any framework

## Installation

```bash
pnpm add @ldesign/qrcode-lit
```

## Quick Start

### HTML Usage

```html
<qr-code
  content="https://example.com"
  size="300"
  dot-style="rounded"
  fg-color="#000000"
  bg-color="#ffffff"
></qr-code>

<script type="module">
  import '@ldesign/qrcode-lit';
</script>
```

### JavaScript Usage

```javascript
import { QRCodeElement } from '@ldesign/qrcode-lit';

const qrcode = document.createElement('qr-code');
qrcode.content = 'https://example.com';
qrcode.size = 300;
qrcode.dotStyle = 'rounded';

document.body.appendChild(qrcode);

// Listen to events
qrcode.addEventListener('qr-ready', (e) => {
  console.log('QR code ready:', e.detail.instance);
});
```

### With Properties

```javascript
const qrcode = document.querySelector('qr-code');

// Update properties
qrcode.content = 'New content';
qrcode.fgColor = '#2563eb';

// Call methods
qrcode.download('my-qrcode', 'png');
```

## API Documentation

See [full documentation](../../docs) for detailed API reference.

## License

MIT

