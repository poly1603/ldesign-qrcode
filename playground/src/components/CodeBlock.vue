<template>
  <div class="relative group rounded-xl overflow-hidden bg-slate-900">
    <div class="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        @click="copyCode"
        class="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
      >
        <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-400" />
        <Copy v-else class="w-3.5 h-3.5" />
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre class="!m-0 !bg-transparent p-4 overflow-x-auto"><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Check } from 'lucide-vue-next'
import Prism from 'prismjs'

const props = defineProps<{
  code: string
  language?: string
}>()

const copied = ref(false)

const highlightedCode = computed(() => {
  const lang = props.language || 'javascript'
  const grammar = Prism.languages[lang] || Prism.languages.javascript
  return Prism.highlight(props.code, grammar, lang)
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style>
/* Prism 主题覆盖 */
code[class*="language-"],
pre[class*="language-"] {
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #64748b;
}

.token.punctuation {
  color: #94a3b8;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol {
  color: #f472b6;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin {
  color: #a5f3fc;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string {
  color: #fcd34d;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #c4b5fd;
}

.token.function {
  color: #7dd3fc;
}

.token.regex,
.token.important,
.token.variable {
  color: #fca5a5;
}
</style>
