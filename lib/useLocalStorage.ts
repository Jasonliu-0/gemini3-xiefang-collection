import { useState, useEffect } from 'react'

/**
 * localStorage hook with caching
 * 缓存 localStorage 数据，避免频繁读取
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 使用 lazy initialization 避免每次渲染都读取 localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 更新 localStorage 的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许 value 是一个函数（类似 useState）
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

/**
 * 简单的 localStorage 缓存管理器
 */
class LocalStorageCache {
  private cache: Map<string, { value: string; timestamp: number }>

  constructor() {
    this.cache = new Map()
  }

  get(key: string, maxAge: number = 5000): string | null {
    const cached = this.cache.get(key)

    if (cached) {
      const age = Date.now() - cached.timestamp
      if (age < maxAge) {
        return cached.value
      }
    }

    // 缓存过期或不存在，从 localStorage 读取
    if (typeof window !== 'undefined') {
      try {
        const value = window.localStorage.getItem(key)
        if (value) {
          this.cache.set(key, { value, timestamp: Date.now() })
          return value
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error)
      }
    }

    return null
  }

  set(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, value)
        this.cache.set(key, { value, timestamp: Date.now() })
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    }
  }

  remove(key: string): void {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key)
        this.cache.delete(key)
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

export const localStorageCache = new LocalStorageCache()
