import { createQRCode } from '@ldesign/qrcode-core';

// Basic QR Code
const basicQR = createQRCode({
  content: 'https://github.com/ldesign/qrcode',
  renderType: 'canvas',
  style: {
    size: 250,
    fgColor: '#000000',
    bgColor: '#ffffff',
    margin: 2
  }
});

const basicContainer = document.getElementById('basic-qrcode');
if (basicContainer) {
  basicContainer.appendChild(basicQR.getElement()!);
}

// Gradient QR Code
const gradientQR = createQRCode({
  content: 'https://github.com/ldesign/qrcode',
  renderType: 'canvas',
  style: {
    size: 250,
    gradient: {
      type: 'radial',
      colors: ['#667eea', '#764ba2']
    },
    bgColor: '#ffffff',
    margin: 2
  }
});

const gradientContainer = document.getElementById('gradient-qrcode');
if (gradientContainer) {
  gradientContainer.appendChild(gradientQR.getElement()!);
}

// Rounded Style QR Code
const roundedQR = createQRCode({
  content: 'https://github.com/ldesign/qrcode',
  renderType: 'canvas',
  style: {
    size: 250,
    dotStyle: 'rounded',
    fgColor: '#2563eb',
    bgColor: '#ffffff',
    cornerRadius: 0.5,
    margin: 2
  }
});

const roundedContainer = document.getElementById('rounded-qrcode');
if (roundedContainer) {
  roundedContainer.appendChild(roundedQR.getElement()!);
}

// Custom QR Code Generator
let customQR: any = null;

const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const customContainer = document.getElementById('custom-qrcode');

if (generateBtn) {
  generateBtn.addEventListener('click', () => {
    const content = (document.getElementById('content') as HTMLInputElement).value;
    const renderType = (document.getElementById('renderType') as HTMLSelectElement).value as 'canvas' | 'svg' | 'webgl';
    const dotStyle = (document.getElementById('dotStyle') as HTMLSelectElement).value;
    const fgColor = (document.getElementById('fgColor') as HTMLInputElement).value;
    const bgColor = (document.getElementById('bgColor') as HTMLInputElement).value;

    // Clean up previous QR code
    if (customQR) {
      customQR.destroy();
    }
    if (customContainer) {
      customContainer.innerHTML = '';
    }

    // Create new QR code
    customQR = createQRCode({
      content,
      renderType,
      style: {
        size: 250,
        dotStyle: dotStyle as any,
        fgColor,
        bgColor,
        margin: 2
      }
    });

    if (customContainer) {
      customContainer.appendChild(customQR.getElement()!);
    }
  });
}

if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    if (customQR) {
      customQR.download({ fileName: 'qrcode', format: 'png' });
    } else {
      alert('Please generate a QR code first!');
    }
  });
}

// Generate initial custom QR code
if (generateBtn) {
  (generateBtn as HTMLButtonElement).click();
}

