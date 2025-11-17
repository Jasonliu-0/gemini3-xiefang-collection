'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Work } from '@/types/database'
import { WorkGrid } from '@/components/work-grid'
import { Card, CardContent } from '@/components/ui/card'
import { Star, LogIn } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FavoritesPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ username?: string } | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    
    if (user?.username) {
      loadFavorites(user.username)
    } else {
      setLoading(false)
    }
  }, [])

  const loadFavorites = async (username: string) => {
    try {
      // 先获取用户的收藏记录
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: favorites, error: favError } = await (supabase as any)
        .from('favorites')
        .select('work_id')
        .eq('user_name', username)

      if (favError) throw favError

      if (favorites && favorites.length > 0) {
        const workIds = favorites.map((f: { work_id: string }) => f.work_id)

        // 获取收藏的作品详情
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: worksData, error: worksError } = await (supabase as any)
          .from('works')
          .select('*')
          .in('id', workIds)
          .order('created_at', { ascending: false })

        if (worksError) throw worksError
        setWorks(worksData || [])
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">查看我的收藏</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              请先登录后查看您收藏的作品。
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <LogIn className="h-4 w-4" />
                前往登录
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container py-8 px-4">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-filter backdrop-blur-xl px-6 py-3 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
            <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 fill-current" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-calligraphy">
              我的收藏
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 font-serif">
            共收藏了 {works.length} 个作品
          </p>
        </div>

        {/* 作品列表 */}
        {works.length > 0 ? (
          <WorkGrid works={works} />
        ) : (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700">
            <CardContent className="py-20 text-center">
              <Star className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                还没有收藏任何作品
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  去浏览作品
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

