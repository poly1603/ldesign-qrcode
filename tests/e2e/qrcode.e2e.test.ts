/**
 * End-to-End Tests for QRCode Library
 * Tests real-world usage scenarios
 */

import { test, expect } from '@playwright/test';

test.describe('QRCode Generation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test page
    await page.goto('http://localhost:3333/test.html');
  });

  test('should generate basic QR code', async ({ page }) => {
    await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      createQRCode({
        content: 'https://example.com',
        container,
        style: { size: 200 },
      });
    });

    // Check if canvas or SVG was created
    const element = await page.locator('#qr-container canvas, #qr-container svg').first();
    await expect(element).toBeVisible();
  });

  test('should render with gradient', async ({ page }) => {
    await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      createQRCode({
        content: 'https://example.com',
        container,
        style: {
          size: 300,
          gradient: {
            type: 'linear',
            colors: ['#667eea', '#764ba2'],
            direction: 45,
          },
        },
      });
    });

    const canvas = await page.locator('#qr-container canvas').first();
    await expect(canvas).toBeVisible();

    // Take screenshot for visual verification
    await expect(page).toHaveScreenshot('gradient-qr.png');
  });

  test('should render with WebGL if supported', async ({ page }) => {
    const webglSupported = await page.evaluate(() => {
      const { isWebGLSupported } = window as any;
      return isWebGLSupported();
    });

    if (!webglSupported) {
      test.skip();
      return;
    }

    await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      createQRCode({
        content: 'https://example.com',
        container,
        renderType: 'webgl',
        style: { size: 300 },
      });
    });

    const canvas = await page.locator('#qr-container canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should apply filters', async ({ page }) => {
    await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      createQRCode({
        content: 'https://example.com',
        container,
        style: {
          size: 300,
          filter: { type: 'vintage', intensity: 0.8 },
        },
      });
    });

    await expect(page.locator('#qr-container canvas')).toBeVisible();
    await expect(page).toHaveScreenshot('vintage-filter-qr.png');
  });

  test('should download QR code', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      const qr = createQRCode({
        content: 'https://example.com',
        container,
        style: { size: 200 },
      });

      qr.download({ fileName: 'test-qr', format: 'png' });
    });

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test-qr.png');
  });

  test('should update QR code content', async ({ page }) => {
    await page.evaluate(async () => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      const qr = createQRCode({
        content: 'initial',
        container,
        style: { size: 200 },
      });

      await qr.update({ content: 'updated' });
    });

    // QR code should still be visible after update
    await expect(page.locator('#qr-container canvas')).toBeVisible();
  });
});

test.describe('QRCode Scanner E2E', () => {
  test('should scan QR code from image', async ({ page }) => {
    await page.goto('http://localhost:3333/scanner-test.html');

    // Upload QR code image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-fixtures/sample-qr.png');

    // Wait for scan result
    const result = await page.locator('#scan-result').textContent();
    expect(result).toBeTruthy();
  });
});

test.describe('Performance E2E', () => {
  test('should render within performance budget', async ({ page }) => {
    await page.goto('http://localhost:3333/test.html');

    const renderTime = await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      const start = performance.now();
      createQRCode({
        content: 'https://example.com',
        container,
        style: { size: 500 },
      });

      return performance.now() - start;
    });

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('should handle batch generation efficiently', async ({ page }) => {
    await page.goto('http://localhost:3333/test.html');

    const batchTime = await page.evaluate(() => {
      const { createQRCode } = window as any;

      const start = performance.now();
      for (let i = 0; i < 50; i++) {
        const div = document.createElement('div');
        document.body.appendChild(div);
        createQRCode({
          content: `https://example.com/${i}`,
          container: div,
          style: { size: 200 },
        });
      }

      return performance.now() - start;
    });

    // 50 QR codes should generate in under 2 seconds
    expect(batchTime).toBeLessThan(2000);
  });
});

test.describe('Visual Regression', () => {
  test('should match baseline for standard QR', async ({ page }) => {
    await page.goto('http://localhost:3333/test.html');

    await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      createQRCode({
        content: 'https://example.com',
        container,
        style: { size: 300 },
      });
    });

    await expect(page.locator('#qr-container')).toHaveScreenshot('baseline-qr.png');
  });

  test('should match baseline for gradient QR', async ({ page }) => {
    await page.goto('http://localhost:3333/test.html');

    await page.evaluate(() => {
      const { createQRCode } = window as any;
      const container = document.getElementById('qr-container');

      createQRCode({
        content: 'https://example.com',
        container,
        style: {
          size: 300,
          dotStyle: 'rounded',
          gradient: {
            type: 'linear',
            colors: ['#667eea', '#764ba2'],
            direction: 45,
          },
        },
      });
    });

    await expect(page.locator('#qr-container')).toHaveScreenshot('gradient-baseline.png');
  });
});


