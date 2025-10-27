/**
 * Enhanced Web Worker Pool with dynamic scaling and priority queue
 * Provides advanced batch processing capabilities
 */

import type { QRCodeConfig } from '../types';

export interface BatchQRCodeItem {
  id: string;
  config: QRCodeConfig;
  priority?: number; // Higher = more important
}

export interface BatchQRCodeResult {
  id: string;
  dataURL: string;
  error?: string;
  processingTime?: number;
}

export interface WorkerPoolConfig {
  minWorkers?: number;
  maxWorkers?: number;
  idleTimeout?: number;
  enableDynamicScaling?: boolean;
}

export interface WorkerTask {
  item: BatchQRCodeItem;
  resolve: (result: BatchQRCodeResult) => void;
  reject: (error: Error) => void;
  priority: number;
  queuedAt: number;
}

/**
 * Priority Queue for task management
 */
class PriorityQueue<T extends { priority: number }> {
  private items: T[] = [];

  enqueue(item: T): void {
    if (this.items.length === 0) {
      this.items.push(item);
      return;
    }

    // Insert in priority order (higher priority first)
    let inserted = false;
    for (let i = 0; i < this.items.length; i++) {
      if (item.priority > this.items[i].priority) {
        this.items.splice(i, 0, item);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.items.push(item);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  get length(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

/**
 * Worker wrapper with state tracking
 */
class ManagedWorker {
  public worker: Worker | null = null;
  public busy: boolean = false;
  public lastUsed: number = Date.now();
  public tasksProcessed: number = 0;
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  initialize(): void {
    if (this.worker) return;

    // In a real implementation, this would create an actual Worker
    // pointing to a bundled worker script
    // For now, we'll use a placeholder

    // this.worker = new Worker(new URL('./qrcode.worker.ts', import.meta.url));
    console.log(`Worker ${this.id} initialized (placeholder)`);
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  markUsed(): void {
    this.lastUsed = Date.now();
    this.tasksProcessed++;
  }
}

/**
 * Enhanced Web Worker Pool with dynamic scaling
 */
export class EnhancedWorkerPool {
  private workers: Map<string, ManagedWorker> = new Map();
  private taskQueue: PriorityQueue<WorkerTask> = new PriorityQueue();
  private config: Required<WorkerPoolConfig>;
  private activeWorkers: number = 0;
  private nextWorkerId: number = 0;
  private scalingTimer?: number;
  private tasksCompleted: number = 0;
  private tasksQueued: number = 0;

  constructor(config: WorkerPoolConfig = {}) {
    this.config = {
      minWorkers: config.minWorkers ?? 2,
      maxWorkers: config.maxWorkers ?? (navigator.hardwareConcurrency || 4),
      idleTimeout: config.idleTimeout ?? 60000, // 1 minute
      enableDynamicScaling: config.enableDynamicScaling ?? true,
    };

    this.initialize();
  }

  /**
   * Initialize worker pool
   */
  private initialize(): void {
    // Create minimum number of workers
    for (let i = 0; i < this.config.minWorkers; i++) {
      this.createWorker();
    }

    // Start scaling monitor if enabled
    if (this.config.enableDynamicScaling) {
      this.startScalingMonitor();
    }
  }

  /**
   * Create a new worker
   */
  private createWorker(): ManagedWorker | null {
    if (this.workers.size >= this.config.maxWorkers) {
      return null;
    }

    const id = `worker-${this.nextWorkerId++}`;
    const worker = new ManagedWorker(id);
    worker.initialize();
    this.workers.set(id, worker);

    return worker;
  }

  /**
   * Get an available worker
   */
  private getAvailableWorker(): ManagedWorker | null {
    for (const worker of this.workers.values()) {
      if (!worker.busy && worker.worker) {
        return worker;
      }
    }

    // Try to create a new worker if under max
    if (this.workers.size < this.config.maxWorkers) {
      return this.createWorker();
    }

    return null;
  }

  /**
   * Process a single task
   */
  private async processTask(task: WorkerTask): Promise<void> {
    const worker = this.getAvailableWorker();

    if (!worker || !worker.worker) {
      // Re-queue task
      this.taskQueue.enqueue(task);
      return;
    }

    worker.busy = true;
    this.activeWorkers++;
    const startTime = performance.now();

    try {
      // In real implementation, this would use the actual worker
      // For now, simulate async processing
      const result = await this.simulateWorkerProcessing(task.item);

      worker.markUsed();

      task.resolve({
        ...result,
        processingTime: performance.now() - startTime,
      });

      this.tasksCompleted++;
    } catch (error) {
      task.reject(error as Error);
    } finally {
      worker.busy = false;
      this.activeWorkers--;

      // Process next queued task
      this.processNextTask();
    }
  }

  /**
   * Simulate worker processing (placeholder)
   */
  private async simulateWorkerProcessing(
    item: BatchQRCodeItem
  ): Promise<BatchQRCodeResult> {
    // This would be replaced with actual worker communication
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      id: item.id,
      dataURL: 'data:image/png;base64,...', // Placeholder
    };
  }

  /**
   * Process next task in queue
   */
  private processNextTask(): void {
    if (this.taskQueue.length === 0) {
      return;
    }

    const task = this.taskQueue.dequeue();
    if (task) {
      this.processTask(task);
    }
  }

  /**
   * Add task to queue
   */
  public async execute(item: BatchQRCodeItem): Promise<BatchQRCodeResult> {
    this.tasksQueued++;

    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        item,
        resolve,
        reject,
        priority: item.priority ?? 0,
        queuedAt: Date.now(),
      };

      // Try to process immediately if worker available
      const worker = this.getAvailableWorker();
      if (worker && worker.worker) {
        this.processTask(task);
      } else {
        this.taskQueue.enqueue(task);
      }
    });
  }

  /**
   * Batch execute multiple items
   */
  public async executeBatch(
    items: BatchQRCodeItem[],
    onProgress?: (current: number, total: number) => void
  ): Promise<BatchQRCodeResult[]> {
    const results: BatchQRCodeResult[] = [];
    let completed = 0;

    const promises = items.map(item =>
      this.execute(item).then(result => {
        results.push(result);
        completed++;
        onProgress?.(completed, items.length);
        return result;
      })
    );

    await Promise.all(promises);
    return results;
  }

  /**
   * Start dynamic scaling monitor
   */
  private startScalingMonitor(): void {
    this.scalingTimer = window.setInterval(() => {
      this.scaleWorkers();
      this.cleanupIdleWorkers();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Scale workers based on load
   */
  private scaleWorkers(): void {
    const queueLength = this.taskQueue.length;
    const busyWorkers = this.activeWorkers;
    const totalWorkers = this.workers.size;

    // Scale up if queue is building up
    if (queueLength > totalWorkers * 2 && totalWorkers < this.config.maxWorkers) {
      const workersToAdd = Math.min(
        Math.ceil(queueLength / 5),
        this.config.maxWorkers - totalWorkers
      );

      for (let i = 0; i < workersToAdd; i++) {
        this.createWorker();
      }

      console.log(`Scaled up: added ${workersToAdd} workers`);
    }
  }

  /**
   * Cleanup idle workers
   */
  private cleanupIdleWorkers(): void {
    const now = Date.now();
    const workersToRemove: string[] = [];

    for (const [id, worker] of this.workers.entries()) {
      // Don't remove if below minimum
      if (this.workers.size <= this.config.minWorkers) {
        break;
      }

      // Remove if idle too long and not busy
      if (
        !worker.busy &&
        now - worker.lastUsed > this.config.idleTimeout
      ) {
        workersToRemove.push(id);
      }
    }

    workersToRemove.forEach(id => {
      const worker = this.workers.get(id);
      if (worker) {
        worker.terminate();
        this.workers.delete(id);
      }
    });

    if (workersToRemove.length > 0) {
      console.log(`Cleaned up ${workersToRemove.length} idle workers`);
    }
  }

  /**
   * Get pool statistics
   */
  public getStats() {
    return {
      totalWorkers: this.workers.size,
      activeWorkers: this.activeWorkers,
      queueLength: this.taskQueue.length,
      tasksCompleted: this.tasksCompleted,
      tasksQueued: this.tasksQueued,
      workerDetails: Array.from(this.workers.values()).map(w => ({
        id: w.id,
        busy: w.busy,
        tasksProcessed: w.tasksProcessed,
        lastUsed: w.lastUsed,
      })),
    };
  }

  /**
   * Clear queue
   */
  public clearQueue(): void {
    this.taskQueue.clear();
  }

  /**
   * Terminate all workers
   */
  public terminate(): void {
    if (this.scalingTimer) {
      clearInterval(this.scalingTimer);
    }

    this.workers.forEach(worker => worker.terminate());
    this.workers.clear();
    this.taskQueue.clear();
  }
}

/**
 * Global worker pool instance
 */
export const workerPool = new EnhancedWorkerPool({
  minWorkers: 2,
  maxWorkers: navigator.hardwareConcurrency || 4,
  enableDynamicScaling: true,
});

/**
 * Batch download with enhanced worker pool
 */
export async function batchDownloadEnhanced(options: {
  items: Array<{ content: string; fileName: string; priority?: number }>;
  format?: 'png' | 'jpeg';
  zipFileName?: string;
  style?: any;
  onProgress?: (current: number, total: number) => void;
}): Promise<void> {
  const { items, onProgress } = options;

  const batchItems: BatchQRCodeItem[] = items.map((item, index) => ({
    id: `qr-${index}`,
    config: {
      content: item.content,
      style: options.style,
    },
    priority: item.priority ?? 0,
  }));

  const results = await workerPool.executeBatch(batchItems, onProgress);

  // Download results (implementation would depend on zip library)
  console.log(`Generated ${results.length} QR codes`);
}


