'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface LikeButtonProps {
  workId: string
  initialLikes: number
}

export function LikeButton({ workId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // 检查是否已点赞
    const likedWorks = JSON.parse(localStorage.getItem('likedWorks') || '[]')
    setIsLiked(likedWorks.includes(workId))
  }, [workId])

  const handleLike = async () => {
    if (isLiked) {
      alert('您已经点赞过这个作品了！')
      return
    }

    try {
      // 触发动画
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)

      // 更新数据库
      const { error } = await supabase
        .from('works')
        .update({ likes: likes + 1 })
        .eq('id', workId)

      if (error) throw error

      // 更新本地状态
      setLikes(likes + 1)
      setIsLiked(true)

      // 保存到 localStorage
      const likedWorks = JSON.parse(localStorage.getItem('likedWorks') || '[]')
      likedWorks.push(workId)
      localStorage.setItem('likedWorks', JSON.stringify(likedWorks))
    } catch (error) {
      console.error('点赞失败:', error)
      alert('点赞失败，请重试')
      setIsAnimating(false)
    }
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="lg"
      onClick={handleLike}
      disabled={isLiked}
      className={`gap-2 ${isAnimating ? 'animate-bounce' : ''}`}
    >
      <Heart 
        className={`h-5 w-5 transition-all ${isLiked ? 'fill-current' : ''} ${isAnimating ? 'scale-125' : ''}`}
      />
      <span>{isLiked ? '已点赞' : '点赞'} ({likes})</span>
    </Button>
  )
}

