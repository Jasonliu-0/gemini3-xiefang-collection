// API 响应缓存系统

interface CacheOptions {
  ttl?: number // 生存时间（秒）
  key?: string // 缓存键
  tags?: string[] // 缓存标签
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private timers = new Map<string, NodeJS.Timeout>()

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 300 // 默认5分钟
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags: options.tags || []
    }

    // 清除旧的定时器
    const oldTimer = this.timers.get(key)
    if (oldTimer) {
      clearTimeout(oldTimer)
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl * 1000)

    this.cache.set(key, entry)
    this.timers.set(key, timer)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
    return deleted
  }

  invalidateByTag(tag: string): void {
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.delete(key))
  }

  clear(): void {
    this.cache.clear()
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }

  size(): number {
    return this.cache.size
  }

  // 获取缓存统计信息
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 全局缓存实例
const memoryCache = new MemoryCache()

// 缓存装饰器函数
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): T {
  return (async (...args: any[]): Promise<any> => {
    const cacheKey = options.key || `${fn.name}_${JSON.stringify(args)}`

    // 尝试从缓存获取
    const cached = memoryCache.get(cacheKey)
    if (cached !== null) {
      return cached
    }

    // 执行函数
    const result = await fn(...args)

    // 存入缓存
    memoryCache.set(cacheKey, result, options)

    return result
  }) as T
}

// 创建缓存键的辅助函数
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|')

  return `${prefix}:${sortedParams}`
}

// 缓存管理函数
export const cache = {
  get: <T>(key: string) => memoryCache.get<T>(key),
  set: <T>(key: string, data: T, options?: CacheOptions) => memoryCache.set(key, data, options),
  delete: (key: string) => memoryCache.delete(key),
  invalidateByTag: (tag: string) => memoryCache.invalidateByTag(tag),
  clear: () => memoryCache.clear(),
  getStats: () => memoryCache.getStats()
}

// Supabase 查询缓存包装器
export async function cachedSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any; count?: number | null }>,
  options: CacheOptions = {}
): Promise<{ data: T | null; error: any; count?: number | null }> {
  const cacheKey = options.key || `supabase_${Date.now()}_${Math.random()}`

  // 尝试从缓存获取
  const cached = memoryCache.get<{ data: T | null; error: any; count?: number | null }>(cacheKey)
  if (cached !== null) {
    return cached
  }

  // 执行查询
  const result = await queryFn()

  // 如果没有错误且有数据，则缓存结果
  if (!result.error && result.data !== null) {
    memoryCache.set(cacheKey, result, options)
  }

  return result
}

// 预定义的缓存配置
export const CACHE_CONFIG = {
  WORKS_LIST: { ttl: 300, tags: ['works'] }, // 5分钟
  WORK_DETAIL: { ttl: 600, tags: ['work'] }, // 10分钟
  POPULAR_TAGS: { ttl: 1800, tags: ['tags'] }, // 30分钟
  USER_STATS: { ttl: 900, tags: ['stats'] }, // 15分钟
  COMMENTS: { ttl: 120, tags: ['comments'] } // 2分钟
}

// 缓存失效函数
export function invalidateWorkCache(workId?: string) {
  if (workId) {
    cache.invalidateByTag(`work:${workId}`)
  }
  cache.invalidateByTag('works')
  cache.invalidateByTag('stats')
}

export function invalidateCommentCache(workId?: string) {
  cache.invalidateByTag('comments')
  if (workId) {
    cache.invalidateByTag(`work:${workId}`)
  }
}