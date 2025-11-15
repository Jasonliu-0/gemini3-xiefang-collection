import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Heart } from 'lucide-react'
import { Work } from '@/types/database'
import { formatNumber, formatDate } from '@/lib/utils'
import { memo } from 'react'

interface WorkCardProps {
  work: Work
}

export const WorkCard = memo(function WorkCard({ work }: WorkCardProps) {
  // 兼容旧格式：[CODE-HTML]-data:... 和新格式：data:...
  const cleanSourceUrl = work.source_code_url && work.source_code_url.includes('[CODE-') 
    ? work.source_code_url.substring(work.source_code_url.indexOf('data:'))
    : work.source_code_url
  
  // 检查是否有 HTML/SVG data URL 可以预览
  const hasCodePreview = cleanSourceUrl && cleanSourceUrl.startsWith('data:')
  const isHtmlCode = hasCodePreview && cleanSourceUrl.includes('data:text/html')
  
  // 安全解码 HTML 内容
  const getHtmlContent = () => {
    if (!isHtmlCode || !cleanSourceUrl) return ''
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
      <Card className="glass-card group overflow-hidden relative transform-gpu bg-white/90 hover:bg-white">
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50 group-hover:from-blue-100 group-hover:to-gray-100 transition-all duration-300">
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
          ) : htmlContent ? (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full pointer-events-none"
              sandbox="allow-scripts"
              title={work.title}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              暂无预览
            </div>
          )}
        </div>
        <CardContent className="relative z-20 p-6 bg-white/80 backdrop-filter backdrop-blur-xl">
          <h3 className="font-bold text-xl line-clamp-2 mb-3 text-gray-900 group-hover:text-blue-700 transition-all duration-300 font-serif">
            {work.title}
          </h3>
          {work.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed font-serif">
              {work.description}
            </p>
          )}
          {work.tags && work.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag} 
                  className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:scale-105 transition-all duration-200 rounded-full font-serif"
                >
                  {tag}
                </Badge>
              ))}
              {work.tags.length > 3 && (
                <Badge className="text-xs px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full">
                  +{work.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="relative z-20 px-6 pb-6 pt-4 flex items-center justify-between text-sm bg-gradient-to-b from-white/10 to-white/20 backdrop-blur-xl border-t border-white/30">
          <div className="flex items-center gap-4 font-serif">
            <span className="flex items-center gap-1.5 text-blue-600">
              <Eye className="h-4 w-4" />
              <span className="text-gray-700">{formatNumber(work.views)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-pink-600">
              <Heart className="h-4 w-4" />
              <span className="text-gray-700">{formatNumber(work.likes)}</span>
            </span>
          </div>
          <span className="text-xs text-gray-500 font-serif">
            {formatDate(work.created_at)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
})

