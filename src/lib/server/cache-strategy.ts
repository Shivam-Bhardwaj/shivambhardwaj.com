type CacheLevel = 'memory' | 'redis' | 'disk';
type CacheTag = string;

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: CacheTag[];
  level?: CacheLevel;
  serialize?: boolean;
  compress?: boolean;
}

interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  tags: CacheTag[];
  hits: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  memoryUsage: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    memoryUsage: 0,
  };
  private maxSize = 1000;
  private maxMemory = 100 * 1024 * 1024; // 100MB

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 300000; // 5 minutes default
    const tags = options.tags || [];
    const serialized = options.serialize ? JSON.stringify(value) : value;
    const size = this.calculateSize(serialized);

    if (this.stats.memoryUsage + size > this.maxMemory) {
      this.evictLRU();
    }

    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      key,
      value: serialized,
      timestamp: Date.now(),
      ttl,
      tags,
      hits: 0,
      size,
    };

    this.cache.set(key, item);
    this.stats.sets++;
    this.stats.size++;
    this.stats.memoryUsage += size;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    item.hits++;
    this.stats.hits++;
    
    return item.value as T;
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.size--;
      this.stats.memoryUsage -= item.size;
      return true;
    }
    return false;
  }

  invalidateTag(tag: CacheTag): number {
    let invalidated = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.memoryUsage = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      const lastAccessed = item.timestamp + (item.hits * 1000); // Factor in hits
      if (lastAccessed < oldestTime) {
        oldestTime = lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private calculateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // Unicode characters are 2 bytes
    }
    if (typeof value === 'number') {
      return 8; // 64-bit number
    }
    if (typeof value === 'boolean') {
      return 4;
    }
    if (value === null || value === undefined) {
      return 0;
    }
    
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 100; // Fallback for non-serializable objects
    }
  }
}

class MultiLevelCache {
  private memoryCache = new MemoryCache();
  private cacheHierarchy: CacheLevel[] = ['memory'];

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get<T>(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // If implementing Redis/disk cache, would try those here
    return null;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const level = options.level || 'memory';
    
    switch (level) {
      case 'memory':
        this.memoryCache.set(key, value, options);
        break;
      // Add other cache levels here
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.memoryCache.delete(key);
  }

  async invalidateTag(tag: CacheTag): Promise<number> {
    return this.memoryCache.invalidateTag(tag);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
  }

  getStats(): CacheStats {
    return this.memoryCache.getStats();
  }

  warmup(keys: Array<{ key: string; generator: () => Promise<any>; options?: CacheOptions }>): Promise<void[]> {
    return Promise.all(
      keys.map(async ({ key, generator, options }) => {
        const exists = this.memoryCache.has(key);
        if (!exists) {
          try {
            const value = await generator();
            await this.set(key, value, options);
          } catch (error) {
            console.warn(`Cache warmup failed for key ${key}:`, error);
          }
        }
      })
    );
  }
}

// Cache strategies for specific use cases
export class ComponentCacheStrategy {
  private cache = new MultiLevelCache();

  async cacheComponent(componentId: string, props: any, result: any): Promise<void> {
    const key = this.generateKey(componentId, props);
    await this.cache.set(key, result, {
      ttl: 600000, // 10 minutes
      tags: [`component:${componentId}`, 'components'],
      level: 'memory',
    });
  }

  async getCachedComponent(componentId: string, props: any): Promise<any> {
    const key = this.generateKey(componentId, props);
    return this.cache.get(key);
  }

  async invalidateComponent(componentId: string): Promise<number> {
    return this.cache.invalidateTag(`component:${componentId}`);
  }

  private generateKey(componentId: string, props: any): string {
    const propsHash = this.hashObject(props);
    return `component:${componentId}:${propsHash}`;
  }

  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 16);
  }
}

export class ContentCacheStrategy {
  private cache = new MultiLevelCache();

  async cacheContent(contentId: string, content: any): Promise<void> {
    await this.cache.set(`content:${contentId}`, content, {
      ttl: 1800000, // 30 minutes
      tags: [`content:${contentId}`, 'content'],
      level: 'memory',
    });
  }

  async getCachedContent(contentId: string): Promise<any> {
    return this.cache.get(`content:${contentId}`);
  }

  async invalidateContent(contentId: string): Promise<number> {
    return this.cache.invalidateTag(`content:${contentId}`);
  }

  async invalidateAllContent(): Promise<number> {
    return this.cache.invalidateTag('content');
  }
}

export const componentCache = new ComponentCacheStrategy();
export const contentCache = new ContentCacheStrategy();
export const globalCache = new MultiLevelCache();