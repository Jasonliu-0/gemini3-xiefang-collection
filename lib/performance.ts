// 性能监控工具
interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

interface PerformanceReport {
  lcp: PerformanceMetric // Largest Contentful Paint
  fid: PerformanceMetric // First Input Delay
  cls: PerformanceMetric // Cumulative Layout Shift
  fcp: PerformanceMetric // First Contentful Paint
  ttfb: PerformanceMetric // Time to First Byte
}

// 性能阈值配置
const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 }, // ms
  fid: { good: 100, poor: 300 },   // ms
  cls: { good: 0.1, poor: 0.25 },   // score
  fcp: { good: 1800, poor: 3000 },  // ms
  ttfb: { good: 800, poor: 1800 },  // ms
}

export function getRating(value: number, metric: keyof typeof PERFORMANCE_THRESHOLDS): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[metric]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// 获取性能指标
export function getPerformanceMetrics(): PerformanceReport {
  // 使用 Navigation Timing API
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  const metrics: PerformanceReport = {
    lcp: { name: 'LCP', value: 0, rating: 'good' },
    fid: { name: 'FID', value: 0, rating: 'good' },
    cls: { name: 'CLS', value: 0, rating: 'good' },
    fcp: { name: 'FCP', value: 0, rating: 'good' },
    ttfb: { name: 'TTFB', value: 0, rating: 'good' },
  }

  // Time to First Byte
  if (navigation) {
    metrics.ttfb.value = Math.round(navigation.responseStart - navigation.requestStart)
    metrics.ttfb.rating = getRating(metrics.ttfb.value, 'ttfb')
  }

  // First Contentful Paint
  const paintEntries = performance.getEntriesByType('paint')
  const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
  if (fcpEntry) {
    metrics.fcp.value = Math.round(fcpEntry.startTime)
    metrics.fcp.rating = getRating(metrics.fcp.value, 'fcp')
  }

  // Largest Contentful Paint (需要等页面完全加载后)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        metrics.lcp.value = Math.round(lastEntry.startTime)
        metrics.lcp.rating = getRating(metrics.lcp.value, 'lcp')
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP observation not supported:', e)
    }
  }

  // Cumulative Layout Shift
  try {
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      metrics.cls.value = Math.round(clsValue * 1000) / 1000
      metrics.cls.rating = getRating(metrics.cls.value, 'cls')
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    console.warn('CLS observation not supported:', e)
  }

  // First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.fid.value = Math.round((entry as any).processingStart - entry.startTime)
        metrics.fid.rating = getRating(metrics.fid.value, 'fid')
        break // 只需要第一次交互
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
  } catch (e) {
    console.warn('FID observation not supported:', e)
  }

  return metrics
}

// 发送性能数据到分析服务
export function reportPerformanceMetrics() {
  setTimeout(() => {
    const metrics = getPerformanceMetrics()

    // 开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics')
      Object.entries(metrics).forEach(([key, metric]) => {
        const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
        console.log(`${emoji} ${metric.name}: ${metric.value}ms (${metric.rating})`)
      })
      console.groupEnd()
    }

    // 生产环境发送到分析服务 (Google Analytics, etc.)
    if (process.env.NODE_ENV === 'production' && 'gtag' in window) {
      Object.entries(metrics).forEach(([key, metric]) => {
        (window as any).gtag('event', metric.name, {
          value: metric.value,
          event_category: 'Web Vitals',
          event_label: metric.rating,
          non_interaction: true,
        })
      })
    }
  }, 3000) // 等待3秒让性能指标稳定
}

// 页面加载性能计时器
export class PerformanceTimer {
  private startTime: number = 0
  private mark: string

  constructor(mark: string) {
    this.mark = mark
    this.start()
  }

  start() {
    this.startTime = performance.now()
  }

  end(): number {
    const duration = Math.round(performance.now() - this.startTime)

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${this.mark}: ${duration}ms`)
    }

    return duration
  }

  endAndReport() {
    const duration = this.end()

    // 发送到分析服务
    if ('gtag' in window) {
      (window as any).gtag('event', this.mark, {
        value: duration,
        event_category: 'Custom Timing',
        non_interaction: true,
      })
    }

    return duration
  }
}

// 使用示例的 React Hook
export function usePerformanceTimer(mark: string) {
  return () => {
    const timer = new PerformanceTimer(mark)
    return () => timer.endAndReport()
  }
}