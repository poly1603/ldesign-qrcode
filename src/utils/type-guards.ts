/**
 * Type guards and type utilities for QR Code library
 * Solves TypeScript strict mode issues
 */

import type {
  ErrorCorrectionLevel,
  ErrorCorrectionLevelString,
  RenderType,
  RenderTypeString,
  DotStyle,
  DotStyleString,
  QRCodeConfig,
  QRCodeStyle,
  LogoConfig,
} from '../types';

/**
 * Check if value is a valid error correction level
 */
export function isErrorCorrectionLevel(value: unknown): value is ErrorCorrectionLevel {
  return typeof value === 'string' && ['L', 'M', 'Q', 'H'].includes(value);
}

/**
 * Convert string to ErrorCorrectionLevel enum
 */
export function toErrorCorrectionLevel(value: string | ErrorCorrectionLevel): ErrorCorrectionLevel {
  if (isErrorCorrectionLevel(value)) {
    return value as ErrorCorrectionLevel;
  }
  
  switch (value) {
    case 'L':
      return 'L' as ErrorCorrectionLevel;
    case 'M':
      return 'M' as ErrorCorrectionLevel;
    case 'Q':
      return 'Q' as ErrorCorrectionLevel;
    case 'H':
      return 'H' as ErrorCorrectionLevel;
    default:
      return 'M' as ErrorCorrectionLevel; // Default fallback
  }
}

/**
 * Check if value is a valid render type
 */
export function isRenderType(value: unknown): value is RenderType {
  return typeof value === 'string' && ['canvas', 'svg', 'webgl'].includes(value);
}

/**
 * Convert string to RenderType
 */
export function toRenderType(value: string | RenderType): RenderType {
  if (isRenderType(value)) {
    return value as RenderType;
  }
  
  switch (value) {
    case 'canvas':
      return 'canvas' as RenderType;
    case 'svg':
      return 'svg' as RenderType;
    case 'webgl':
      return 'webgl' as RenderType;
    default:
      return 'canvas' as RenderType; // Default fallback
  }
}

/**
 * Check if value is a valid dot style
 */
export function isDotStyle(value: unknown): value is DotStyle {
  return typeof value === 'string' && [
    'square', 'rounded', 'dots', 'diamond', 'star',
    'classy', 'classy-rounded', 'extra-rounded',
    'hexagon', 'liquid', 'smooth-dots', 'smooth-flow', 'ultra-smooth'
  ].includes(value);
}

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Filter undefined properties from object
 */
export function filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

/**
 * Safely get property value with default
 */
export function getOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return value !== undefined ? value : defaultValue;
}

/**
 * Validate and normalize QRCodeConfig
 */
export function normalizeConfig(config: Partial<QRCodeConfig>): QRCodeConfig {
  const normalized: QRCodeConfig = {
    content: config.content || '',
    errorCorrectionLevel: config.errorCorrectionLevel 
      ? toErrorCorrectionLevel(config.errorCorrectionLevel)
      : ('M' as ErrorCorrectionLevel),
    renderType: config.renderType
      ? toRenderType(config.renderType)
      : ('canvas' as RenderType),
  };
  
  // Only add optional properties if they are defined
  if (isDefined(config.style)) {
    normalized.style = normalizeStyle(config.style);
  }
  
  if (isDefined(config.logo)) {
    normalized.logo = normalizeLogo(config.logo);
  }
  
  if (isDefined(config.typeNumber)) {
    normalized.typeNumber = config.typeNumber;
  }
  
  if (isDefined(config.maxTypeNumber)) {
    normalized.maxTypeNumber = config.maxTypeNumber;
  }
  
  if (isDefined(config.maskPattern)) {
    normalized.maskPattern = config.maskPattern;
  }
  
  return normalized;
}

/**
 * Normalize style configuration
 */
