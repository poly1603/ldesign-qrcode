/**
 * QR Code Preset Templates
 * Pre-configured styles for quick and beautiful QR codes
 */

import type { QRCodeStyle } from '../types';

/**
 * Preset template interface
 */
export interface QRCodePreset {
  name: string;
  description: string;
  style: Partial<QRCodeStyle>;
  tags?: string[];
}

/**
 * Modern gradient preset
 */
const modern: QRCodePreset = {
  name: 'Modern',
  description: 'Modern gradient with rounded corners and shadow',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
    shadow: {
      blur: 10,
      color: 'rgba(0, 0, 0, 0.2)',
      offsetY: 4,
    },
  },
  tags: ['gradient', 'modern', 'shadow'],
};

/**
 * Minimal preset
 */
const minimal: QRCodePreset = {
  name: 'Minimal',
  description: 'Simple black and white design',
  style: {
    size: 300,
    dotStyle: 'square',
    fgColor: '#000000',
    bgColor: '#ffffff',
  },
  tags: ['minimal', 'simple', 'classic'],
};

/**
 * Neon preset
 */
const neon: QRCodePreset = {
  name: 'Neon',
  description: 'Vibrant neon colors with glow effect',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#00f5ff', '#ff00ff', '#7000ff'],
      position: { x: 0.5, y: 0.5 },
    },
    shadow: {
      blur: 20,
      color: 'rgba(0, 245, 255, 0.5)',
    },
    bgColor: '#0a0a0a',
  },
  tags: ['neon', 'glow', 'vibrant'],
};

/**
 * Ocean preset
 */
const ocean: QRCodePreset = {
  name: 'Ocean',
  description: 'Calming ocean blue gradient',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#2E3192', '#1BFFFF'],
      direction: 135,
    },
    bgColor: '#f0f9ff',
  },
  tags: ['blue', 'ocean', 'calm'],
};

/**
 * Sunset preset
 */
const sunset: QRCodePreset = {
  name: 'Sunset',
  description: 'Warm sunset colors',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'linear',
      colors: ['#ff6b6b', '#feca57', '#ee5a6f'],
      direction: 45,
    },
    bgColor: '#fff5f5',
  },
  tags: ['warm', 'sunset', 'orange'],
};

/**
 * Forest preset
 */
const forest: QRCodePreset = {
  name: 'Forest',
  description: 'Natural green tones',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#11998e', '#38ef7d'],
      direction: 90,
    },
    bgColor: '#f0fff4',
  },
  tags: ['green', 'nature', 'forest'],
};

/**
 * Monochrome preset
 */
const monochrome: QRCodePreset = {
  name: 'Monochrome',
  description: 'Elegant grayscale design',
  style: {
    size: 300,
    dotStyle: 'classy-rounded',
    fgColor: '#2d3748',
    bgColor: '#f7fafc',
    shadow: {
      blur: 5,
      color: 'rgba(0, 0, 0, 0.1)',
      offsetY: 2,
    },
  },
  tags: ['grayscale', 'elegant', 'professional'],
};

/**
 * Cyberpunk preset
 */
const cyberpunk: QRCodePreset = {
  name: 'Cyberpunk',
  description: 'Futuristic cyberpunk aesthetic',
  style: {
    size: 300,
    dotStyle: 'diamond',
    gradient: {
      type: 'linear',
      colors: ['#f953c6', '#b91d73', '#833ab4'],
      direction: 45,
    },
    shadow: {
      blur: 15,
      color: 'rgba(249, 83, 198, 0.5)',
    },
    bgColor: '#1a1a2e',
  },
  tags: ['futuristic', 'cyberpunk', 'tech'],
};

/**
 * Pastel preset
 */
const pastel: QRCodePreset = {
  name: 'Pastel',
  description: 'Soft pastel colors',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#fbc2eb', '#a6c1ee'],
      direction: 135,
    },
    bgColor: '#fffbf0',
  },
  tags: ['pastel', 'soft', 'cute'],
};

/**
 * Gold preset
 */
