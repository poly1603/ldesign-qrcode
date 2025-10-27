// Main component export
export { QRCodeElement } from './qrcode-element';

// Re-export types from core
export type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
  LogoConfig,
  QRCodeStyle,
  DotStyle,
} from '@ldesign/qrcode-core';

// Export createQRCode for advanced usage
export { createQRCode } from '@ldesign/qrcode-core';

