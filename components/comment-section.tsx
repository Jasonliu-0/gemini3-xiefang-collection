'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Rating } from '@/components/rating'
import { Comment } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { User } from 'lucide-react'
import Image from 'next/image'

const EMOJI_PICKER = ['😀', '😂', '🥰', '👍', '🎉', '✨', '🔥', '🤔', '😢', '❤️']

interface CommentSectionProps {
  workId: string
  comments: Comment[]
}

const PAGE_SIZE = 5

export function CommentSection({ workId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(PAGE_SIZE, initialComments.length)
  )
  const [userName, setUserName] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name?: string; username?: string; avatar_url?: string; provider?: string } | null>(null)
  const contentRef = useRef<HTMLTextAreaElement | null>(null)
  
  useEffect(() => {
    // 检查是否已登录
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('linuxdo_user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setCurrentUser(user)
          setUserName(user.name || user.username)
        } catch (error) {
          console.error('Failed to parse user:', error)
        }
      }
    }
  }, [])
  
  // 生成用户头像颜色
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ]
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }
  const handleAddEmoji = (emoji: string) => {
    setContent((prev) => (prev || '') + emoji)
    if (contentRef.current) {
      contentRef.current.focus()
    }
  }

  
  // 获取用户名首字母
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }
  
  // 获取登录来源标签
  const getProviderLabel = (provider?: string) => {
    if (provider === 'github') return '来自 GitHub'
    if (provider === 'linuxdo') return '来自 Linux DO'
    return '来自撷芳集'
  }

  // 格式化相对时间
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    return formatDate(dateString)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userName.trim() || !content.trim()) {
      alert('请填写完整信息')
      return
    }

    setIsSubmitting(true)

    try {
      // 如果用户已登录，将头像 / 登录来源等元信息附加到用户名中
      let finalUserName = userName
      if (currentUser) {
        const metaParts: string[] = []
        if (currentUser.avatar_url) {
          metaParts.push(`avatar:${currentUser.avatar_url}`)
        }
        if (currentUser.provider) {
          metaParts.push(`provider:${currentUser.provider}`)
        }
        if (metaParts.length > 0) {
          finalUserName = `${userName}|${metaParts.join('|')}`
        }
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('comments')
        .insert({
          work_id: workId,
          user_name: finalUserName,
          content: content,
          rating: rating,
        })
        .select()
        .single()

      if (error) throw error

      setComments((prev) => [data, ...prev])
      setVisibleCount((prev) => prev + 1)
      // 只在访客模式下清空昵称
      if (!currentUser) {
        setUserName('')
      }
      setContent('')
      setRating(5)
      alert('评论成功！')
    } catch (error) {
      console.error('评论失败:', error)
      alert('评论失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">发表评价</h3>
        
        {/* 已登录用户：显示用户信息和表单 */}
        {currentUser ? (
          <>
            <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {currentUser.avatar_url ? (
                <Image 
                  src={currentUser.avatar_url} 
                  alt={currentUser.name || currentUser.username || '用户头像'} 
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`${getAvatarColor(currentUser.name || currentUser.username || 'User')} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-semibold">
                    {getInitials(currentUser.name || currentUser.username || 'U')}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">
                  以{' '}
                  <span className="text-blue-600">
                    {currentUser.name || currentUser.username}
                  </span>{' '}
                  的身份发表评论
                </p>
                <p className="text-xs text-gray-500">
                  {getProviderLabel(currentUser.provider)}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>评分</Label>
                <Rating value={rating} onChange={setRating} size="lg" />
              </div>
              <div>
                <Label htmlFor="content">评论内容</Label>
                <div className="mt-2 mb-2 flex flex-wrap items-center gap-1 text-xl">
                  {EMOJI_PICKER.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAddEmoji(emoji)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 hover:bg-sky-100 text-base"
                      aria-label={`插入表情 ${emoji}`}
                    >
                      <span>{emoji}</span>
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-gray-400">
                    支持输入表情 😄
                  </span>
                </div>
                <Textarea
                  id="content"
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="分享您的想法..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting || !userName.trim()}>
                {isSubmitting ? '提交中...' : '提交评论'}
              </Button>
            </form>
          </>
        ) : (
          /* 未登录用户：显示登录提示 */
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold mb-2">登录后发表评论</h4>
            <p className="text-gray-600 mb-4">
              请登录 GitHub 或 Linux DO 账号，在 Gemini 3.0-撷芳集 分享您的想法。
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <User className="mr-2 h-4 w-4" />
              前往登录
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">
          💬 评论列表 ({comments.length})
        </h3>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg mb-2">
                暂无评论
              </p>
              <p className="text-sm text-muted-foreground">
                快来抢沙发吧！
              </p>
            </div>
          ) : (
            comments.slice(0, visibleCount).map((comment) => {
              // 从评论中的 user_name 提取头像 / 登录来源等元信息
              const raw = comment.user_name || ''
              const [rawName, ...metaParts] = raw.split('|')
              let avatarUrl: string | null = null
              let provider: string | undefined

              metaParts.forEach((part) => {
                if (part.startsWith('avatar:')) {
                  avatarUrl = part.replace('avatar:', '')
                } else if (part.startsWith('provider:')) {
                  provider = part.replace('provider:', '')
                }
              })

              const displayName = rawName
              
              return (
                <Card key={comment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* 用户头像 */}
                      {avatarUrl ? (
                        <Image 
                          src={avatarUrl} 
                          alt={displayName} 
                          width={40}
                          height={40}
                          unoptimized
                          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div className={`${getAvatarColor(displayName)} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-semibold">
                            {getInitials(displayName)}
                          </span>
                        </div>
                      )}
                      
                      {/* 评论内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-base">{displayName}</p>
                            {comment.rating && (
                              <div className="mt-1">
                                <Rating value={comment.rating} readonly size="sm" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2 whitespace-nowrap">
                            {provider && (
                              <span className="text-[11px] text-gray-400">
                                {getProviderLabel(provider)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {getRelativeTime(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed break-words">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {comments.length > visibleCount && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() =>
                setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, comments.length))
              }
            >
              加载更多
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