const gold: QRCodePreset = {
  name: 'Gold',
  description: 'Luxurious gold theme',
  style: {
    size: 300,
    dotStyle: 'classy',
    gradient: {
      type: 'linear',
      colors: ['#f7971e', '#ffd200'],
      direction: 45,
    },
    bgColor: '#1a1a1a',
    shadow: {
      blur: 12,
      color: 'rgba(255, 210, 0, 0.3)',
    },
  },
  tags: ['gold', 'luxury', 'premium'],
};

/**
 * Cherry preset
 */
const cherry: QRCodePreset = {
  name: 'Cherry',
  description: 'Sweet cherry blossom theme',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#ff9a9e', '#fad0c4'],
      position: { x: 0.5, y: 0.5 },
    },
    bgColor: '#fff5f7',
  },
  tags: ['pink', 'sweet', 'romantic'],
};

/**
 * Arctic preset
 */
const arctic: QRCodePreset = {
  name: 'Arctic',
  description: 'Cool arctic ice theme',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#a8edea', '#fed6e3'],
      direction: 90,
    },
    bgColor: '#f0fdfa',
  },
  tags: ['blue', 'cool', 'ice'],
};

/**
 * Corporate preset
 */
const corporate: QRCodePreset = {
  name: 'Corporate',
  description: 'Professional corporate style',
  style: {
    size: 300,
    dotStyle: 'square',
    fgColor: '#1e40af',
    bgColor: '#ffffff',
    shadow: {
      blur: 8,
      color: 'rgba(30, 64, 175, 0.15)',
      offsetY: 3,
    },
  },
  tags: ['professional', 'business', 'corporate'],
};

/**
 * Retro preset
 */
const retro: QRCodePreset = {
  name: 'Retro',
  description: 'Vintage retro style',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#f093fb', '#f5576c'],
      direction: 45,
    },
    bgColor: '#fff9db',
  },
  tags: ['retro', 'vintage', 'classic'],
};

/**
 * Galaxy preset
 */
const galaxy: QRCodePreset = {
  name: 'Galaxy',
  description: 'Deep space galaxy theme',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#8e2de2', '#4a00e0', '#000000'],
      position: { x: 0.5, y: 0.5 },
    },
    bgColor: '#0a0a0a',
    shadow: {
      blur: 20,
      color: 'rgba(142, 45, 226, 0.5)',
    },
  },
  tags: ['space', 'galaxy', 'cosmic'],
};

/**
 * Glassmorphism preset - modern frosted glass effect
 */
const glassmorphism: QRCodePreset = {
  name: 'Glassmorphism',
  description: 'Modern frosted glass effect with blur',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'],
      direction: 135,
    },
    bgColor: 'transparent',
    shadow: {
      blur: 20,
      color: 'rgba(31, 38, 135, 0.37)',
      offsetX: 0,
      offsetY: 8,
    },
    stroke: {
      width: 1,
      color: 'rgba(255, 255, 255, 0.18)',
    },
  },
  tags: ['glass', 'modern', 'blur', 'transparent'],
};

/**
 * Neumorphism preset - soft UI effect
 */
const neumorphism: QRCodePreset = {
  name: 'Neumorphism',
  description: 'Soft UI with embossed effect',
  style: {
    size: 300,
    dotStyle: 'rounded',
    fgColor: '#e0e5ec',
    bgColor: '#e0e5ec',
    shadow: {
      blur: 15,
      color: 'rgba(0, 0, 0, 0.1)',
      offsetX: 5,
      offsetY: 5,
    },
  },
  tags: ['neumorphism', 'soft', 'ui', '3d'],
};

/**
 * Holographic preset - iridescent rainbow effect
 */
const holographic: QRCodePreset = {
  name: 'Holographic',
  description: 'Iridescent rainbow holographic effect',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#ff6b6b'],
      direction: 45,
    },
    bgColor: '#1a1a2e',
    shadow: {
      blur: 15,
      color: 'rgba(255, 107, 107, 0.3)',
    },
  },
  tags: ['holographic', 'rainbow', 'iridescent', 'colorful'],
};

/**
 * Gradient Mesh preset - multi-color mesh gradient
 */
