<template>
  <div class="grid grid-cols-12 gap-6">
    <!-- 左侧控制面板 -->
    <div class="col-span-12 lg:col-span-4 space-y-4">
      <!-- 内容 -->
      <ConfigCard title="编码内容" :icon="Type">
        <textarea
          v-model="config.content"
          rows="2"
          class="input-base font-mono text-sm resize-none"
          placeholder="输入要编码的内容..."
        />
      </ConfigCard>

      <!-- 基础设置 -->
      <ConfigCard title="基础设置" :icon="Settings">
        <div class="space-y-4">
          <!-- 容错级别 -->
          <ConfigRow label="容错级别">
            <SegmentedControl v-model="config.errorLevel" :options="errorLevels" />
          </ConfigRow>
          
          <!-- 尺寸 -->
          <ConfigRow label="尺寸" :value="`${config.size}px`">
            <input v-model.number="config.size" type="range" min="150" max="500" step="10" class="slider" />
          </ConfigRow>
          
          <!-- 边距 -->
          <ConfigRow label="边距" :value="config.margin">
            <input v-model.number="config.margin" type="range" min="0" max="8" class="slider" />
          </ConfigRow>
        </div>
      </ConfigCard>

      <!-- 像素样式 -->
      <ConfigCard title="像素样式" :icon="Grid3x3">
        <div class="grid grid-cols-4 gap-2">
          <StyleButton
            v-for="style in pixelStyles"
            :key="style.value"
            :active="config.dotStyle === style.value"
            :label="style.label"
            @click="config.dotStyle = style.value"
          />
        </div>
      </ConfigCard>

      <!-- 定位图案 -->
      <ConfigCard title="定位图案" :icon="ScanLine">
        <div class="space-y-3">
          <ConfigRow label="外框">
            <SegmentedControl v-model="config.markerShape" :options="markerShapes" size="sm" />
          </ConfigRow>
          <ConfigRow label="内部">
            <SegmentedControl v-model="config.markerInner" :options="markerInners" size="sm" />
          </ConfigRow>
        </div>
      </ConfigCard>

      <!-- 颜色 -->
      <ConfigCard title="颜色设置" :icon="Palette">
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <ColorPicker v-model="config.fgColor" label="前景色" />
            <ColorPicker v-model="config.bgColor" label="背景色" />
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input v-model="config.invertColors" type="checkbox" class="checkbox" />
            反转颜色
          </label>
        </div>
      </ConfigCard>

      <!-- 渐变 -->
      <ConfigCard title="渐变效果" :icon="Blend" :toggle="config.useGradient" @toggle="config.useGradient = $event">
        <template v-if="config.useGradient">
          <div class="space-y-3">
            <SegmentedControl v-model="config.gradientType" :options="gradientTypes" />
            <div class="grid grid-cols-2 gap-3">
              <ColorPicker v-model="config.gradientColor1" label="颜色 1" />
              <ColorPicker v-model="config.gradientColor2" label="颜色 2" />
            </div>
            <ConfigRow v-if="config.gradientType === 'linear'" label="方向" :value="`${config.gradientDirection}°`">
              <input v-model.number="config.gradientDirection" type="range" min="0" max="360" class="slider" />
            </ConfigRow>
          </div>
        </template>
      </ConfigCard>

      <!-- Logo -->
      <ConfigCard title="Logo" :icon="Image" :toggle="config.useLogo" @toggle="config.useLogo = $event">
        <template v-if="config.useLogo">
          <div class="space-y-3">
            <input v-model="config.logoUrl" type="text" class="input-base text-sm" placeholder="Logo 图片 URL" />
            <SegmentedControl v-model="config.logoShape" :options="logoShapes" />
            <ConfigRow label="大小" :value="`${config.logoSize}%`">
              <input v-model.number="config.logoSize" type="range" min="10" max="30" class="slider" />
            </ConfigRow>
          </div>
        </template>
      </ConfigCard>

      <!-- 渲染模式 -->
      <ConfigCard title="渲染模式" :icon="Layers">
        <SegmentedControl v-model="config.renderType" :options="renderTypes" />
      </ConfigCard>
    </div>

    <!-- 右侧预览 -->
    <div class="col-span-12 lg:col-span-8">
      <div class="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- 预览头部 -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Eye class="w-5 h-5 text-blue-500" />
            <span class="font-semibold text-slate-900 dark:text-white">实时预览</span>
          </div>
          <span class="text-sm text-slate-500">{{ config.size }} × {{ config.size }}</span>
        </div>

        <!-- 预览区域 -->
        <div class="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-[400px] flex items-center justify-center">
          <div class="relative">
            <!-- 棋盘格背景 -->
            <div class="absolute inset-0 rounded-lg opacity-50" style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22><rect width=%228%22 height=%228%22 fill=%22%23e2e8f0%22/><rect x=%228%22 y=%228%22 width=%228%22 height=%228%22 fill=%22%23e2e8f0%22/></svg>');"></div>
            <div ref="previewContainer" class="relative"></div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button @click="downloadQRCode('png')" class="btn-primary flex-1">
            <Download class="w-4 h-4" />
            下载 PNG
          </button>
          <button @click="downloadQRCode('svg')" class="btn-secondary flex-1">
            <Download class="w-4 h-4" />
            下载 SVG
          </button>
          <button @click="showCode = true" class="btn-ghost">
            <Code2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- 代码弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCode" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showCode = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl">
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span class="font-semibold text-slate-900 dark:text-white">生成代码</span>
              <button @click="showCode = false" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X class="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div class="p-4 max-h-[60vh] overflow-auto">
              <CodeBlock :code="generatedCode" language="javascript" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick, defineComponent, h } from 'vue'