export function normalizeStyle(style: Partial<QRCodeStyle>): QRCodeStyle {
  const normalized: QRCodeStyle = {};
  
  // Only include defined properties
  if (isDefined(style.fgColor)) normalized.fgColor = style.fgColor;
  if (isDefined(style.bgColor)) normalized.bgColor = style.bgColor;
  if (isDefined(style.size)) normalized.size = style.size;
  if (isDefined(style.margin)) normalized.margin = style.margin;
  if (isDefined(style.cornerRadius)) normalized.cornerRadius = style.cornerRadius;
  if (isDefined(style.dotStyle)) normalized.dotStyle = style.dotStyle;
  if (isDefined(style.gradient)) normalized.gradient = style.gradient;
  if (isDefined(style.backgroundGradient)) normalized.backgroundGradient = style.backgroundGradient;
  if (isDefined(style.backgroundImage)) normalized.backgroundImage = style.backgroundImage;
  if (isDefined(style.eyeStyle)) normalized.eyeStyle = style.eyeStyle;
  if (isDefined(style.shadow)) normalized.shadow = style.shadow;
  if (isDefined(style.stroke)) normalized.stroke = style.stroke;
  if (isDefined(style.rotate)) normalized.rotate = style.rotate;
  if (isDefined(style.invert)) normalized.invert = style.invert;
  if (isDefined(style.renderLayer)) normalized.renderLayer = style.renderLayer;
  if (isDefined(style.transform)) normalized.transform = style.transform;
  if (isDefined(style.transform3D)) normalized.transform3D = style.transform3D;
  if (isDefined(style.filter)) normalized.filter = style.filter;
  if (isDefined(style.marginNoise)) normalized.marginNoise = style.marginNoise;
  if (isDefined(style.seed)) normalized.seed = style.seed;
  if (isDefined(style.safeSpace)) normalized.safeSpace = style.safeSpace;
  if (isDefined(style.subMarker)) normalized.subMarker = style.subMarker;
  if (isDefined(style.effect)) normalized.effect = style.effect;
  if (isDefined(style.pixelSize)) normalized.pixelSize = style.pixelSize;
  
  return normalized;
}

/**
 * Normalize logo configuration
 */
export function normalizeLogo(logo: Partial<LogoConfig>): LogoConfig {
  const normalized: LogoConfig = {
    src: logo.src || '',
  };
  
  // Only include defined optional properties
  if (isDefined(logo.width)) normalized.width = logo.width;
  if (isDefined(logo.height)) normalized.height = logo.height;
  if (isDefined(logo.border)) normalized.border = logo.border;
  if (isDefined(logo.borderColor)) normalized.borderColor = logo.borderColor;
  if (isDefined(logo.borderWidth)) normalized.borderWidth = logo.borderWidth;
  if (isDefined(logo.borderRadius)) normalized.borderRadius = logo.borderRadius;
  if (isDefined(logo.crossOrigin)) normalized.crossOrigin = logo.crossOrigin;
  if (isDefined(logo.logoShape)) normalized.logoShape = logo.logoShape;
  if (isDefined(logo.aspectRatio)) normalized.aspectRatio = logo.aspectRatio;
  if (isDefined(logo.logoBackground)) normalized.logoBackground = logo.logoBackground;
  if (isDefined(logo.logoBackgroundPadding)) normalized.logoBackgroundPadding = logo.logoBackgroundPadding;
  if (isDefined(logo.logoBackgroundColor)) normalized.logoBackgroundColor = logo.logoBackgroundColor;
  
  return normalized;
}

/**
 * Type-safe property accessor
 */
export function getProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  return obj[key] !== undefined ? obj[key] : defaultValue;
}

/**
 * Check if object has property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

/**
 * Assert value is not null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Value is not defined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Create a type-safe enum mapper
 */
export function createEnumMapper<T extends string>(
  enumValues: readonly T[]
): (value: string) => T | undefined {
  const set = new Set(enumValues);
  
  return (value: string): T | undefined => {
    return set.has(value as T) ? (value as T) : undefined;
  };
}

/**
 * Validate numeric value within range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  name: string = 'Value'
): number {
  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  return value;
}

/**
 * Safe JSON parse with type checking
 */
export function safeJsonParse<T>(
  json: string,
  validator?: (data: unknown) => data is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    if (validator && !validator(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Deep freeze object for immutability
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj);
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop];
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  
  return obj;
}

/**
 * Create a type predicate function
 */
export function createTypePredicate<T>(
  check: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => check(value);
}