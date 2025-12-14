/**
 * 性能优化工具函数
 */

/**
 * 节流函数 - 限制函数执行频率
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    const remaining = delay - (now - lastCall)

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastCall = now
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      func.apply(this as any, args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        func.apply(this as any, args)
      }, remaining)
    }
  }
}

/**
 * 防抖函数 - 延迟执行函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      func.apply(this as any, args)
    }, delay)
  }
}

/**
 * requestIdleCallback 的 polyfill
 * 在浏览器空闲时执行任务
 */
export function scheduleIdleTask(callback: () => void, timeout = 2000): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout })
  } else {
    // 降级到 setTimeout
    return setTimeout(callback, 1) as unknown as number
  }
}

/**
 * 取消 idle 任务
 */
export function cancelIdleTask(id: number) {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * 批处理更新 - 将多个状态更新合并
 * @param updates 更新函数数组
 */
export function batchUpdates(updates: Array<() => void>) {
  // React 18+ 会自动批处理
  if (typeof window !== 'undefined') {
    updates.forEach(update => update())
  }
}

/**
 * 优化的 IntersectionObserver 配置
 */
export const optimizedObserverOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '50px', // 提前 50px 开始观察
  threshold: 0.01, // 只需要 1% 可见即触发
}
