'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

interface FavoriteButtonProps {
  workId: string
}

export function FavoriteButton({ workId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ username?: string } | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    if (user?.username) {
      checkFavoriteStatus(user.username)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId])

  const checkFavoriteStatus = async (username: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('favorites')
        .select('id')
        .eq('work_id', workId)
        .eq('user_name', username)
        .single()

      setIsFavorited(!!data && !error)
    } catch {
      setIsFavorited(false)
    }
  }

  const handleFavorite = async () => {
    if (!currentUser?.username) {
      alert('请先登录后再收藏作品')
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        // 取消收藏
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('favorites')
          .delete()
          .eq('work_id', workId)
          .eq('user_name', currentUser.username)

        if (error) throw error
        setIsFavorited(false)
      } else {
        // 添加收藏
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('favorites')
          .insert({
            work_id: workId,
            user_name: currentUser.username,
          })

        if (error) throw error
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      alert('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <Button
      onClick={handleFavorite}
      disabled={isLoading}
      variant={isFavorited ? 'default' : 'outline'}
      className={`gap-2 transition-all ${
        isFavorited 
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
          : 'border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
      }`}
    >
      <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
      {isFavorited ? '已收藏' : '收藏'}
    </Button>
  )
}

