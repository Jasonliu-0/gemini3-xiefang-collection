'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { WorkGrid } from '@/components/work-grid'
import { StatsDashboard } from '@/components/stats-dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, TrendingUp, Eye, Heart, Sparkles, Upload } from 'lucide-react'
import { Work } from '@/types/database'

const HERO_BG_CLASSES = [
  'home-hero-bg-0',
  'home-hero-bg-1',
  'home-hero-bg-2',
  'home-hero-bg-3',
  'home-hero-bg-4',
  'home-hero-bg-5',
  'home-hero-bg-6',
  'home-hero-bg-7',
  'home-hero-bg-8',
  'home-hero-bg-9',
  'home-hero-bg-10',
  'home-hero-bg-11',
]

const SUBTITLE_TEXTS = [
  '撷芳拾翠 · 集珍纳华',
  '汇聚 Gemini 灵感 · 珍藏 AI 佳作',
  '让优秀作品，被更多人看见',
]

export default function HomePage() {
  const [works, setWorks] = useState<Work[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'likes'>('latest')
  const [bgIndex, setBgIndex] = useState(0)
  const [subtitleTyping, setSubtitleTyping] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [subtitleIndex, setSubtitleIndex] = useState(0)
  const [authError, setAuthError] = useState<string | null>(null)

  // 首页背景轮播：几张公路 / 阳光风景之间自动切换
  useEffect(() => {
    if (HERO_BG_CLASSES.length <= 1) return

    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_BG_CLASSES.length)
    }, 12000) // 每 12 秒切换一张

    return () => clearInterval(interval)
  }, [])

  // 标语打字机效果（循环：打字 → 停顿 → 删除 → 停顿）
  useEffect(() => {
    const fullText = SUBTITLE_TEXTS[subtitleIndex]
    const typingSpeed = isDeleting ? 70 : 140
    const pauseAtFull = 1600
    const pauseAtEmpty = 900

    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && subtitleTyping === fullText) {
      // 打完全文后停顿一会再开始删除
      timeout = setTimeout(() => {
        setIsDeleting(true)
      }, pauseAtFull)
    } else if (isDeleting && subtitleTyping === '') {
      // 全部删完后停顿一会再重新开始打
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setSubtitleIndex((prev) => (prev + 1) % SUBTITLE_TEXTS.length)
      }, pauseAtEmpty)
    } else {
      timeout = setTimeout(() => {
        const currentLength = subtitleTyping.length
        const nextText = isDeleting
          ? fullText.slice(0, currentLength - 1)
          : fullText.slice(0, currentLength + 1)

        setSubtitleTyping(nextText)
      }, typingSpeed)
    }

    return () => clearTimeout(timeout)
  }, [subtitleTyping, isDeleting, subtitleIndex])

  // 检查 URL 中的错误参数
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const error = params.get('error')
      if (error) {
        const errorMessages: { [key: string]: string } = {
          'connection_timeout': '连接超时：无法连接到认证服务器，请检查网络连接',
          'network_error': '网络错误：请检查您的网络连接和防火墙设置',
          'auth_failed': '认证失败：登录过程中出现错误',
          'token_failed': '获取令牌失败：请重试',
          'user_failed': '获取用户信息失败：请重试',
          'no_code': '缺少授权码：请重新登录',
          'Client%20authentication%20failed': '客户端认证失败：请检查应用配置',
        }
        setAuthError(errorMessages[error] || `登录失败：${error}`)
        // 3秒后自动清除错误并清理URL
        setTimeout(() => {
          setAuthError(null)
          window.history.replaceState({}, '', window.location.pathname)
        }, 8000)
      }
    }
  }, [])

  const loadWorks = useCallback(async () => {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setWorks(data)
    }
  }, [])

  useEffect(() => {
    loadWorks()
  }, [loadWorks])

  // 使用 useMemo 缓存计算结果
  const popularTags = useMemo(() => {
    const tagCounts: { [key: string]: number } = {}
    
    works.forEach(work => {
      if (work.tags && Array.isArray(work.tags)) {
        work.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [works])

  const filteredWorks = useMemo(() => {
    let filtered = [...works]

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(work =>
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.author?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 标签过滤
    if (selectedTag) {
      filtered = filtered.filter(work =>
        work.tags && work.tags.includes(selectedTag)
      )
    }

    // 排序
    switch (sortBy) {
      case 'views':
        return filtered.sort((a, b) => b.views - a.views)
      case 'likes':
        return filtered.sort((a, b) => b.likes - a.likes)
      case 'latest':
      default:
        return filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }
  }, [works, searchQuery, selectedTag, sortBy])

  const totalViews = useMemo(() => works.reduce((sum, work) => sum + work.views, 0), [works])
  const totalLikes = useMemo(() => works.reduce((sum, work) => sum + work.likes, 0), [works])

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag(prev => prev === tag ? null : tag)
  }, [])

  return (
    <div className={`home-hero-bg ${HERO_BG_CLASSES[bgIndex]} overflow-x-hidden`}>
      <div className="container py-8 md:py-16 max-w-full">
      {/* 错误提示 */}
      {authError && (
        <div className="mb-6 mx-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 text-red-600 mt-0.5">⚠️</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">登录失败</h3>
              <p className="text-sm text-red-700">{authError}</p>
              <p className="text-xs text-red-600 mt-2">提示：如果网络连接正常，请稍后重试或使用 GitHub 登录</p>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* 标题区域 - 诗意设计 */}
      <div className="mb-8 md:mb-16 text-center relative">
        {/* 装饰性边框：由紫色改为青绿渐变 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
        
        <div className="pt-8 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-widest mb-4 gradient-text drop-shadow-[0_10px_28px_rgba(15,23,42,0.95)] font-calligraphy break-words">
            撷芳集
          </h1>
          <div className="text-xs md:text-sm text-emerald-100 mb-4 tracking-widest font-light hero-subtitle">
            GEMINI 3.0
          </div>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-emerald-100 mb-8 font-serif tracking-wide hero-subtitle px-4 break-words">
            {subtitleTyping || SUBTITLE_TEXTS[subtitleIndex]}
            <span className="typewriter-caret" aria-hidden="true"></span>
          </p>
          <p className="text-sm md:text-base text-slate-100/95 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-serif hero-description px-4">
            采撷芬芳如花的优秀作品，拾取翠玉般的精品创作<br className="hidden sm:inline"/>
            汇集成珍贵的作品集，容纳一切华美的 AI 艺术
          </p>
        </div>
        
        {/* 装饰性边框 */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto mb-8 md:mb-12"></div>
        
        {/* 搜索栏 */}
        <div className="max-w-3xl mx-auto px-4 w-full">
          <div className="flex gap-2 md:gap-3 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-gray-500 flex-shrink-0" />
              <Input 
                placeholder="搜索作品..." 
                className="pl-10 md:pl-12 h-11 md:h-14 text-sm md:text-base bg-white/80 backdrop-filter backdrop-blur-xl border-2 border-gray-200 focus:border-blue-400 focus:bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            </div>
            <Button 
              className="h-11 md:h-14 px-4 md:px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 font-serif text-sm md:text-base flex-shrink-0"
            >
              搜索
            </Button>
          </div>
        </div>
      </div>

      {/* 排序和筛选条件显示 */}
      {(selectedTag || searchQuery) && (
        <div className="mb-8 bg-white/15 backdrop-filter backdrop-blur-2xl backdrop-saturate-150 border-2 border-white/50 rounded-xl p-4 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-blue-900">当前筛选：</span>
            {searchQuery && (
              <Badge className="gap-2 bg-blue-600">
                搜索: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-white/80"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedTag && (
              <Badge className="gap-2 bg-emerald-600">
                标签: {selectedTag}
                <button
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-white/80"
                >
                  ×
                </button>
              </Badge>
            )}
            <span className="text-sm text-blue-700 ml-auto">
              找到 {filteredWorks.length} 个作品
            </span>
          </div>
        </div>
      )}

      {/* 热门标签 - 诗意设计 */}
      {popularTags.length > 0 && (
        <div className="mb-12 px-4">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-white/80 backdrop-filter backdrop-blur-xl px-4 md:px-6 py-2 md:py-3 rounded-full shadow-md border border-gray-200">
              <TrendingUp className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />
              <span className="text-sm md:text-base font-semibold text-gray-900 font-serif">热门标签</span>
            </div>
            {selectedTag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="ml-2 md:ml-4 text-xs md:text-sm text-gray-600 font-serif hover:bg-gray-100 mt-2 md:mt-0"
              >
                清除筛选
              </Button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
            {popularTags.map(({ tag, count }) => (
              <Badge
                key={tag}
                className={`cursor-pointer transition-all duration-300 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full border font-serif
                  ${selectedTag === tag 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                    : 'bg-white/70 backdrop-filter backdrop-blur-md text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md hover:scale-105'
                  }`}
                onClick={() => handleTagClick(tag)}
              >
                {tag} <span className="ml-1 md:ml-1.5 opacity-60 text-[10px] md:text-xs">({count})</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 统计信息 + 排序 - 诗意设计 */}
      <div className="mb-8 md:mb-16 px-4">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-8 mb-6 md:mb-8">
          <div className="group relative overflow-hidden rounded-2xl p-5 md:p-8 text-center bg-white/90 backdrop-filter backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300">
            <Sparkles className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-2 md:mb-4 text-blue-600 group-hover:scale-110 transition-all duration-300" />
            <p className="text-3xl md:text-5xl font-bold text-gray-900 mb-1 md:mb-2 font-serif">{works.length}</p>
            <p className="text-xs md:text-base text-gray-600 font-serif tracking-wide">芳华璀璨</p>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl p-5 md:p-8 text-center bg-white/90 backdrop-filter backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-green-300 transition-all duration-300">
            <Eye className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-2 md:mb-4 text-green-600 group-hover:scale-110 transition-all duration-300" />
            <p className="text-3xl md:text-5xl font-bold text-gray-900 mb-1 md:mb-2 font-serif">{totalViews}</p>
            <p className="text-xs md:text-base text-gray-600 font-serif tracking-wide">观者云集</p>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl p-5 md:p-8 text-center bg-white/90 backdrop-filter backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-pink-300 transition-all duration-300">
            <Heart className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-2 md:mb-4 text-pink-600 group-hover:scale-110 group-hover:fill-current transition-all duration-300" />
            <p className="text-3xl md:text-5xl font-bold text-gray-900 mb-1 md:mb-2 font-serif">{totalLikes}</p>
            <p className="text-xs md:text-base text-gray-600 font-serif tracking-wide">倾心之作</p>
          </div>
        </div>
        
        {/* 排序选择 - 单独一行 */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center gap-2 md:gap-4 bg-white/80 backdrop-filter backdrop-blur-xl px-4 md:px-6 py-2 md:py-3 rounded-full border border-gray-200 shadow-md">
            <span className="text-xs md:text-sm text-gray-600 font-serif">排序：</span>
            <div className="flex gap-1 md:gap-2">
              <Button
                variant={sortBy === 'latest' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('latest')}
                className={`rounded-full font-serif px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm transition-all duration-300 ${
                  sortBy === 'latest' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                时新
              </Button>
              <Button
                variant={sortBy === 'views' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('views')}
                className={`rounded-full font-serif px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm transition-all duration-300 ${
                  sortBy === 'views' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                观瞻
              </Button>
              <Button
                variant={sortBy === 'likes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('likes')}
                className={`rounded-full font-serif px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm transition-all duration-300 ${
                  sortBy === 'likes' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                倾心
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 数据统计图表 */}
      {works.length > 0 && (
        <div className="mb-12 px-4">
          <StatsDashboard works={works} />
        </div>
      )}

      {/* 作品网格 */}
      <WorkGrid works={filteredWorks} />

      {/* 空状态 - 诗意设计 */}
      {filteredWorks.length === 0 && works.length > 0 && (
        <div className="text-center py-12 md:py-20 bg-white/80 backdrop-filter backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 mx-4">
          <div className="text-5xl md:text-6xl mb-4 md:mb-6">🌸</div>
          <p className="text-2xl md:text-3xl text-gray-900 mb-2 md:mb-3 font-calligraphy px-4">
            未觅芳踪
          </p>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 font-serif px-4">
            暂无匹配的作品，试试其他筛选条件
          </p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedTag(null)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-serif shadow-md hover:shadow-lg transition-all duration-300 text-sm md:text-base"
          >
            清除筛选
          </Button>
        </div>
      )}

      {works.length === 0 && (
        <div className="text-center py-16 md:py-24 bg-white/80 backdrop-filter backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-lg border border-gray-200 mx-4">
          <Sparkles className="h-16 w-16 md:h-24 md:w-24 mx-auto mb-6 md:mb-8 text-blue-600" />
          <p className="text-3xl md:text-4xl text-gray-900 mb-3 md:mb-4 font-calligraphy px-4">
            待君撷芳
          </p>
          <p className="text-base md:text-lg text-gray-700 mb-8 md:mb-10 max-w-md mx-auto leading-relaxed font-serif px-4">
            此处尚无佳作，期待您的优秀创作<br/>
            成为撷芳集的第一缕芬芳
          </p>
          <Link href="/upload">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-10 py-4 md:py-6 text-base md:text-lg shadow-lg hover:shadow-xl font-serif hover:scale-105 transition-all duration-300">
              <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              珍藏作品
            </Button>
          </Link>
        </div>
      )}
      </div>
    </div>
  )
}