const gradientMesh: QRCodePreset = {
  name: 'GradientMesh',
  description: 'Beautiful multi-color mesh gradient',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#667eea', '#764ba2', '#f093fb'],
      position: { x: 0.3, y: 0.3 },
    },
    bgColor: '#fafafa',
  },
  tags: ['gradient', 'mesh', 'colorful', 'modern'],
};

/**
 * Brutalism preset - bold and raw design
 */
const brutalism: QRCodePreset = {
  name: 'Brutalism',
  description: 'Bold brutalist design with thick borders',
  style: {
    size: 300,
    dotStyle: 'square',
    fgColor: '#000000',
    bgColor: '#ffff00',
    stroke: {
      width: 4,
      color: '#000000',
    },
    shadow: {
      blur: 0,
      color: '#000000',
      offsetX: 6,
      offsetY: 6,
    },
  },
  tags: ['brutalism', 'bold', 'raw', 'graphic'],
};

/**
 * Candy preset - sweet pastel colors
 */
const candy: QRCodePreset = {
  name: 'Candy',
  description: 'Sweet candy-like pastel colors',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'linear',
      colors: ['#ff9a9e', '#fecfef', '#fecfef', '#a18cd1'],
      direction: 45,
    },
    bgColor: '#fff5f5',
    shadow: {
      blur: 10,
      color: 'rgba(255, 154, 158, 0.3)',
    },
  },
  tags: ['candy', 'pastel', 'sweet', 'cute'],
};

/**
 * Midnight preset - dark elegant theme
 */
const midnight: QRCodePreset = {
  name: 'Midnight',
  description: 'Dark elegant midnight theme',
  style: {
    size: 300,
    dotStyle: 'classy-rounded',
    gradient: {
      type: 'linear',
      colors: ['#2c3e50', '#3498db'],
      direction: 135,
    },
    bgColor: '#0c0c0c',
    shadow: {
      blur: 15,
      color: 'rgba(52, 152, 219, 0.3)',
    },
  },
  tags: ['dark', 'midnight', 'elegant', 'blue'],
};

/**
 * Aurora preset - northern lights effect
 */
const aurora: QRCodePreset = {
  name: 'Aurora',
  description: 'Beautiful aurora borealis effect',
  style: {
    size: 300,
    dotStyle: 'liquid',
    gradient: {
      type: 'linear',
      colors: ['#00d2ff', '#3a7bd5', '#00d2ff', '#928dab'],
      direction: 180,
    },
    bgColor: '#0f0f23',
    shadow: {
      blur: 20,
      color: 'rgba(0, 210, 255, 0.4)',
    },
  },
  tags: ['aurora', 'northern lights', 'blue', 'green'],
};

/**
 * Lava preset - hot molten lava effect
 */
const lava: QRCodePreset = {
  name: 'Lava',
  description: 'Hot molten lava effect',
  style: {
    size: 300,
    dotStyle: 'liquid',
    gradient: {
      type: 'radial',
      colors: ['#ff512f', '#dd2476', '#ff512f'],
      position: { x: 0.5, y: 0.5 },
    },
    bgColor: '#1a0a0a',
    shadow: {
      blur: 25,
      color: 'rgba(255, 81, 47, 0.5)',
    },
  },
  tags: ['lava', 'hot', 'fire', 'red'],
};

/**
 * Matrix preset - digital rain effect
 */
const matrix: QRCodePreset = {
  name: 'Matrix',
  description: 'Digital matrix rain effect',
  style: {
    size: 300,
    dotStyle: 'square',
    gradient: {
      type: 'linear',
      colors: ['#00ff00', '#003300', '#00ff00'],
      direction: 180,
    },
    bgColor: '#000000',
    shadow: {
      blur: 10,
      color: 'rgba(0, 255, 0, 0.5)',
    },
  },
  tags: ['matrix', 'digital', 'green', 'tech'],
};

/**
 * Elegant preset - sophisticated luxury style
 */
const elegant: QRCodePreset = {
  name: 'Elegant',
  description: 'Sophisticated luxury style',
  style: {
    size: 300,
    dotStyle: 'classy',
    gradient: {
      type: 'linear',
      colors: ['#434343', '#000000'],
      direction: 135,
    },
    bgColor: '#fafafa',
    shadow: {
      blur: 8,
      color: 'rgba(0, 0, 0, 0.15)',
      offsetY: 4,
    },
  },
  tags: ['elegant', 'luxury', 'sophisticated', 'professional'],
};

