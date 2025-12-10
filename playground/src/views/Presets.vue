<template>
  <div class="space-y-8">
    <!-- 页面标题 -->
    <header class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
        <Palette class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">预设样式库</h1>
        <p class="text-slate-600 dark:text-slate-400">38+ 精心设计的预设样式，一键应用</p>
      </div>
    </header>

    <!-- 筛选标签 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tag in allTags"
        :key="tag"
        @click="toggleTag(tag)"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="selectedTags.includes(tag)
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
      >
        {{ tag }}
      </button>
    </div>

    <!-- 预设网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="(preset, name) in filteredPresets"
        :key="name"
        @click="showPresetDetail(name as string, preset)"
        class="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all cursor-pointer"
      >
        <div class="flex justify-center mb-4">
          <div :ref="el => setRef(el, name as string)" class="rounded-xl overflow-hidden"></div>
        </div>
        <h3 class="font-semibold text-slate-900 dark:text-white text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ preset.name }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 line-clamp-2">
          {{ preset.description }}
        </p>
        <div class="flex flex-wrap gap-1 justify-center mt-3">
          <span
            v-for="tag in preset.tags?.slice(0, 3)"
            :key="tag"
            class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-md"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedPreset"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="selectedPreset = null"
        >
          <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div class="p-6">
              <!-- 弹窗头部 -->
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ selectedPreset.preset.name }}</h2>
                  <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">{{ selectedPreset.preset.description }}</p>
                </div>
                <button
                  @click="selectedPreset = null"
                  class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X class="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <!-- 二维码预览 -->
              <div class="flex justify-center mb-6">
                <div ref="detailContainer" class="rounded-xl overflow-hidden shadow-lg"></div>
              </div>

              <!-- 标签 -->
              <div class="flex flex-wrap gap-2 mb-6">
                <span
                  v-for="tag in selectedPreset.preset.tags"
                  :key="tag"
                  class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- 代码展示 -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Code2 class="w-4 h-4" />
                    使用代码
                  </h3>
                  <button
                    @click="showCode = !showCode"
                    class="text-sm text-blue-500 hover:text-blue-600"
                  >
                    {{ showCode ? '隐藏' : '显示' }}
                  </button>
                </div>
                
                <CodeBlock v-if="showCode" :code="getPresetCode(selectedPreset.name)" language="javascript" />

                <!-- 操作按钮 -->
                <div class="flex gap-3 pt-2">
                  <button
                    @click="downloadPreset"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <Download class="w-4 h-4" />
                    下载二维码
                  </button>
                  <button
                    @click="copyPresetCode"
                    class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    <Copy class="w-4 h-4" />
                    复制代码
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Palette, X, Code2, Download, Copy } from 'lucide-vue-next'
import { createQRCode, QRCodePresets, getAllTags, type QRCodePreset } from '@ldesign/qrcode-core'
import CodeBlock from '@/components/CodeBlock.vue'

const content = 'https://github.com/nicepkg/ldesign'
const allTags = ref<string[]>([])
const selectedTags = ref<string[]>([])
const containerRefs = ref<Record<string, HTMLElement>>({})
const selectedPreset = ref<{ name: string; preset: QRCodePreset } | null>(null)
const detailContainer = ref<HTMLElement>()
const showCode = ref(true)
let detailInstance: any = null

const setRef = (el: any, name: string) => {
  if (el) containerRefs.value[name] = el
}

const filteredPresets = computed(() => {
  if (selectedTags.value.length === 0) return QRCodePresets
  return Object.fromEntries(
    Object.entries(QRCodePresets).filter(([_, preset]) => 
      selectedTags.value.some(tag => preset.tags?.includes(tag))
    )
  )
})

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const showPresetDetail = async (name: string, preset: QRCodePreset) => {
  selectedPreset.value = { name, preset }
  await nextTick()
  
  if (detailContainer.value) {
    detailContainer.value.innerHTML = ''
    detailInstance = createQRCode({
      content,
      container: detailContainer.value,
      style: { ...preset.style, size: 280 }
    })
  }
}

const getPresetCode = (presetName: string) => {
  return `import { createQRCode, QRCodePresets } from '@ldesign/qrcode-core'

// 使用 ${presetName} 预设
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qrcode'),
  style: QRCodePresets.${presetName}.style
})`
}

const downloadPreset = () => {
  detailInstance?.download({ fileName: `qrcode-${selectedPreset.value?.name || 'preset'}`, format: 'png' })
}

const copyPresetCode = async () => {
  if (selectedPreset.value) {
    await navigator.clipboard.writeText(getPresetCode(selectedPreset.value.name))
  }
}

const renderPresets = () => {
  Object.entries(filteredPresets.value).forEach(([name, preset]) => {
    const container = containerRefs.value[name]
    if (container) {
      container.innerHTML = ''
      createQRCode({
        content,
        container,
        style: { ...preset.style, size: 140 }
      })
    }
  })
}

onMounted(() => {
  allTags.value = getAllTags()
  nextTick(renderPresets)
})

watch(filteredPresets, () => nextTick(renderPresets))
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
