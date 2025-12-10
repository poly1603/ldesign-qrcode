import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/qrcode-core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@ldesign/qrcode-vue': resolve(__dirname, '../packages/vue/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['prismjs'],
  },
  server: {
    port: 2222,
    open: true,
    host: true,
  },
})