import { Eye, Download, Code2, X, Type, Settings, Grid3x3, ScanLine, Palette, Blend, Image, Layers } from 'lucide-vue-next'
import { createQRCode, type QRCodeInstance } from '@ldesign/qrcode-core'
import CodeBlock from '@/components/CodeBlock.vue'

// 子组件
const ConfigCard = defineComponent({
  props: ['title', 'icon', 'toggle'],
  emits: ['toggle'],
  setup(props, { slots, emit }) {
    return () => h('div', { class: 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4' }, [
      h('div', { class: 'flex items-center justify-between mb-3' }, [
        h('div', { class: 'flex items-center gap-2' }, [
          props.icon && h(props.icon, { class: 'w-4 h-4 text-blue-500' }),
          h('span', { class: 'text-sm font-semibold text-slate-700 dark:text-slate-300' }, props.title)
        ]),
        props.toggle !== undefined && h('input', {
          type: 'checkbox',
          checked: props.toggle,
          class: 'checkbox',
          onChange: (e: Event) => emit('toggle', (e.target as HTMLInputElement).checked)
        })
      ]),
      slots.default?.()
    ])
  }
})

const ConfigRow = defineComponent({
  props: ['label', 'value'],
  setup(props, { slots }) {
    return () => h('div', { class: 'space-y-1.5' }, [
      h('div', { class: 'flex justify-between text-xs' }, [
        h('span', { class: 'text-slate-500' }, props.label),
        props.value && h('span', { class: 'text-slate-600 dark:text-slate-400 font-medium' }, props.value)
      ]),
      slots.default?.()
    ])
  }
})

const SegmentedControl = defineComponent({
  props: ['modelValue', 'options', 'size'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', { class: 'flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg' },
      props.options.map((opt: any) => h('button', {
        class: [
          'flex-1 px-3 rounded-md text-xs font-medium transition-all',
          props.size === 'sm' ? 'py-1.5' : 'py-2',
          props.modelValue === opt.value 
            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ],
        onClick: () => emit('update:modelValue', opt.value)
      }, opt.label))
    )
  }
})

const StyleButton = defineComponent({
  props: ['active', 'label'],
  emits: ['click'],
  setup(props, { emit }) {
    return () => h('button', {
      class: [
        'px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all',
        props.active 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-300'
      ],
      onClick: () => emit('click')
    }, props.label)
  }
})

const ColorPicker = defineComponent({
  props: ['modelValue', 'label'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', { class: 'space-y-1' }, [
      h('span', { class: 'text-xs text-slate-500' }, props.label),
      h('div', { class: 'flex gap-2' }, [
        h('input', {
          type: 'color',
          value: props.modelValue,
          class: 'w-10 h-9 rounded cursor-pointer border-0',
          onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
        }),
        h('input', {
          type: 'text',
          value: props.modelValue,
          class: 'input-base text-xs flex-1 font-mono',
          onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
        })
      ])
    ])
  }
})

const previewContainer = ref<HTMLElement>()
let qrInstance: QRCodeInstance | null = null
const showCode = ref(false)

const config = reactive({
  content: 'https://github.com/nicepkg/ldesign',
  errorLevel: 'M',
  dotStyle: 'rounded',
  markerShape: 'square',
  markerInner: 'square',
  size: 280,
  margin: 2,
  fgColor: '#000000',
  bgColor: '#ffffff',
  invertColors: false,
  useGradient: false,
  gradientType: 'linear',
  gradientColor1: '#6366f1',
  gradientColor2: '#8b5cf6',
  gradientDirection: 135,
  useLogo: false,
  logoUrl: 'https://vuejs.org/images/logo.png',
  logoShape: 'circle',
  logoSize: 20,
  renderType: 'canvas'
})

