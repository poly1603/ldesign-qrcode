/**
 * Efficient bit array implementation for QR code matrix storage
 * Reduces memory usage by 87.5% compared to boolean arrays
 */

export class BitArray {
  private data: Uint8Array;
  private length: number;

  constructor(length: number) {
    this.length = length;
    // Each byte stores 8 bits
    this.data = new Uint8Array(Math.ceil(length / 8));
  }

  /**
   * Set bit at index to 1 (true)
   */
  set(index: number): void {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length})`);
    }
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.data[byteIndex] |= (1 << bitIndex);
  }

  /**
   * Set bit at index to 0 (false)
   */
  clear(index: number): void {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length})`);
    }
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.data[byteIndex] &= ~(1 << bitIndex);
  }

  /**
   * Get bit at index
   */
  get(index: number): boolean {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length})`);
    }
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (this.data[byteIndex] & (1 << bitIndex)) !== 0;
  }

  /**
   * Toggle bit at index
   */
  toggle(index: number): void {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.length})`);
    }
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.data[byteIndex] ^= (1 << bitIndex);
  }

  /**
   * Set bit value at index
   */
  setValue(index: number, value: boolean): void {
    if (value) {
      this.set(index);
    } else {
      this.clear(index);
    }
  }

  /**
   * Clear all bits
   */
  clearAll(): void {
    this.data.fill(0);
  }

  /**
   * Set all bits
   */
  setAll(): void {
    this.data.fill(0xFF);
  }

  /**
   * Get array length
   */
  getLength(): number {
    return this.length;
  }

  /**
   * Get byte size
   */
  getByteSize(): number {
    return this.data.length;
  }

  /**
   * Count number of set bits
   */
  count(): number {
    let count = 0;
    for (let i = 0; i < this.data.length; i++) {
      // Brian Kernighan's algorithm for counting set bits
      let byte = this.data[i];
      while (byte) {
        byte &= byte - 1;
        count++;
      }
    }
    return count;
  }

  /**
   * Clone the bit array
   */
  clone(): BitArray {
    const cloned = new BitArray(this.length);
    cloned.data.set(this.data);
    return cloned;
  }

  /**
   * Convert to boolean array (for compatibility)
   */
  toArray(): boolean[] {
    const result: boolean[] = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      result[i] = this.get(i);
    }
    return result;
  }

  /**
   * Create from boolean array
   */
  static fromArray(arr: boolean[]): BitArray {
    const bitArray = new BitArray(arr.length);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) {
        bitArray.set(i);
      }
    }
    return bitArray;
  }
}

/**
 * 2D BitMatrix for efficient QR code storage
 */
export class BitMatrix {
  private data: BitArray;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new BitArray(width * height);
  }

  /**
   * Get index from row and column
   */
  private getIndex(row: number, col: number): number {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      throw new RangeError(`Position (${row}, ${col}) out of bounds`);
    }
    return row * this.width + col;
  }

  /**
   * Set bit at position
   */
  set(row: number, col: number): void {
    this.data.set(this.getIndex(row, col));
  }

  /**
   * Clear bit at position
   */
  clear(row: number, col: number): void {
    this.data.clear(this.getIndex(row, col));
  }

  /**
   * Get bit at position
   */
  get(row: number, col: number): boolean {
    return this.data.get(this.getIndex(row, col));
  }

  /**
   * Set value at position
   */
  setValue(row: number, col: number, value: boolean): void {
    this.data.setValue(this.getIndex(row, col), value);
  }

  /**
   * Toggle bit at position
   */
  toggle(row: number, col: number): void {
    this.data.toggle(this.getIndex(row, col));
  }

  /**
   * Get width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Get height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Clear entire matrix
   */
  clearAll(): void {
    this.data.clearAll();
  }

  /**
   * Set entire matrix
   */
  setAll(): void {
    this.data.setAll();
  }

  /**
   * Get memory usage in bytes
   */
  getByteSize(): number {
    return this.data.getByteSize();
  }

  /**
   * Count set bits
   */
  count(): number {
    return this.data.count();
  }

  /**
   * Clone the matrix
   */
  clone(): BitMatrix {
    const cloned = new BitMatrix(this.width, this.height);
    cloned.data = this.data.clone();
    return cloned;
  }

  /**
   * Convert to 2D boolean array
   */
  toArray(): boolean[][] {
    const result: boolean[][] = new Array(this.height);
    for (let row = 0; row < this.height; row++) {
      result[row] = new Array(this.width);
      for (let col = 0; col < this.width; col++) {
        result[row][col] = this.get(row, col);
      }
    }
    return result;
  }

  /**
   * Create from 2D boolean array
   */
  static fromArray(arr: boolean[][]): BitMatrix {
    const height = arr.length;
    const width = arr[0]?.length ?? 0;
    const matrix = new BitMatrix(width, height);

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (arr[row][col]) {
          matrix.set(row, col);
        }
      }
    }

    return matrix;
  }

  /**
   * Get a region of the matrix
   */
  getRegion(startRow: number, startCol: number, height: number, width: number): BitMatrix {
    const region = new BitMatrix(width, height);

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (this.get(startRow + row, startCol + col)) {
          region.set(row, col);
        }
      }
    }

    return region;
  }

  /**
   * Set a region of the matrix
   */
  setRegion(startRow: number, startCol: number, region: BitMatrix): void {
    const regionHeight = region.getHeight();
    const regionWidth = region.getWidth();

    for (let row = 0; row < regionHeight; row++) {
      for (let col = 0; col < regionWidth; col++) {
        this.setValue(startRow + row, startCol + col, region.get(row, col));
      }
    }
  }
}

/**
 * Calculate memory savings
 */
export function calculateMemorySavings(moduleCount: number): {
  booleanArray: number;
  bitArray: number;
  savings: number;
  savingsPercent: number;
} {
  const totalBits = moduleCount * moduleCount;
  const booleanArray = totalBits; // 1 byte per boolean in JS
  const bitArray = Math.ceil(totalBits / 8);
  const savings = booleanArray - bitArray;
  const savingsPercent = (savings / booleanArray) * 100;

  return {
    booleanArray,
    bitArray,
    savings,
    savingsPercent,
  };
}


