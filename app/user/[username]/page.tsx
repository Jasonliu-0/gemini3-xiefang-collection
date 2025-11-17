'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Work } from '@/types/database'
import { WorkGrid } from '@/components/work-grid'
import { Card, CardContent } from '@/components/ui/card'
import { User, Eye, Heart, Calendar, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserWorks = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('works')
        .select('*')
        .eq('author', decodeURIComponent(username))
        .order('created_at', { ascending: false })

      if (!error && data) {
        setWorks(data)
      }
    } catch (error) {
      console.error('加载用户作品失败:', error)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    loadUserWorks()
  }, [loadUserWorks])


  const totalViews = works.reduce((sum, work) => sum + work.views, 0)
  const totalLikes = works.reduce((sum, work) => sum + work.likes, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container py-8 px-4">
        {/* 用户信息卡片 */}
        <Card className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* 用户头像 */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* 用户信息 */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-calligraphy">
                  {decodeURIComponent(username)}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4 font-serif">
                  Gemini 3.0 撷芳集创作者
                </p>

                {/* 统计数据 */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="font-bold text-gray-900 dark:text-gray-100">{works.length}</strong> 个作品
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="font-bold text-gray-900 dark:text-gray-100">{totalViews}</strong> 次浏览
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="font-bold text-gray-900 dark:text-gray-100">{totalLikes}</strong> 个点赞
                    </span>
                  </div>
                  {works.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        加入于 {new Date(works[works.length - 1].created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 返回按钮 */}
              <div className="flex-shrink-0">
                <Link href="/">
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600">
                    返回首页
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 作品列表 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-serif">
            {decodeURIComponent(username)} 的作品 ({works.length})
          </h2>
        </div>

        {works.length > 0 ? (
          <WorkGrid works={works} />
        ) : (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700">
            <CardContent className="py-20 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                该用户还没有上传作品
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

