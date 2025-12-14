import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart } from '@/lib/icons'
import { Work } from '@/types/database'
import { formatNumber, formatDate } from '@/lib/utils'
import { memo, useState, useEffect, useRef } from 'react'

interface WorkCardProps {
  work: Work
}

export const WorkCard = memo(function WorkCard({ work }: WorkCardProps) {
  const [isInView, setIsInView] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection Observer 懒加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            // 一旦进入视口就停止观察
            if (cardRef.current) {
              observer.unobserve(cardRef.current)
            }
          }
        })
      },
      {
        rootMargin: '100px', // 提前 100px 开始加载
        threshold: 0.1,
      }
    )

    const currentRef = cardRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  // 兼容旧格式：[CODE-HTML]-data:... 和新格式：data:...
  const cleanSourceUrl = work.source_code_url && work.source_code_url.includes('[CODE-')
    ? work.source_code_url.substring(work.source_code_url.indexOf('data:'))
    : work.source_code_url

  // 检查是否有 HTML/SVG data URL 可以预览
  const hasCodePreview = cleanSourceUrl && cleanSourceUrl.startsWith('data:')
  const isHtmlCode = hasCodePreview && cleanSourceUrl.includes('data:text/html')

  // 安全解码 HTML 内容（只在需要时解码）
  const getHtmlContent = () => {
    if (!isHtmlCode || !cleanSourceUrl || !isInView) return ''
    try {
      const base64Data = cleanSourceUrl.split(',')[1]
      return decodeURIComponent(escape(atob(base64Data)))
    } catch (error) {
      console.error('Failed to decode HTML:', error)
      return ''
    }
  }

  const htmlContent = getHtmlContent()

  return (
    <Link href={`/works/${work.id}`}>
      <Card ref={cardRef} className="glass-card group overflow-hidden relative transform-gpu bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800">
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 group-hover:from-blue-100 group-hover:to-gray-100 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600 transition-all duration-300">
          {/* 装饰性渐变层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-transparent"></div>
          {work.thumbnail ? (
            <Image
              src={work.thumbnail}
              alt={work.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4="
            />
          ) : isInView && htmlContent ? (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full pointer-events-none"
              sandbox="allow-scripts"
              title={work.title}
            />
          ) : isInView && work.url ? (
            <iframe
              src={work.url}
              className="w-full h-full pointer-events-none"
              sandbox="allow-scripts allow-same-origin"
              title={work.title}
            />
          ) : !isInView ? (
            <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              暂无预览
            </div>
          )}
        </div>
        <CardContent className="relative z-20 p-4 md:p-6 bg-white/90 dark:bg-gray-800/90">
          <h3 className="font-bold text-lg md:text-xl line-clamp-2 mb-2 md:mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-all duration-300 font-serif">
            {work.title}
          </h3>
          {work.description && (
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 md:mb-4 leading-relaxed font-serif">
              {work.description}
            </p>
          )}
          {work.tags && work.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {work.tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag} 
                  className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white hover:scale-105 transition-all duration-200 rounded-full font-serif"
                >
                  {tag}
                </Badge>
              ))}
              {work.tags.length > 3 && (
                <Badge className="text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-full">
                  +{work.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="relative z-20 px-4 md:px-6 pb-4 md:pb-6 pt-3 md:pt-4 flex flex-col gap-2 text-xs md:text-sm bg-gray-50/90 dark:bg-gray-800/90 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between w-full font-serif">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="flex items-center gap-1 md:gap-1.5 text-blue-600 dark:text-blue-400">
                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-gray-700 dark:text-gray-300">{formatNumber(work.views)}</span>
              </span>
              <span className="flex items-center gap-1 md:gap-1.5 text-pink-600 dark:text-pink-400">
                <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-gray-700 dark:text-gray-300">{formatNumber(work.likes)}</span>
              </span>
            </div>
            <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-serif">
              {formatDate(work.created_at)}
            </span>
          </div>
          {work.author && (
            <div className="w-full">
              <Link 
                href={`/user/${encodeURIComponent(work.author)}`}
                className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 hover:underline font-serif"
                onClick={(e) => e.stopPropagation()}
              >
                作者：{work.author}
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
})

