# @ldesign/qrcode-react

React components and hooks for QR code generator with full TypeScript support.

## Features

- ⚛️ **React 18+**: Modern React components
- 🎯 **Hooks**: Powerful custom hooks
- 🔧 **Type-Safe**: Full TypeScript support
- ⚡ **Performance**: Optimized with React.memo
- 🎨 **Flexible**: Extensive customization options

## Installation

```bash
pnpm add @ldesign/qrcode-react
```

## Quick Start

### Component Usage

```tsx
import { QRCode } from '@ldesign/qrcode-react';

function App() {
  return (
    <QRCode
      content="https://example.com"
      size={300}
      dotStyle="rounded"
      animated
      onReady={(instance) => {
        console.log('QR code ready:', instance);
      }}
    />
  );
}
```

### Hook Usage

```tsx
import { useQRCode } from '@ldesign/qrcode-react';

function App() {
  const { containerRef, download, isReady } = useQRCode({
    content: 'https://example.com',
    style: {
      size: 300,
      dotStyle: 'rounded'
    }
  }, {
    immediate: true
  });

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={() => download()}>Download</button>
    </div>
  );
}
```

### With Ref

```tsx
import { useRef } from 'react';
import { QRCode, QRCodeRef } from '@ldesign/qrcode-react';

function App() {
  const qrcodeRef = useRef<QRCodeRef>(null);

  const handleDownload = () => {
    qrcodeRef.current?.download('my-qrcode', 'png');
  };

  return (
    <div>
      <QRCode ref={qrcodeRef} content="https://example.com" />
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}
```

## API Documentation

See [full documentation](../../docs) for detailed API reference.

## License

MIT

