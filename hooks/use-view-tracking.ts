import { useCallback, useEffect, useRef } from 'react'

interface ViewTrackingOptions {
  batchSize?: number
  flushInterval?: number
}

export function useViewTracking({
  batchSize = 10,
  flushInterval = 30000 // 30秒
}: ViewTrackingOptions = {}) {
  const viewedWorksRef = useRef<Set<string>>(new Set())
  const pendingViewsRef = useRef<string[]>([])
  const flushTimerRef = useRef<NodeJS.Timeout>()

  // 添加浏览记录
  const trackView = useCallback((workId: string) => {
    // 防止重复记录
    if (viewedWorksRef.current.has(workId)) {
      return
    }

    viewedWorksRef.current.add(workId)
    pendingViewsRef.current.push(workId)

    // 达到批量大小时立即发送
    if (pendingViewsRef.current.length >= batchSize) {
      flushViews()
    }
  }, [batchSize])

  // 发送浏览量到服务器
  const flushViews = useCallback(async () => {
    if (pendingViewsRef.current.length === 0) return

    const worksToTrack = [...pendingViewsRef.current]
    pendingViewsRef.current = []

    try {
      // 使用 sendBeacon API 确保在页面关闭时也能发送
      if (navigator.sendBeacon) {
        const data = new FormData()
        data.append('works', JSON.stringify(worksToTrack))
        navigator.sendBeacon('/api/views/batch', data)
      } else {
        // 降级到 fetch
        await fetch('/api/views/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ works: worksToTrack }),
          keepalive: true
        })
      }
    } catch (error) {
      console.error('批量更新浏览量失败:', error)
      // 将失败的浏览记录放回队列
      pendingViewsRef.current.unshift(...worksToTrack)
    }
  }, [])

  // 设置定时器，定期发送浏览量
  useEffect(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current)
    }

    flushTimerRef.current = setInterval(() => {
      flushViews()
    }, flushInterval)

    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current)
      }
    }
  }, [flushInterval, flushViews])

  // 页面卸载时发送剩余的浏览量
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushViews()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
      flushViews() // 组件卸载时也要发送
    }
  }, [flushViews])

  // 从 localStorage 恢复未发送的浏览记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pendingViews')
      if (saved) {
        const views = JSON.parse(saved)
        if (Array.isArray(views)) {
          pendingViewsRef.current = views
        }
        localStorage.removeItem('pendingViews')
      }
    } catch (error) {
      console.error('恢复浏览记录失败:', error)
    }
  }, [])

  // 定期将未发送的浏览记录保存到 localStorage
  useEffect(() => {
    const saveToLocalStorage = () => {
      if (pendingViewsRef.current.length > 0) {
        try {
          localStorage.setItem('pendingViews', JSON.stringify(pendingViewsRef.current))
        } catch (error) {
          console.error('保存浏览记录失败:', error)
        }
      }
    }

    const timer = setInterval(saveToLocalStorage, 10000) // 每10秒保存一次

    return () => {
      clearInterval(timer)
      saveToLocalStorage()
    }
  }, [])

  return {
    trackView,
    flushViews,
    viewedCount: viewedWorksRef.current.size,
    pendingCount: pendingViewsRef.current.length
  }
}