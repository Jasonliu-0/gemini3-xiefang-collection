import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Work } from '@/types/database'

interface UseInfiniteScrollOptions {
  initialLimit?: number
  pageSize?: number
  filters?: {
    search?: string
    tag?: string | null
    sortBy?: 'latest' | 'views' | 'likes'
  }
}

interface UseInfiniteScrollReturn {
  works: Work[]
  loading: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => Promise<void>
  reset: () => void
  totalCount: number
}

export function useInfiniteScroll({
  initialLimit = 12,
  pageSize = 12,
  filters = {}
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const isLoadingRef = useRef(false)

  // 序列化 filters 用于依赖比较
  const filtersKey = JSON.stringify(filters)

  // 加载数据函数
  const loadData = useCallback(async (reset: boolean = false) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    
    setLoading(true)
    setError(null)

    try {
      const currentOffset = reset ? 0 : offset
      
      // 构建查询
      let query = supabase
        .from('works')
        .select('*', { count: 'exact' })
        .eq('is_approved', true)

      // 搜索过滤
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,author.ilike.%${filters.search}%`)
      }

      // 标签过滤
      if (filters.tag) {
        query = query.contains('tags', [filters.tag])
      }

      // 排序
      switch (filters.sortBy) {
        case 'views':
          query = query.order('views', { ascending: false })
          break
        case 'likes':
          query = query.order('likes', { ascending: false })
          break
        case 'latest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      // 分页
      const limit = reset ? initialLimit : pageSize
      query = query.range(currentOffset, currentOffset + limit - 1)

      const { data, error: queryError, count } = await query

      if (queryError) {
        throw new Error(queryError.message || '数据库查询失败')
      }

      if (data && Array.isArray(data)) {
        if (reset) {
          setWorks(data as Work[])
          setOffset(data.length)
        } else {
          setWorks(prev => [...prev, ...data as Work[]])
          setOffset(prev => prev + data.length)
        }
        
        setTotalCount(count || 0)
        setHasMore(data.length === limit)
      }
    } catch (err) {
      console.error('加载作品失败:', err)
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [offset, initialLimit, pageSize, filters.search, filters.tag, filters.sortBy])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await loadData(false)
  }, [hasMore, loading, loadData])

  const reset = useCallback(() => {
    setWorks([])
    setOffset(0)
    setHasMore(true)
    setError(null)
  }, [])

  // 当 filters 变化时重置并重新加载
  useEffect(() => {
    reset()
    loadData(true)
  }, [filtersKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    works,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    totalCount
  }
}

// 无限滚动检测 Hook - 保留但不再使用
export function useIntersectionObserver(
  targetRef: React.RefObject<Element>,
  callback: () => void,
  enabled: boolean = true
) {
  // 空实现，不再需要
}