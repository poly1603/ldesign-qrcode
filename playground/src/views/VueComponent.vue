<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <header class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
        <Component class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Vue 3 组件</h1>
        <p class="text-slate-600 dark:text-slate-400">完整的组件、Composables 和指令支持</p>
      </div>
    </header>

    <!-- QRCode 组件 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Box class="w-5 h-5 text-emerald-500" />
        QRCode 组件
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">最简单的组件使用方式</p>
      
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">内容</label>
              <input
                v-model="content"
                type="text"
                class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">尺寸</label>
              <input
                v-model.number="size"
                type="number"
                min="100"
                max="400"
                class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">点阵样式</label>
              <select
                v-model="dotStyle"
                class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              >
                <option value="square">方形</option>
                <option value="rounded">圆角</option>
                <option value="dots">圆点</option>
                <option value="diamond">菱形</option>
                <option value="liquid">液态</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">前景色</label>
              <input
                v-model="fgColor"
                type="color"
                class="w-full h-10 rounded-xl cursor-pointer"
              />
            </div>
          </div>
          <CodeBlock :code="componentCode" language="html" />
        </div>
        <div class="flex justify-center items-center">
          <div ref="componentContainer" class="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl"></div>
        </div>
      </div>
    </section>

    <!-- useQRCode Composable -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Webhook class="w-5 h-5 text-violet-500" />
        useQRCode Composable
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">使用 Composition API 进行灵活控制（自动生成）</p>
      
      <div class="grid lg:grid-cols-2 gap-6">
        <CodeBlock :code="composableCode" language="typescript" />
        <div class="space-y-4">
          <div ref="composableContainer" class="flex justify-center bg-slate-50 dark:bg-slate-700 p-6 rounded-xl min-h-[200px]"></div>
          <div class="flex gap-3">
            <button
              @click="generateWithComposable"
              class="flex-1 px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play class="w-4 h-4" />
              生成
            </button>
            <button
              @click="downloadWithComposable"
              :disabled="!isReady"
              class="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download class="w-4 h-4" />
              下载
            </button>
          </div>
          <div class="text-center text-sm text-slate-500">
            状态: {{ isReady ? '就绪' : isGenerating ? '生成中...' : '等待生成' }}
          </div>
        </div>
      </div>
    </section>

    <!-- v-qrcode 指令 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Wand2 class="w-5 h-5 text-amber-500" />
        v-qrcode 指令
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-sm mb-6">使用 Vue 指令快速生成二维码</p>
      
      <div class="grid lg:grid-cols-2 gap-6">
        <CodeBlock :code="directiveCode" language="html" />
        <div class="flex flex-wrap gap-4 justify-center items-center bg-slate-50 dark:bg-slate-700 p-6 rounded-xl">
          <div v-qrcode="'https://example.com'" class="bg-white dark:bg-slate-800 p-3 rounded-xl shadow"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Component, Box, Webhook, Wand2, Play, Download } from 'lucide-vue-next'
import { useQRCode, vQRCode as vQrcode } from '@ldesign/qrcode-vue'
import { createQRCode } from '@ldesign/qrcode-core'
import CodeBlock from '@/components/CodeBlock.vue'

const content = ref('https://example.com')
const size = ref(180)
const dotStyle = ref('rounded')
const fgColor = ref('#000000')

const componentContainer = ref<HTMLElement>()
const composableContainer = ref<HTMLElement>()

const composableContainerRef = ref<HTMLElement>()
const { container, isReady, isGenerating, generate, download, refresh } = useQRCode(
  { content: 'https://example.com', style: { size: 180, dotStyle: 'rounded', gradient: { type: 'linear', colors: ['#8b5cf6', '#6366f1'] } } },
  { immediate: false }
)

const componentCode = computed(() => `<template>
  <QRCode
    content="${content.value}"
    :size="${size.value}"
    dot-style="${dotStyle.value}"
    fg-color="${fgColor.value}"
  />
</template>

<script setup>
import { QRCode } from '@ldesign/qrcode-vue'
<\/script>`)

const composableCode = `import { useQRCode } from '@ldesign/qrcode-vue'

const {
  container,      // 容器元素 ref
  isReady,        // 是否就绪
  isGenerating,   // 是否生成中
  generate,       // 生成方法
  download,       // 下载方法
  destroy         // 销毁方法
} = useQRCode({
  content: 'https://example.com',
  style: { size: 200 }
})`

const directiveCode = `<!-- 基础用法 -->
<div v-qrcode="'https://example.com'" />

<!-- SVG 渲染 + 深色模式 -->
<div v-qrcode.svg.dark="'https://example.com'" />

<!-- 尺寸修饰符 -->
<div v-qrcode.small="'内容'" />
<div v-qrcode.large="'内容'" />

<!-- 自动主题适配 -->
<div v-qrcode.auto="'内容'" />`

const renderComponent = () => {
  if (componentContainer.value) {
    componentContainer.value.innerHTML = ''
    createQRCode({
      content: content.value,
      container: componentContainer.value,
      style: { size: size.value, dotStyle: dotStyle.value as any, fgColor: fgColor.value }
    })
  }
}

const generateWithComposable = async () => {
  if (composableContainer.value) {
    container.value = composableContainer.value
    await generate({
      content: 'https://example.com',
      style: { size: 180, dotStyle: 'rounded', gradient: { type: 'linear', colors: ['#8b5cf6', '#6366f1'] } }
    })
  }
}

const downloadWithComposable = () => download('qrcode-composable', 'png')

const refreshComposable = () => refresh()

watch([content, size, dotStyle, fgColor], renderComponent)

onMounted(async () => {
  renderComponent()
  // 自动生成 composable 示例
  await nextTick()
  if (composableContainer.value) {
    container.value = composableContainer.value
    await generate()
  }
})
</script>