/**
 * Watercolor preset - artistic watercolor effect
 */
const watercolor: QRCodePreset = {
  name: 'Watercolor',
  description: 'Artistic watercolor painting effect',
  style: {
    size: 300,
    dotStyle: 'smooth-dots',
    gradient: {
      type: 'radial',
      colors: ['#a8e6cf', '#dcedc1', '#ffd3a5', '#ffaaa5'],
      position: { x: 0.5, y: 0.5 },
    },
    bgColor: '#fffef0',
  },
  tags: ['watercolor', 'artistic', 'painting', 'colorful'],
};

/**
 * Neon Glow preset - vibrant neon glow
 */
const neonGlow: QRCodePreset = {
  name: 'NeonGlow',
  description: 'Vibrant neon with intense glow',
  style: {
    size: 300,
    dotStyle: 'rounded',
    fgColor: '#00ffff',
    bgColor: '#0a0a0a',
    shadow: {
      blur: 30,
      color: '#00ffff',
    },
  },
  tags: ['neon', 'glow', 'cyan', 'vibrant'],
};

/**
 * Rose Gold preset - trendy rose gold
 */
const roseGold: QRCodePreset = {
  name: 'RoseGold',
  description: 'Trendy rose gold metallic',
  style: {
    size: 300,
    dotStyle: 'classy-rounded',
    gradient: {
      type: 'linear',
      colors: ['#b76e79', '#e8c4c4', '#b76e79'],
      direction: 45,
    },
    bgColor: '#fff9f9',
    shadow: {
      blur: 10,
      color: 'rgba(183, 110, 121, 0.3)',
    },
  },
  tags: ['rose gold', 'metallic', 'pink', 'trendy'],
};

/**
 * Tech Blue preset - modern tech company style
 */
const techBlue: QRCodePreset = {
  name: 'TechBlue',
  description: 'Modern tech company blue',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#0061ff', '#60efff'],
      direction: 135,
    },
    bgColor: '#f0f7ff',
    shadow: {
      blur: 12,
      color: 'rgba(0, 97, 255, 0.2)',
    },
  },
  tags: ['tech', 'blue', 'modern', 'professional'],
};

/**
 * Vintage Paper preset - old paper effect
 */
const vintagePaper: QRCodePreset = {
  name: 'VintagePaper',
  description: 'Old vintage paper effect',
  style: {
    size: 300,
    dotStyle: 'square',
    fgColor: '#5c4033',
    bgColor: '#f4e4bc',
    shadow: {
      blur: 3,
      color: 'rgba(92, 64, 51, 0.2)',
    },
  },
  tags: ['vintage', 'paper', 'old', 'retro'],
};

/**
 * Gradient Wave preset - wave-like gradient
 */
const gradientWave: QRCodePreset = {
  name: 'GradientWave',
  description: 'Wave-like flowing gradient',
  style: {
    size: 300,
    dotStyle: 'liquid',
    gradient: {
      type: 'linear',
      colors: ['#12c2e9', '#c471ed', '#f64f59'],
      direction: 90,
    },
    bgColor: '#ffffff',
  },
  tags: ['gradient', 'wave', 'colorful', 'flowing'],
};

/**
 * Minimalist Black preset - pure minimal black
 */
const minimalistBlack: QRCodePreset = {
  name: 'MinimalistBlack',
  description: 'Pure minimalist black design',
  style: {
    size: 300,
    dotStyle: 'extra-rounded',
    fgColor: '#1a1a1a',
    bgColor: '#ffffff',
    margin: 6,
  },
  tags: ['minimal', 'black', 'clean', 'simple'],
};

/**
 * Spring preset - fresh spring colors
 */
const spring: QRCodePreset = {
  name: 'Spring',
  description: 'Fresh spring flower colors',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'linear',
      colors: ['#ff758c', '#ff7eb3', '#ffc8dd'],
      direction: 45,
    },
    bgColor: '#f0fff0',
    shadow: {
      blur: 8,
      color: 'rgba(255, 117, 140, 0.2)',
    },
  },
  tags: ['spring', 'flower', 'pink', 'fresh'],
};

