# @ldesign/qrcode-vue

Vue 3 components and composables for QR code generator with full TypeScript support.

## Features

- 🎨 **Rich Components**: Ready-to-use Vue components
- 🎯 **Composables**: Powerful Vue 3 composables
- 📱 **Directives**: Easy-to-use Vue directives
- 🔧 **Type-Safe**: Full TypeScript support
- ⚡ **Performance**: Optimized for Vue 3

## Installation

```bash
pnpm add @ldesign/qrcode-vue
```

## Quick Start

### Component Usage

```vue
<template>
  <QRCode
    content="https://example.com"
    :size="300"
    dotStyle="rounded"
    :animated="true"
    @ready="onReady"
  />
</template>

<script setup>
import { QRCode } from '@ldesign/qrcode-vue';

const onReady = (instance) => {
  console.log('QR code ready:', instance);
};
</script>
```

### Composable Usage

```vue
<template>
  <div>
    <div ref="container"></div>
    <button @click="download">Download</button>
  </div>
</template>

<script setup>
import { useQRCode } from '@ldesign/qrcode-vue';

const {
  container,
  generate,
  download,
  isReady
} = useQRCode({
  content: 'https://example.com',
  style: {
    size: 300,
    dotStyle: 'rounded'
  }
}, {
  immediate: true
});
</script>
```

### Directive Usage

```vue
<template>
  <div v-qrcode="{ content: 'https://example.com', size: 300 }"></div>
</template>

<script setup>
import { vQRCode } from '@ldesign/qrcode-vue';
</script>
```

## API Documentation

See [full documentation](../../docs) for detailed API reference.

## License

MIT

