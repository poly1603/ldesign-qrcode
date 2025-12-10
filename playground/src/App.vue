<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <QrCode class="w-5 h-5 text-white" />
            </div>
            <div>
              <span class="text-lg font-bold text-slate-900 dark:text-white">QRCode</span>
              <span class="text-xs text-slate-500 dark:text-slate-400 block -mt-1">演示中心</span>
            </div>
          </router-link>

          <!-- 导航链接 -->
          <nav class="hidden md:flex items-center gap-1">
            <router-link 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.path === item.path }"
            >
              <component :is="item.icon" class="w-4 h-4" />
              {{ item.name }}
            </router-link>
          </nav>

          <!-- 右侧操作 -->
          <div class="flex items-center gap-2">
            <a 
              href="https://github.com/nicepkg/ldesign" 
              target="_blank" 
              class="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Github class="w-5 h-5" />
            </a>
            <button 
              @click="toggleDarkMode" 
              class="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Sun v-if="isDark" class="w-5 h-5" />
              <Moon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-slate-500 dark:text-slate-400 text-sm">
            © 2024 @ldesign/qrcode · 高性能二维码生成库
          </p>
          <div class="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" class="hover:text-blue-500 transition-colors">文档</a>
            <a href="#" class="hover:text-blue-500 transition-colors">API</a>
            <a href="https://github.com/nicepkg/ldesign" target="_blank" class="hover:text-blue-500 transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw } from 'vue'
import { 
  QrCode, Sun, Moon, Github, Home, Palette, Code2, Component, Paintbrush, Zap 
} from 'lucide-vue-next'

const isDark = ref(false)

const navItems = [
  { path: '/', name: '首页', icon: markRaw(Home) },
  { path: '/presets', name: '预设样式', icon: markRaw(Palette) },
  { path: '/native', name: '原生JS', icon: markRaw(Code2) },
  { path: '/vue', name: 'Vue组件', icon: markRaw(Component) },
  { path: '/styles', name: '样式定制', icon: markRaw(Paintbrush) },
  { path: '/advanced', name: '高级功能', icon: markRaw(Zap) },
]

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all;
}

.nav-link-active {
  @apply bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
