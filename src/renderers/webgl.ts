/**
 * WebGL-accelerated QR Code Renderer
 * Provides GPU-accelerated rendering for complex effects and batch generation
 */

import type { QRCodeConfig, QRCodeStyle } from '../types';
import { DotStyle } from '../types';
import { QRCodeGenerator } from '../core/generator';

/**
 * Check if WebGL is supported
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') ||
      canvas.getContext('webgl2') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

/**
 * WebGL Renderer for QR Codes
 */
export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private generator: QRCodeGenerator;
  private config: QRCodeConfig;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;

  constructor(config: QRCodeConfig) {
    this.config = config;
    this.generator = new QRCodeGenerator(config);

    this.canvas = document.createElement('canvas');
    const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl;
    this.initialize();
  }

  /**
   * Initialize WebGL context and shaders
   */
  private initialize(): void {
    const { gl } = this;

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment shader with gradient and effects support
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform sampler2D u_qrData;
      uniform vec4 u_fgColor;
      uniform vec4 u_bgColor;
      uniform int u_dotStyle;
      uniform vec2 u_resolution;
      uniform float u_cornerRadius;
      uniform int u_useGradient;
      uniform vec4 u_gradientColors[8];
      uniform int u_gradientStops;
      uniform vec2 u_gradientStart;
      uniform vec2 u_gradientEnd;
      
      varying vec2 v_texCoord;
      
      // Distance to rounded square
      float roundedSquareSDF(vec2 p, vec2 size, float radius) {
        vec2 d = abs(p) - size + radius;
        return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
      }
      
      // Get gradient color
      vec4 getGradientColor(vec2 pos) {
        if (u_useGradient == 0) {
          return u_fgColor;
        }
        
        float t = dot(pos - u_gradientStart, u_gradientEnd - u_gradientStart) / 
                  dot(u_gradientEnd - u_gradientStart, u_gradientEnd - u_gradientStart);
        t = clamp(t, 0.0, 1.0);
        
        // Simple linear interpolation between colors
        if (u_gradientStops >= 2) {
          return mix(u_gradientColors[0], u_gradientColors[1], t);
        }
        
        return u_fgColor;
      }
      
      void main() {
        vec2 pixelPos = v_texCoord * u_resolution;
        vec2 modulePos = floor(pixelPos);
        vec2 localPos = fract(pixelPos) - 0.5;
        
        // Sample QR data
        float isDark = texture2D(u_qrData, modulePos / u_resolution).r;
        
        if (isDark < 0.5) {
          gl_FragColor = u_bgColor;
          return;
        }
        
        float alpha = 1.0;
        
        // Apply dot style
        if (u_dotStyle == 1) { // Rounded
          float dist = roundedSquareSDF(localPos, vec2(0.45), u_cornerRadius);
          alpha = 1.0 - smoothstep(-0.01, 0.01, dist);
        } else if (u_dotStyle == 2) { // Dots (circles)
          float dist = length(localPos);
          alpha = 1.0 - smoothstep(0.4, 0.45, dist);
        } else if (u_dotStyle == 3) { // Diamond
          float dist = abs(localPos.x) + abs(localPos.y);
          alpha = 1.0 - smoothstep(0.45, 0.5, dist);
        }
        
        vec4 color = getGradientColor(pixelPos / u_resolution);
        gl_FragColor = mix(u_bgColor, color, alpha);
      }
    `;

    // Create and compile shaders
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }

    // Create and link program
    this.program = gl.createProgram();
    if (!this.program) {
      throw new Error('Failed to create WebGL program');
    }

    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(this.program);
      throw new Error('Failed to link program: ' + info);
    }

    // Setup geometry
    this.setupGeometry();

    // Create texture for QR data
    this.texture = gl.createTexture();
  }

  /**
   * Create and compile shader
   */
  private createShader(type: number, source: string): WebGLShader | null {
    const { gl } = this;
    const shader = gl.createShader(type);

    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      console.error('Shader compilation error:', info);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Setup quad geometry for rendering
   */
  private setupGeometry(): void {
    const { gl, program } = this;
    if (!program) return;

    // Quad vertices
    const vertices = new Float32Array([
      -1, -1, 0, 0,
      1, -1, 1, 0,
      -1, 1, 0, 1,
      -1, 1, 0, 1,
      1, -1, 1, 0,
      1, 1, 1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);
  }

  /**
   * Upload QR code data to GPU texture
   */
  private uploadQRData(): void {
    const { gl, texture } = this;
    if (!texture) return;

    const moduleCount = this.generator.getModuleCount();
    const data = new Uint8Array(moduleCount * moduleCount * 4);

    // Convert boolean matrix to texture data
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const idx = (row * moduleCount + col) * 4;
        const isDark = this.generator.isDark(row, col);
        const value = isDark ? 255 : 0;
        data[idx] = value;
        data[idx + 1] = value;
        data[idx + 2] = value;
        data[idx + 3] = 255;
      }
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      moduleCount,
      moduleCount,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  /**
   * Parse color string to vec4
   */
  private parseColor(color: string): [number, number, number, number] {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    return [r, g, b, 1.0];
  }

  /**
   * Render QR code
   */
  render(): void {
    const { gl, program } = this;
    if (!program) return;

    const style = this.config.style || {};
    const size = style.size || 200;
    const moduleCount = this.generator.getModuleCount();

    // Set canvas size
    this.canvas.width = size;
    this.canvas.height = size;
    gl.viewport(0, 0, size, size);

    // Upload QR data
    this.uploadQRData();

    // Use program
    gl.useProgram(program);

    // Set uniforms
    const fgColor = this.parseColor(style.fgColor || '#000000');
    const bgColor = this.parseColor(style.bgColor || '#ffffff');

    gl.uniform4fv(gl.getUniformLocation(program, 'u_fgColor'), fgColor);
    gl.uniform4fv(gl.getUniformLocation(program, 'u_bgColor'), bgColor);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), moduleCount, moduleCount);
    gl.uniform1f(gl.getUniformLocation(program, 'u_cornerRadius'), style.cornerRadius || 0);

    // Dot style
    let dotStyleEnum = 0; // square
    if (style.dotStyle === DotStyle.Rounded) dotStyleEnum = 1;
    else if (style.dotStyle === DotStyle.Dots) dotStyleEnum = 2;
    else if (style.dotStyle === DotStyle.Diamond) dotStyleEnum = 3;
    gl.uniform1i(gl.getUniformLocation(program, 'u_dotStyle'), dotStyleEnum);

    // Gradient support
    if (style.gradient) {
      gl.uniform1i(gl.getUniformLocation(program, 'u_useGradient'), 1);
      // Set gradient parameters (simplified)
      const colors = style.gradient.colors.map(c => this.parseColor(c));
      gl.uniform1i(gl.getUniformLocation(program, 'u_gradientStops'), colors.length);

      // Upload gradient colors
      for (let i = 0; i < Math.min(colors.length, 8); i++) {
        gl.uniform4fv(
          gl.getUniformLocation(program, `u_gradientColors[${i}]`),
          colors[i]
        );
      }

      // Set gradient direction
      if (style.gradient.type === 'linear') {
        const angle = (style.gradient.direction || 0) * Math.PI / 180;
        gl.uniform2f(gl.getUniformLocation(program, 'u_gradientStart'), 0, 0);
        gl.uniform2f(
          gl.getUniformLocation(program, 'u_gradientEnd'),
          Math.cos(angle),
          Math.sin(angle)
        );
      }
    } else {
      gl.uniform1i(gl.getUniformLocation(program, 'u_useGradient'), 0);
    }

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_qrData'), 0);

    // Clear and draw
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Convert to data URL
   */
  toDataURL(format: 'png' | 'jpeg' = 'png', quality?: number): string {
    if (format === 'jpeg') {
      return this.canvas.toDataURL('image/jpeg', quality);
    }
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Download as image
   */
  download(fileName: string, format: 'png' | 'jpeg' = 'png', quality?: number): void {
    const dataURL = this.toDataURL(format, quality);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    link.click();
  }

  /**
   * Update configuration and re-render
   */
  update(config: Partial<QRCodeConfig>): void {
    this.config = { ...this.config, ...config };
    this.generator.update(config);
    this.render();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    const { gl, program, texture } = this;

    if (program) {
      gl.deleteProgram(program);
    }

    if (texture) {
      gl.deleteTexture(texture);
    }

    // Lose context to free GPU memory
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }
  }
}


