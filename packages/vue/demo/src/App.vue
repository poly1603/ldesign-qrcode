<template>
  <div class="app">
    <h1>🎨 QRCode Vue Demo</h1>

    <div class="controls">
      <h2>QR Code Generator</h2>
      <div class="form-group">
        <label>Content:</label>
        <input v-model="content" type="text" placeholder="Enter content for QR code" />
      </div>
      <div class="form-group">
        <label>Dot Style:</label>
        <select v-model="dotStyle">
          <option value="square">Square</option>
          <option value="rounded">Rounded</option>
          <option value="dots">Dots</option>
          <option value="diamond">Diamond</option>
          <option value="liquid">Liquid</option>
        </select>
      </div>
      <div class="form-group">
        <label>Size:</label>
        <input v-model.number="size" type="range" min="100" max="500" step="10" />
        <span>{{ size }}px</span>
      </div>
      <div class="form-group">
        <label>Foreground Color:</label>
        <input v-model="fgColor" type="color" />
      </div>
      <div class="form-group">
        <label>Background Color:</label>
        <input v-model="bgColor" type="color" />
      </div>
      <div class="form-group">
        <label>
          <input v-model="animated" type="checkbox" />
          Enable Animation
        </label>
      </div>
      <button @click="handleDownload">Download QR Code</button>
    </div>

    <div class="demo-grid">
      <!-- Component Demo -->
      <div class="demo-card">
        <h2>📦 Component Usage</h2>
        <p>Using the QRCode component with v-model</p>
        <QRCode
          ref="qrcodeRef"
          :content="content"
          :size="size"
          :fgColor="fgColor"
          :bgColor="bgColor"
          :dotStyle="dotStyle"
          :animated="animated"
          @ready="onReady"
        />
      </div>

      <!-- Composable Demo -->
      <div class="demo-card">
        <h2>🎯 Composable Usage</h2>
        <p>Using useQRCode composable</p>
        <div ref="composableContainer" class="qrcode-container"></div>
      </div>

      <!-- Directive Demo -->
      <div class="demo-card">
        <h2>✨ Directive Usage</h2>
        <p>Using v-qrcode directive</p>
        <div 
          v-qrcode="{ 
            content, 
            style: { 
              size: 250, 
              dotStyle: 'rounded',
              fgColor: '#2563eb',
              bgColor: '#ffffff'
            } 
          }"
          class="qrcode-container"
        ></div>
      </div>

      <!-- Gradient Demo -->
      <div class="demo-card">
        <h2>🌈 Gradient QR Code</h2>
        <p>QR code with gradient colors</p>
        <QRCode
          :content="content"
          :size="250"
          :gradient="{
            type: 'radial',
            colors: ['#667eea', '#764ba2']
          }"
          bgColor="#ffffff"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { QRCode, useQRCode, vQRCode } from '@ldesign/qrcode-vue';

// State
const content = ref('https://github.com/ldesign/qrcode');
const dotStyle = ref('square');
const size = ref(250);
const fgColor = ref('#000000');
const bgColor = ref('#ffffff');
const animated = ref(false);

// Component ref
const qrcodeRef = ref();
const composableContainer = ref<HTMLElement>();

// Composable
const {
  container,
  generate,
  isReady
} = useQRCode({
  content: content.value,
  style: {
    size: 250,
    dotStyle: 'dots',
    fgColor: '#059669',
    bgColor: '#ffffff'
  }
}, {
  immediate: false
});

// Watch content changes and regenerate
watch([content, dotStyle, size, fgColor, bgColor], () => {
  if (isReady.value) {
    generate({
      content: content.value,
      style: {
        size: 250,
        dotStyle: dotStyle.value as any,
        fgColor: '#059669',
        bgColor: '#ffffff'
      }
    });
  }
});

// Mount composable container
onMounted(() => {
  if (composableContainer.value) {
    container.value = composableContainer.value;
    generate({
      content: content.value,
      style: {
        size: 250,
        dotStyle: 'dots',
        fgColor: '#059669',
        bgColor: '#ffffff'
      }
    });
  }
});

// Event handlers
const onReady = (instance: any) => {
  console.log('QR code ready:', instance);
};

const handleDownload = () => {
  if (qrcodeRef.value) {
    qrcodeRef.value.download('qrcode', 'png');
  }
};
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
}

.controls {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.controls h2 {
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  color: #555;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input[type="range"] {
  width: calc(100% - 60px);
  margin-right: 10px;
}

.form-group input[type="color"] {
  width: 100%;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 10px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.demo-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.demo-card h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.demo-card p {
  color: #666;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}
</style>

