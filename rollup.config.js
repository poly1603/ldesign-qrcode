import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import vue from 'rollup-plugin-vue';

const external = ['vue', 'react', 'react-dom'];

const createConfig = (input, outputName, globals = {}) => [
  {
    input,
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    output: {
      file: `dist/${outputName}.esm.js`,
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  },
  {
    input,
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    output: {
      file: `dist/${outputName}.cjs.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
  },
  {
    input,
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    output: {
      file: `dist/${outputName}.umd.js`,
      format: 'umd',
      name: outputName.replace(/-/g, ''),
      sourcemap: true,
      globals,
      exports: 'named',
      inlineDynamicImports: true,
    },
  },
  {
    input,
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      terser(),
    ],
    output: {
      file: `dist/${outputName}.umd.min.js`,
      format: 'umd',
      name: outputName.replace(/-/g, ''),
      sourcemap: true,
      globals,
      exports: 'named',
      inlineDynamicImports: true,
    },
  },
];

const createDtsConfig = (input, output) => ({
  input,
  external,
  plugins: [dts()],
  output: {
    file: output,
    format: 'esm',
  },
});

const createVueConfig = (input, outputName, globals = {}) => [
  {
    input,
    external,
    plugins: [
      vue(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    output: {
      file: `dist/${outputName}.esm.js`,
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  },
  {
    input,
    external,
    plugins: [
      vue(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    output: {
      file: `dist/${outputName}.cjs.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
  },
  {
    input,
    external,
    plugins: [
      vue(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
    output: {
      file: `dist/${outputName}.umd.js`,
      format: 'umd',
      name: outputName.replace(/-/g, ''),
      sourcemap: true,
      globals,
      exports: 'named',
      inlineDynamicImports: true,
    },
  },
  {
    input,
    external,
    plugins: [
      vue(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      terser(),
    ],
    output: {
      file: `dist/${outputName}.umd.min.js`,
      format: 'umd',
      name: outputName.replace(/-/g, ''),
      sourcemap: true,
      globals,
      exports: 'named',
      inlineDynamicImports: true,
    },
  },
];

export default [
  // Core package
  ...createConfig('src/index.ts', 'index'),
  createDtsConfig('src/index.ts', 'dist/index.d.ts'),

  // Vue adapter
  ...createVueConfig('src/adapters/vue/index.ts', 'vue', { vue: 'Vue' }),
  createDtsConfig('src/adapters/vue/index.ts', 'dist/vue.d.ts'),

  // React adapter
  ...createConfig('src/adapters/react/index.tsx', 'react', { react: 'React', 'react-dom': 'ReactDOM' }),
  createDtsConfig('src/adapters/react/index.tsx', 'dist/react.d.ts'),

  // Scanner package  
  ...createConfig('src/scanner/index.ts', 'scanner'),
  createDtsConfig('src/scanner/index.ts', 'dist/scanner.d.ts'),

  // Presets package
  ...createConfig('src/presets/index.ts', 'presets'),
  createDtsConfig('src/presets/index.ts', 'dist/presets.d.ts'),

  // Templates package
  ...createConfig('src/utils/content-templates.ts', 'templates'),
  createDtsConfig('src/utils/content-templates.ts', 'dist/templates.d.ts'),
];
