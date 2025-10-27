import '@ldesign/qrcode-lit';

// Get elements
const contentInput = document.getElementById('content') as HTMLInputElement;
const dotStyleSelect = document.getElementById('dotStyle') as HTMLSelectElement;
const sizeInput = document.getElementById('size') as HTMLInputElement;
const sizeValue = document.getElementById('sizeValue') as HTMLSpanElement;
const fgColorInput = document.getElementById('fgColor') as HTMLInputElement;
const bgColorInput = document.getElementById('bgColor') as HTMLInputElement;
const updateBtn = document.getElementById('updateBtn') as HTMLButtonElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;

const customQR = document.getElementById('customQR') as any;
const gradientQR = document.getElementById('gradientQR') as any;

// Set gradient for gradient QR code
if (gradientQR) {
  gradientQR.gradient = {
    type: 'radial',
    colors: ['#667eea', '#764ba2']
  };
}

// Update size value display
sizeInput.addEventListener('input', () => {
  sizeValue.textContent = `${sizeInput.value}px`;
});

// Update custom QR code
updateBtn.addEventListener('click', () => {
  if (customQR) {
    customQR.content = contentInput.value;
    customQR.dotStyle = dotStyleSelect.value;
    customQR.size = Number(sizeInput.value);
    customQR.fgColor = fgColorInput.value;
    customQR.bgColor = bgColorInput.value;
  }
});

// Download QR code
downloadBtn.addEventListener('click', () => {
  if (customQR && customQR.download) {
    customQR.download('qrcode', 'png');
  }
});

// Listen to QR code events
customQR?.addEventListener('qr-ready', (e: any) => {
  console.log('QR code ready:', e.detail.instance);
});

customQR?.addEventListener('qr-error', (e: any) => {
  console.error('QR code error:', e.detail.error);
});

customQR?.addEventListener('qr-download', (e: any) => {
  console.log('QR code downloaded:', e.detail);
});

// Log when all QR codes are ready
document.querySelectorAll('qr-code').forEach((qr) => {
  qr.addEventListener('qr-ready', (e: any) => {
    console.log('QR code ready:', qr.id || 'unknown', e.detail);
  });
});

