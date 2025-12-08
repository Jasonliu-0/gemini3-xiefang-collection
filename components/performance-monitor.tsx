'use client'

import { useEffect } from 'react'
import { reportPerformanceMetrics } from '@/lib/performance'

export function PerformanceMonitor() {
  useEffect(() => {
    // 只在生产环境或开发环境的监控下运行
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true') {
      reportPerformanceMetrics()
    }
  }, [])

  return null // 这是一个无UI的组件，仅用于性能监控
}