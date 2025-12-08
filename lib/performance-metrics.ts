/**
 * 性能指标收集和报告工具
 */

export interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
  tti: number | null // Time to Interactive
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    tti: null
  }

  constructor() {
    if (typeof window === 'undefined') return
    this.observePerformance()
  }

  private observePerformance() {
    // 监控 LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

        // 监控 FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ type: 'first-input', buffered: true })

        // 监控 CLS
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              this.metrics.cls = clsValue
            }
          })
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })
      } catch (e) {
        console.warn('Performance Observer not fully supported:', e)
      }
    }

    // 监控 FCP 和 TTFB
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime
        }
      })

      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming
        this.metrics.ttfb = nav.responseStart - nav.requestStart
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  logMetrics() {
    const metrics = this.getMetrics()
    console.group('📊 性能指标')
    console.log('🎨 FCP (首次内容绘制):', metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : '未测量')
    console.log('🖼️  LCP (最大内容绘制):', metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : '未测量')
    console.log('👆 FID (首次输入延迟):', metrics.fid ? `${metrics.fid.toFixed(2)}ms` : '未测量')
    console.log('📐 CLS (累积布局偏移):', metrics.cls !== null ? metrics.cls.toFixed(4) : '未测量')
    console.log('⚡ TTFB (首字节时间):', metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : '未测量')
    console.groupEnd()

    // 性能评分
    this.evaluatePerformance(metrics)
  }

  private evaluatePerformance(metrics: PerformanceMetrics) {
    console.group('🎯 性能评估')
    
    // LCP 评分 (好: <2.5s, 需改进: 2.5-4s, 差: >4s)
    if (metrics.lcp) {
      const lcpScore = metrics.lcp < 2500 ? '✅ 良好' : metrics.lcp < 4000 ? '⚠️ 需改进' : '❌ 差'
      console.log(`LCP: ${lcpScore} (${(metrics.lcp / 1000).toFixed(2)}s)`)
    }

    // FID 评分 (好: <100ms, 需改进: 100-300ms, 差: >300ms)
    if (metrics.fid) {
      const fidScore = metrics.fid < 100 ? '✅ 良好' : metrics.fid < 300 ? '⚠️ 需改进' : '❌ 差'
      console.log(`FID: ${fidScore} (${metrics.fid.toFixed(2)}ms)`)
    }

    // CLS 评分 (好: <0.1, 需改进: 0.1-0.25, 差: >0.25)
    if (metrics.cls !== null) {
      const clsScore = metrics.cls < 0.1 ? '✅ 良好' : metrics.cls < 0.25 ? '⚠️ 需改进' : '❌ 差'
      console.log(`CLS: ${clsScore} (${metrics.cls.toFixed(4)})`)
    }

    console.groupEnd()
  }

  // 发送到分析服务（可选）
  async sendToAnalytics(endpoint?: string) {
    if (!endpoint) return
    
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.getMetrics())
      })
    } catch (error) {
      console.error('Failed to send metrics:', error)
    }
  }
}

// 全局实例
let performanceMonitor: PerformanceMonitor | null = null

export function initPerformanceMonitor() {
  if (typeof window === 'undefined') return null
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
    
    // 页面加载完成后3秒打印指标
    setTimeout(() => {
      performanceMonitor?.logMetrics()
    }, 3000)
  }
  return performanceMonitor
}

export function getPerformanceMonitor() {
  return performanceMonitor
}