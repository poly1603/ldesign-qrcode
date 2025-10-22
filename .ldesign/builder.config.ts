/**
 * @ldesign/qrcode 构建配置
 * 
 * 二维码生成和扫描库，支持多框架
 * 包含多个导出点：核心、Vue、React、Scanner、Presets、Templates
 */

import { defineConfig, monorepoPackage } from '@ldesign/builder'

export default defineConfig(
  monorepoPackage({
    // 输出配置 - 多入口点
    output: {
      // ESM 格式 - 输出到 dist/ 目录
      esm: {
        dir: 'dist',
        format: 'esm',
        preserveStructure: false, // 不保留结构，打包为单文件
        dts: true,
        // 多个入口点
        input: {
          index: 'src/index.ts',
          vue: 'src/vue.ts',
          react: 'src/react.tsx',
          scanner: 'src/scanner.ts',
          presets: 'src/presets.ts',
          templates: 'src/templates.ts'
        }
      },

      // CJS 格式 - 输出到 dist/ 目录
      cjs: {
        dir: 'dist',
        format: 'cjs',
        preserveStructure: false,
        dts: true,
        // 多个入口点
        input: {
          index: 'src/index.ts',
          vue: 'src/vue.ts',
          react: 'src/react.tsx',
          scanner: 'src/scanner.ts',
          presets: 'src/presets.ts',
          templates: 'src/templates.ts'
        }
      },

      // UMD 格式 - 只打包主入口
      umd: {
        dir: 'dist',
        format: 'umd',
        minify: true,
        sourcemap: true,
        input: 'src/index.ts'
      }
    },

    // UMD 构建配置
    umd: {
      enabled: true,
      name: 'LDesignQRCode'
    },

    // 排除非生产代码
    exclude: [
      '**/examples/**',
      '**/example/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/demo/**',
      '**/demos/**',
      '**/docs/**',
      '**/tests/**',
      '**/scripts/**',
      '**/bin/**' // CLI 工具不参与打包
    ],

    // 外部依赖
    external: [
      'vue',
      'react',
      'react-dom',
      'qrcode', // 底层二维码库
      'jsqr' // 扫描库
    ],

    // 全局变量映射
    globals: {
      'vue': 'Vue',
      'react': 'React',
      'react-dom': 'ReactDOM',
      'qrcode': 'QRCode',
      'jsqr': 'jsQR'
    },

    // TypeScript 配置
    typescript: {
      declaration: true,
      target: 'ES2020',
      module: 'ESNext'
    },

    // 性能优化
    performance: {
      treeshaking: true,
      minify: false
    }
  })
)

