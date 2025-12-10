<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <header class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
        <Code2 class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">原生 JavaScript</h1>
        <p class="text-slate-600 dark:text-slate-400">不依赖任何框架，纯 JavaScript API</p>
      </div>
    </header>

    <!-- 基础用法 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Play class="w-5 h-5 text-blue-500" />
        基础用法
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">最简单的二维码生成方式</p>
      
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="flex gap-3">
            <input
              v-model="basicContent"
              type="text"
              placeholder="输入内容..."
              class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <button
              @click="generateBasic"
              class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Zap class="w-4 h-4" />
              生成
            </button>
          </div>
          <CodeBlock :code="basicCode" language="javascript" />
        </div>
        <div class="flex justify-center items-center">
          <div ref="basicContainer" class="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl min-w-[220px] min-h-[220px] flex items-center justify-center"></div>
        </div>
      </div>
    </section>

    <!-- 导出为 Data URL -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <FileImage class="w-5 h-5 text-emerald-500" />
        导出为 Data URL
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">将二维码导出为 Base64 图片</p>
      
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <CodeBlock :code="dataUrlCode" language="javascript" />
          <div class="flex gap-3">
            <button
              @click="generateDataUrl('png')"
              class="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileImage class="w-4 h-4" />
              导出 PNG
            </button>
            <button
              @click="generateDataUrl('jpeg')"
              class="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileImage class="w-4 h-4" />
              导出 JPEG
            </button>
          </div>
        </div>
        <div v-if="dataUrl" class="space-y-4">
          <img :src="dataUrl" alt="QR Code" class="mx-auto rounded-xl shadow-lg" />
          <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <p class="text-xs text-slate-500 dark:text-slate-400 break-all font-mono line-clamp-3">
              {{ dataUrl }}
            </p>
          </div>
        </div>
        <div v-else class="flex items-center justify-center bg-slate-50 dark:bg-slate-700 rounded-xl min-h-[200px]">
          <p class="text-slate-400">点击左侧按钮导出</p>
        </div>
      </div>
    </section>

    <!-- SVG 渲染 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <FileCode class="w-5 h-5 text-violet-500" />
        SVG 渲染
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">矢量图形，支持无损缩放</p>
      
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <CodeBlock :code="svgCode" language="javascript" />
          <button
            @click="generateSvg"
            class="w-full px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FileCode class="w-4 h-4" />
            生成 SVG
          </button>
        </div>
        <div class="flex justify-center items-center">
          <div ref="svgContainer" class="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl"></div>
        </div>
      </div>
    </section>

    <!-- 下载功能 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Download class="w-5 h-5 text-cyan-500" />
        下载功能
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">一键下载二维码图片</p>
      
      <div class="grid lg:grid-cols-2 gap-6">
        <CodeBlock :code="downloadCode" language="javascript" />
        <div class="flex flex-col justify-center items-center gap-4">
          <div ref="downloadContainer" class="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl"></div>
          <div class="flex gap-3">
            <button
              @click="downloadQRCode('png')"
              class="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Download class="w-4 h-4" />
              下载 PNG
            </button>
            <button
              @click="downloadQRCode('svg')"
              class="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Download class="w-4 h-4" />
              下载 SVG
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Code2, Play, Zap, FileImage, FileCode, Download } from 'lucide-vue-next'
import { createQRCode, toDataURL, type QRCodeInstance } from '@ldesign/qrcode-core'
import CodeBlock from '@/components/CodeBlock.vue'

const basicContent = ref('https://example.com')
const basicContainer = ref<HTMLElement>()
const svgContainer = ref<HTMLElement>()
const downloadContainer = ref<HTMLElement>()
const dataUrl = ref('')

let downloadInstance: QRCodeInstance | null = null

const basicCode = `import { createQRCode } from '@ldesign/qrcode-core'

const qrcode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qrcode'),
  style: { size: 200 }
})

// 更新内容
qrcode.update({ content: '新内容' })

// 销毁实例
qrcode.destroy()`

const dataUrlCode = `import { toDataURL } from '@ldesign/qrcode-core'

// 生成 PNG Data URL
const pngUrl = await toDataURL('https://example.com', {
  style: { size: 200 }
}, 'png')

// 生成 JPEG
const jpegUrl = await toDataURL('...', {...}, 'jpeg', 0.9)`

const svgCode = `import { createQRCode } from '@ldesign/qrcode-core'

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qrcode'),
  renderType: 'svg',
  style: {
    size: 200,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#8b5cf6', '#6366f1']
    }
  }
})`

const downloadCode = `const qrcode = createQRCode({...})

// 下载为 PNG
qrcode.download({
  fileName: 'my-qrcode',
  format: 'png'
})

// 下载为 SVG (需要 renderType: 'svg')
qrcode.download({
  fileName: 'my-qrcode',
  format: 'svg'
})`

const generateBasic = () => {
  if (basicContainer.value) {
    basicContainer.value.innerHTML = ''
    createQRCode({
      content: basicContent.value,
      container: basicContainer.value,
      style: { size: 180 }
    })
  }
}

const generateDataUrl = async (format: 'png' | 'jpeg') => {
  dataUrl.value = await toDataURL(basicContent.value, { style: { size: 180 } }, format)
}

const generateSvg = () => {
  if (svgContainer.value) {
    svgContainer.value.innerHTML = ''
    createQRCode({
      content: basicContent.value,
      container: svgContainer.value,
      renderType: 'svg',
      style: {
        size: 180,
        dotStyle: 'rounded',
        gradient: { type: 'linear', colors: ['#8b5cf6', '#6366f1'], direction: 45 }
      }
    })
  }
}

const downloadQRCode = (format: 'png' | 'svg') => {
  downloadInstance?.download({ fileName: 'qrcode-demo', format })
}

onMounted(() => {
  generateBasic()
  
  if (downloadContainer.value) {
    downloadInstance = createQRCode({
      content: 'https://example.com',
      container: downloadContainer.value,
      style: { size: 160, dotStyle: 'rounded' }
    })
  }
})
</script>