const errorLevels = [
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H' },
]

const pixelStyles = [
  { value: 'square', label: '方形' },
  { value: 'rounded', label: '圆角' },
  { value: 'dots', label: '圆点' },
  { value: 'diamond', label: '菱形' },
  { value: 'star', label: '星形' },
  { value: 'classy', label: '优雅' },
  { value: 'hexagon', label: '六边形' },
  { value: 'liquid', label: '液态' },
]

const markerShapes = [
  { value: 'square', label: '方形' },
  { value: 'circle', label: '圆形' },
  { value: 'rounded-square', label: '圆角' },
]

const markerInners = [
  { value: 'square', label: '方形' },
  { value: 'circle', label: '圆形' },
  { value: 'diamond', label: '菱形' },
]

const gradientTypes = [
  { value: 'linear', label: '线性渐变' },
  { value: 'radial', label: '径向渐变' },
]

const logoShapes = [
  { value: 'square', label: '方形' },
  { value: 'circle', label: '圆形' },
  { value: 'rounded', label: '圆角' },
]

const renderTypes = [
  { value: 'canvas', label: 'Canvas' },
  { value: 'svg', label: 'SVG' },
]

const generatedCode = computed(() => {
  let code = `import { createQRCode } from '@ldesign/qrcode-core'

createQRCode({
  content: '${config.content}',
  container: document.getElementById('qrcode'),
  errorCorrectionLevel: '${config.errorLevel}',
  renderType: '${config.renderType}',
  style: {
    size: ${config.size},
    margin: ${config.margin},
    dotStyle: '${config.dotStyle}',
    fgColor: '${config.invertColors ? config.bgColor : config.fgColor}',
    bgColor: '${config.invertColors ? config.fgColor : config.bgColor}'`

  if (config.markerShape !== 'square' || config.markerInner !== 'square') {
    code += `,
    eyeStyle: {
      markerShape: '${config.markerShape}',
      markerInner: '${config.markerInner}'
    }`
  }

  if (config.useGradient) {
    code += `,
    gradient: {
      type: '${config.gradientType}',
      colors: ['${config.gradientColor1}', '${config.gradientColor2}']${config.gradientType === 'linear' ? `,
      direction: ${config.gradientDirection}` : ''}
    }`
  }

  code += '\n  }'

  if (config.useLogo) {
    code += `,
  logo: {
    src: '${config.logoUrl}',
    width: '${config.logoSize}%',
    height: '${config.logoSize}%',
    logoShape: '${config.logoShape}',
    logoBackground: true
  }`
  }

  code += '\n})'
  return code
})

const renderPreview = () => {
  if (!previewContainer.value) return
  previewContainer.value.innerHTML = ''
  
  const style: any = {
    size: config.size,
    margin: config.margin,
    dotStyle: config.dotStyle,
    fgColor: config.invertColors ? config.bgColor : config.fgColor,
    bgColor: config.invertColors ? config.fgColor : config.bgColor,
  }

  if (config.markerShape !== 'square' || config.markerInner !== 'square') {
    style.eyeStyle = { markerShape: config.markerShape, markerInner: config.markerInner }
  }

  if (config.useGradient) {
    style.gradient = {
      type: config.gradientType,
      colors: [config.gradientColor1, config.gradientColor2],
      direction: config.gradientDirection,
    }
  }

  const qrConfig: any = {
    content: config.content,
    container: previewContainer.value,
    errorCorrectionLevel: config.errorLevel,
    renderType: config.renderType,
    style,
  }

  if (config.useLogo) {
    qrConfig.logo = {
      src: config.logoUrl,
      width: `${config.logoSize}%`,
      height: `${config.logoSize}%`,
      logoShape: config.logoShape,
      logoBackground: true,
    }
    qrConfig.errorCorrectionLevel = 'H'
  }

  try {
    qrInstance = createQRCode(qrConfig)
  } catch (e) {
    console.error('QRCode error:', e)
  }
}

const downloadQRCode = (format: 'png' | 'svg') => {
  qrInstance?.download({ fileName: 'qrcode', format })
}

watch(config, renderPreview, { deep: true })
onMounted(() => nextTick(renderPreview))
</script>

<style scoped>
.input-base {
  @apply w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all;
}

.slider {
  @apply w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-blue-500;
}

.checkbox {
  @apply w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer;
}

.btn-primary {
  @apply flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors;
}

.btn-secondary {
  @apply flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors;
}

.btn-ghost {
  @apply flex items-center justify-center gap-2 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-colors;
}

.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
