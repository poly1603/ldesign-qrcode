<template>
  <div class="space-y-12">
    <!-- 英雄区域 -->
    <section class="text-center py-16">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
        <Sparkles class="w-4 h-4" />
        <span>v3.0 全新发布</span>
      </div>
      
      <h1 class="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
        高性能二维码
        <span class="bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">生成引擎</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        支持 Canvas、SVG、WebGL 渲染，提供 38+ 精美预设样式，
        渐变、Logo、动画等丰富功能，打造专业级二维码体验
      </p>
      
      <!-- 演示二维码 -->
      <div class="flex justify-center mb-10">
        <div class="relative group">
          <div class="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div ref="demoContainer" class="relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 min-w-[250px] min-h-[250px] flex items-center justify-center">
            <div v-if="loading" class="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 class="w-8 h-8 animate-spin" />
              <span class="text-sm">加载中...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能标签 -->
      <div class="flex flex-wrap justify-center gap-3">
        <span v-for="tag in featureTags" :key="tag.text" 
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          :class="tag.class"
        >
          <component :is="tag.icon" class="w-4 h-4" />
          {{ tag.text }}
        </span>
      </div>
    </section>

    <!-- 功能卡片 -->
    <section class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link 
        v-for="card in featureCards" 
        :key="card.path"
        :to="card.path" 
        class="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" :class="card.gradient"></div>
        
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" :class="card.iconBg">
          <component :is="card.icon" class="w-6 h-6 text-white" />
        </div>
        
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ card.title }}
        </h3>
        
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {{ card.description }}
        </p>
        
        <div class="mt-4 flex items-center gap-1 text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>了解更多</span>
          <ArrowRight class="w-4 h-4" />
        </div>
      </router-link>
    </section>

    <!-- 快速开始 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Rocket class="w-5 h-5 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">快速开始</h2>
      </div>
      
      <div class="space-y-6">
        <div>
          <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Package class="w-4 h-4" />
            安装
          </h4>
          <CodeBlock :code="installCode" language="bash" />
        </div>

        <div>
          <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <FileCode class="w-4 h-4" />
            原生 JavaScript 使用
          </h4>
          <CodeBlock :code="jsCode" language="javascript" />
        </div>

        <div>
          <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Component class="w-4 h-4" />
            Vue 组件使用
          </h4>
          <CodeBlock :code="vueCode" language="html" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import { 
  Sparkles, Loader2, Palette, Zap, Image, Layers, Grid3X3, ArrowRight,
  Rocket, Package, FileCode, Component, Code2, Paintbrush, ScanLine
} from 'lucide-vue-next'
import { createQRCode } from '@ldesign/qrcode-core'
import CodeBlock from '@/components/CodeBlock.vue'

const demoContainer = ref<HTMLElement>()
const loading = ref(true)

const featureTags = [
  { text: '38+ 预设样式', icon: markRaw(Palette), class: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { text: '高性能渲染', icon: markRaw(Zap), class: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { text: 'Logo 支持', icon: markRaw(Image), class: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  { text: '渐变效果', icon: markRaw(Layers), class: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  { text: '12+ 点阵样式', icon: markRaw(Grid3X3), class: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
]

const featureCards = [
  { 
    path: '/presets', 
    title: '预设样式库', 
    description: '38+ 精心设计的预设样式，包含渐变、阴影、圆角等多种视觉效果，一键应用',
    icon: markRaw(Palette),
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    gradient: 'from-blue-500 to-indigo-600'
  },
  { 
    path: '/native', 
    title: '原生 JavaScript', 
    description: '不依赖任何框架，纯 JavaScript API，轻松集成到任何 Web 项目',
    icon: markRaw(Code2),
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    gradient: 'from-amber-500 to-orange-600'
  },
  { 
    path: '/vue', 
    title: 'Vue 3 组件', 
    description: '完整的 Vue 3 组件、Composables 和指令，响应式数据绑定',
    icon: markRaw(Component),
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    gradient: 'from-emerald-500 to-teal-600'
  },
  { 
    path: '/styles', 
    title: '样式定制', 
    description: '可视化样式编辑器，自定义点阵、眼睛、渐变、阴影等效果',
    icon: markRaw(Paintbrush),
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    gradient: 'from-rose-500 to-pink-600'
  },
  { 
    path: '/advanced', 
    title: '高级功能', 
    description: 'Logo 嵌入、3D 变换、滤镜效果、动画、批量生成等专业特性',
    icon: markRaw(Zap),
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    gradient: 'from-violet-500 to-purple-600'
  },
  { 
    path: '/', 
    title: '二维码扫描', 
    description: '内置扫描器，支持摄像头实时扫描和图片识别，可选 AI 增强',
    icon: markRaw(ScanLine),
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    gradient: 'from-cyan-500 to-blue-600'
  },
]

const installCode = `# 使用 pnpm
pnpm add @ldesign/qrcode-core

# Vue 组件
pnpm add @ldesign/qrcode-vue`

const jsCode = `import { createQRCode } from '@ldesign/qrcode-core'

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qrcode'),
  style: {
    size: 200,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#3b82f6', '#8b5cf6'],
      direction: 45
    }
  }
})`

const vueCode = `<template>
  <QRCode
    content="https://example.com"
    :size="200"
    dot-style="rounded"
    :gradient="{ type: 'linear', colors: ['#3b82f6', '#8b5cf6'] }"
  />
</template>

<script setup>
import { QRCode } from '@ldesign/qrcode-vue'
<\/script>`

onMounted(() => {
  if (demoContainer.value) {
    try {
      createQRCode({
        content: 'https://github.com/nicepkg/ldesign',
        container: demoContainer.value,
        style: {
          size: 200,
          dotStyle: 'rounded',
          gradient: {
            type: 'linear',
            colors: ['#3b82f6', '#8b5cf6'],
            direction: 45
          },
          shadow: {
            blur: 15,
            color: 'rgba(59, 130, 246, 0.3)',
            offsetY: 8
          }
        }
      })
      loading.value = false
    } catch (e) {
      console.error('QRCode creation error:', e)
      loading.value = false
    }
  }
})
</script>