/**
 * Summer preset - bright summer vibes
 */
const summer: QRCodePreset = {
  name: 'Summer',
  description: 'Bright summer sunshine vibes',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'radial',
      colors: ['#f7971e', '#ffd200', '#ffeaa7'],
      position: { x: 0.5, y: 0.3 },
    },
    bgColor: '#fff8e7',
  },
  tags: ['summer', 'sunshine', 'yellow', 'bright'],
};

/**
 * Autumn preset - warm autumn colors
 */
const autumn: QRCodePreset = {
  name: 'Autumn',
  description: 'Warm autumn foliage colors',
  style: {
    size: 300,
    dotStyle: 'classy-rounded',
    gradient: {
      type: 'linear',
      colors: ['#d38312', '#a83279'],
      direction: 135,
    },
    bgColor: '#fdf5e6',
    shadow: {
      blur: 8,
      color: 'rgba(211, 131, 18, 0.2)',
    },
  },
  tags: ['autumn', 'fall', 'warm', 'orange'],
};

/**
 * Winter preset - cool winter frost
 */
const winter: QRCodePreset = {
  name: 'Winter',
  description: 'Cool winter frost colors',
  style: {
    size: 300,
    dotStyle: 'hexagon',
    gradient: {
      type: 'linear',
      colors: ['#e0eafc', '#cfdef3', '#a8c0ff'],
      direction: 180,
    },
    bgColor: '#f0f4f8',
    shadow: {
      blur: 10,
      color: 'rgba(168, 192, 255, 0.3)',
    },
  },
  tags: ['winter', 'frost', 'cold', 'blue'],
};

/**
 * Social preset - social media friendly
 */
const social: QRCodePreset = {
  name: 'Social',
  description: 'Social media friendly design',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#833ab4', '#fd1d1d', '#fcb045'],
      direction: 45,
    },
    bgColor: '#ffffff',
    shadow: {
      blur: 15,
      color: 'rgba(131, 58, 180, 0.25)',
    },
  },
  tags: ['social', 'instagram', 'colorful', 'modern'],
};

/**
 * Bitcoin preset - crypto currency style
 */
const bitcoin: QRCodePreset = {
  name: 'Bitcoin',
  description: 'Cryptocurrency bitcoin style',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#f7931a', '#ffb347'],
      direction: 135,
    },
    bgColor: '#1a1a2e',
    shadow: {
      blur: 15,
      color: 'rgba(247, 147, 26, 0.4)',
    },
  },
  tags: ['bitcoin', 'crypto', 'currency', 'orange'],
};

/**
 * Collection of all presets
 */
export const QRCodePresets: Record<string, QRCodePreset> = {
  modern,
  minimal,
  neon,
  ocean,
  sunset,
  forest,
  monochrome,
  cyberpunk,
  pastel,
  gold,
  cherry,
  arctic,
  corporate,
  retro,
  galaxy,
  // New presets
  glassmorphism,
  neumorphism,
  holographic,
  gradientMesh,
  brutalism,
  candy,
  midnight,
  aurora,
  lava,
  matrix,
  elegant,
  watercolor,
  neonGlow,
  roseGold,
  techBlue,
  vintagePaper,
  gradientWave,
  minimalistBlack,
  spring,
  summer,
  autumn,
  winter,
  social,
  bitcoin,
};

/**
 * Get preset by name
 */
export function getPreset(name: keyof typeof QRCodePresets): QRCodeStyle {
  const preset = QRCodePresets[name];
  if (!preset) {
    throw new Error(`Preset "${name}" not found`);
  }
  return preset.style;
}

/**
 * Get all preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(QRCodePresets);
}

/**
 * Search presets by tag
 */
export function searchPresetsByTag(tag: string): QRCodePreset[] {
  return Object.values(QRCodePresets).filter(
    preset => preset.tags?.includes(tag.toLowerCase())
  );
}

/**
 * Get all available tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  Object.values(QRCodePresets).forEach(preset => {
    preset.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// Default export
export default QRCodePresets;
