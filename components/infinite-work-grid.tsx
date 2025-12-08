import { forwardRef, useRef, useEffect } from 'react'
import { Work } from '@/types/database'
import { WorkCard } from './work-card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import { useIntersectionObserver } from '@/hooks/use-infinite-scroll'

interface InfiniteWorkGridProps {
  works: Work[]
  loading: boolean
  hasMore: boolean
  error: string | null
  onLoadMore: () => void
  totalCount: number
}

export const InfiniteWorkGrid = forwardRef<HTMLDivElement, InfiniteWorkGridProps>(
  function InfiniteWorkGrid({ works, loading, hasMore, error, onLoadMore, totalCount }, ref) {
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // 使用 Intersection Observer 自动加载更多
    useIntersectionObserver(
      loadMoreRef,
      () => {
        if (!loading && hasMore && !error) {
          onLoadMore()
        }
      },
      hasMore && !loading && !error
    )

    // 空状态
    if (works.length === 0 && !loading) {
      return (
        <div className="text-center py-16 md:py-24 bg-white/80 dark:bg-gray-800/80 backdrop-filter backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 mx-4">
          <div className="text-5xl md:text-6xl mb-4 md:mb-6">🌸</div>
          <p className="text-2xl md:text-3xl text-gray-900 dark:text-gray-100 mb-2 md:mb-3 font-calligraphy">
            未觅芳踪
          </p>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
            暂无匹配的作品
          </p>
        </div>
      )
    }

    return (
      <div ref={ref} className="space-y-8">
        {/* 作品统计 */}
        {totalCount > 0 && (
          <div className="text-center px-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              显示 {works.length} / {totalCount} 个作品
            </p>
          </div>
        )}

        {/* 作品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>

        {/* 加载状态 */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>加载中...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <Button
                onClick={onLoadMore}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                重试
              </Button>
            </div>
          )}

          {!hasMore && works.length > 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              已加载全部作品
            </p>
          )}
        </div>
      </div>
    )
  }
)