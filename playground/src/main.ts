import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import Prism.js for code highlighting
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-markup'

// Routes
const routes = [
  { path: '/', name: 'home', component: () => import('./views/Home.vue') },
  { path: '/presets', name: 'presets', component: () => import('./views/Presets.vue') },
  { path: '/native', name: 'native', component: () => import('./views/NativeJS.vue') },
  { path: '/vue', name: 'vue', component: () => import('./views/VueComponent.vue') },
  { path: '/styles', name: 'styles', component: () => import('./views/Styles.vue') },
  { path: '/advanced', name: 'advanced', component: () => import('./views/Advanced.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')

  // Make Prism available globally
  ; (window as any).Prism = Prism
