<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <header class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
        <Paintbrush class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">样式定制</h1>
        <p class="text-slate-600 dark:text-slate-400">可视化编辑器，自定义二维码样式</p>
      </div>
    </header>

    <!-- 交互式编辑器 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- 控制面板 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 基础设置 -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Settings class="w-4 h-4" />
              基础设置
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-500 mb-2">内容</label>
                <input v-model="config.content" type="text" class="input-field" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-2">尺寸: {{ config.size }}px</label>
                <input v-model.number="config.size" type="range" min="100" max="400" class="w-full accent-blue-500" />
              </div>
            </div>
          </div>

          <!-- 点阵样式 -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Grid3X3 class="w-4 h-4" />
              点阵样式
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="style in dotStyles"
                :key="style.value"
                @click="config.dotStyle = style.value"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                :class="config.dotStyle === style.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              >
                {{ style.label }}
              </button>
            </div>
          </div>

          <!-- 颜色设置 -->
          <div>
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Palette class="w-4 h-4" />
              颜色设置
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-500 mb-2">前景色</label>
                <div class="flex gap-2">
                  <input v-model="config.fgColor" type="color" class="w-12 h-10 rounded-lg cursor-pointer border-0" />
                  <input v-model="config.fgColor" type="text" class="input-field flex-1" />
                </div>
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-2">背景色</label>
                <div class="flex gap-2">
                  <input v-model="config.bgColor" type="color" class="w-12 h-10 rounded-lg cursor-pointer border-0" />
                  <input v-model="config.bgColor" type="text" class="input-field flex-1" />
                </div>
              </div>
            </div>
          </div>

          <!-- 渐变设置 -->
          <div>
            <label class="flex items-center gap-3 cursor-pointer mb-4">
              <input v-model="useGradient" type="checkbox" class="w-5 h-5 rounded accent-blue-500" />
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers class="w-4 h-4" />
                启用渐变
              </span>
            </label>
            <div v-if="useGradient" class="grid md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <label class="block text-xs text-slate-500 mb-2">类型</label>
                <select v-model="gradient.type" class="input-field">
                  <option value="linear">线性</option>
                  <option value="radial">径向</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-2">颜色 1</label>
                <input v-model="gradient.colors[0]" type="color" class="w-full h-10 rounded-lg cursor-pointer" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-2">颜色 2</label>
                <input v-model="gradient.colors[1]" type="color" class="w-full h-10 rounded-lg cursor-pointer" />
              </div>
              <div v-if="gradient.type === 'linear'">
                <label class="block text-xs text-slate-500 mb-2">方向: {{ gradient.direction }}°</label>
                <input v-model.number="gradient.direction" type="range" min="0" max="360" class="w-full accent-blue-500" />
              </div>
            </div>
          </div>

          <!-- 阴影设置 -->
          <div>
            <label class="flex items-center gap-3 cursor-pointer mb-4">
              <input v-model="useShadow" type="checkbox" class="w-5 h-5 rounded accent-blue-500" />
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Moon class="w-4 h-4" />
                添加阴影
              </span>
            </label>
            <div v-if="useShadow" class="grid md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <label class="block text-xs text-slate-500 mb-2">模糊: {{ shadow.blur }}px</label>
                <input v-model.number="shadow.blur" type="range" min="0" max="50" class="w-full accent-blue-500" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-2">颜色</label>
                <input v-model="shadow.color" type="color" class="w-full h-10 rounded-lg cursor-pointer" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-2">偏移Y: {{ shadow.offsetY }}px</label>
                <input v-model.number="shadow.offsetY" type="range" min="0" max="20" class="w-full accent-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-4">
            <div class="bg-slate-100 dark:bg-slate-700 rounded-2xl p-8 flex justify-center items-center min-h-[300px]">
              <div ref="previewContainer"></div>
            </div>
            <div class="flex gap-3">
              <button @click="downloadPreview" class="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Download class="w-4 h-4" />
                下载
              </button>
              <button @click="showCodeModal = true" class="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Code2 class="w-4 h-4" />
                代码
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 点阵样式展示 -->
    <section class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Grid3X3 class="w-5 h-5 text-blue-500" />
        点阵样式一览
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div v-for="style in dotStyles" :key="style.value" class="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center">
          <div :ref="el => setDotStyleRef(el, style.value)" class="flex justify-center mb-3"></div>
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ style.label }}</p>
        </div>
      </div>
    </section>

    <!-- 代码弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCodeModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showCodeModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">生成代码</h3>
              <button @click="showCodeModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                <X class="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <CodeBlock :code="generatedCode" language="javascript" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { Paintbrush, Settings, Grid3X3, Palette, Layers, Moon, Download, Code2, X } from 'lucide-vue-next'
