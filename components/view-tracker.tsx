'use client'

import { useEffect } from 'react'
import { useViewTracking } from '@/hooks/use-view-tracking'

interface ViewTrackerProps {
  workId: string
  trackOnMount?: boolean
}

export function ViewTracker({ workId, trackOnMount = true }: ViewTrackerProps) {
  const { trackView } = useViewTracking()

  useEffect(() => {
    if (trackOnMount && workId) {
      // 延迟一点时间再跟踪，确保不是机器人访问
      const timer = setTimeout(() => {
        trackView(workId)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [workId, trackOnMount, trackView])

  return null // 这是一个无UI的组件，仅用于跟踪浏览量
}