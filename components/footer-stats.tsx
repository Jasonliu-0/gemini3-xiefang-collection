'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function FooterStats() {
  const [stats, setStats] = useState({
    totalWorks: 0,
    totalViews: 0,
    totalLikes: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('works')
        .select('views, likes')
        .eq('is_approved', true)

      if (data) {
        const totalWorks = data.length
        const totalViews = data.reduce((sum: number, w: { views?: number }) => sum + (w.views ?? 0), 0)
        const totalLikes = data.reduce((sum: number, w: { likes?: number }) => sum + (w.likes ?? 0), 0)
        
        setStats({ totalWorks, totalViews, totalLikes })
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  return (
    <div className="flex justify-center md:justify-start">
      <div className="w-full max-w-sm rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-sky-100 dark:border-sky-900/50 shadow-md px-5 md:px-6 py-4 md:py-5 text-left space-y-3 md:space-y-4">
        <p className="text-xs font-semibold tracking-[0.2em] text-sky-600 dark:text-sky-400 uppercase">
          数据一瞥
        </p>
        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-serif">
          用数字记录每一次灵感的闪光。
        </p>
        <div className="grid grid-cols-3 gap-3 md:gap-4 text-sm font-serif">
          <div>
            <p className="text-base md:text-xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalWorks}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">作品收录</p>
          </div>
          <div>
            <p className="text-base md:text-xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalViews.toLocaleString('zh-CN')}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">累计浏览</p>
          </div>
          <div>
            <p className="text-base md:text-xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalLikes.toLocaleString('zh-CN')}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">获得点赞</p>
          </div>
        </div>
      </div>
    </div>
  )
}