import { createQRCode, type QRCodeInstance } from '@ldesign/qrcode-core'
import CodeBlock from '@/components/CodeBlock.vue'

const previewContainer = ref<HTMLElement>()
const dotStyleRefs = ref<Record<string, HTMLElement>>({})
let previewInstance: QRCodeInstance | null = null
const showCodeModal = ref(false)

const config = reactive({
  content: 'https://example.com',
  size: 200,
  dotStyle: 'rounded',
  fgColor: '#000000',
  bgColor: '#ffffff',
})

const useGradient = ref(false)
const gradient = reactive({ type: 'linear' as 'linear' | 'radial', colors: ['#3b82f6', '#8b5cf6'], direction: 45 })

const useShadow = ref(false)
const shadow = reactive({ blur: 10, color: '#000000', offsetY: 4 })

const dotStyles = [
  { label: '方形', value: 'square' },
  { label: '圆角', value: 'rounded' },
  { label: '圆点', value: 'dots' },
  { label: '菱形', value: 'diamond' },
  { label: '星形', value: 'star' },
  { label: '六边形', value: 'hexagon' },
]

const setDotStyleRef = (el: any, style: string) => { if (el) dotStyleRefs.value[style] = el }

const generatedCode = computed(() => {
  let code = `import { createQRCode } from '@ldesign/qrcode-core'

createQRCode({
  content: '${config.content}',
  container: document.getElementById('qrcode'),
  style: {
    size: ${config.size},
    dotStyle: '${config.dotStyle}',
    fgColor: '${config.fgColor}',
    bgColor: '${config.bgColor}'`
    
  if (useGradient.value) {
    code += `,
    gradient: {
      type: '${gradient.type}',
      colors: ['${gradient.colors[0]}', '${gradient.colors[1]}']${gradient.type === 'linear' ? `,
      direction: ${gradient.direction}` : ''}
    }`
  }
  
  if (useShadow.value) {
    code += `,
    shadow: {
      blur: ${shadow.blur},
      color: '${shadow.color}',
      offsetY: ${shadow.offsetY}
    }`
  }
  
  code += `
  }
})`
  return code
})

const renderPreview = () => {
  if (!previewContainer.value) return
  previewContainer.value.innerHTML = ''
  
  const style: any = {
    size: config.size,
    dotStyle: config.dotStyle,
    fgColor: config.fgColor,
    bgColor: config.bgColor,
  }
  
  if (useGradient.value) {
    style.gradient = { type: gradient.type, colors: [...gradient.colors], direction: gradient.direction }
  }
  if (useShadow.value) {
    style.shadow = { blur: shadow.blur, color: shadow.color, offsetY: shadow.offsetY }
  }
  
  previewInstance = createQRCode({ content: config.content, container: previewContainer.value, style })
}

const downloadPreview = () => previewInstance?.download({ fileName: 'qrcode-custom', format: 'png' })

const renderDotStyleGallery = () => {
  dotStyles.forEach(style => {
    const container = dotStyleRefs.value[style.value]
    if (container) {
      container.innerHTML = ''
      createQRCode({
        content: 'https://example.com',
        container,
        style: { size: 80, dotStyle: style.value as any, fgColor: '#334155' }
      })
    }
  })
}

watch([config, useGradient, gradient, useShadow, shadow], renderPreview, { deep: true })

onMounted(() => {
  nextTick(() => {
    renderPreview()
    renderDotStyleGallery()
  })
})
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all;
}

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
