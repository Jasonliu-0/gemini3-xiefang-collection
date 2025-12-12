'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Work } from '@/types/database'
import { checkAdminStatus } from '@/lib/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Trash2, Eye, Heart, Calendar, User, AlertCircle, Edit, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// 获取 HTML 内容（从 work-card.tsx 复制）
const getHtmlContent = (sourceUrl: string | null) => {
  if (!sourceUrl) return ''
  
  const cleanSourceUrl = sourceUrl.includes('[CODE-') 
    ? sourceUrl.substring(sourceUrl.indexOf('data:'))
    : sourceUrl
  
  const isHtmlCode = cleanSourceUrl && cleanSourceUrl.startsWith('data:') && cleanSourceUrl.includes('data:text/html')
  
  if (!isHtmlCode) return ''
  
  try {
    const base64Data = cleanSourceUrl.split(',')[1]
    return decodeURIComponent(escape(atob(base64Data)))
  } catch (error) {
    console.error('Failed to decode HTML:', error)
    return ''
  }
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    // 检查管理员权限
    const adminStatus = checkAdminStatus()
    setIsAdmin(adminStatus)

    if (adminStatus) {
      loadWorks(1, false)
    } else {
      setLoading(false)
    }
  }, [])

  const loadWorks = async (pageNum: number, append = false) => {
    if (loading && append) return

    setLoading(true)
    try {
      const from = (pageNum - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await supabase
        .from('works')
        .select('id, title, description, thumbnail, source_code_url, tags, author, uploaded_by, is_approved, views, likes, created_at, url', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (!error && data) {
        setWorks(prev => append ? [...prev, ...data] : data)
        setHasMore(data.length === PAGE_SIZE)
        setTotal(count || 0)
      }
    } catch (error) {
      console.error('加载作品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadWorks(nextPage, true)
  }

  const handleDelete = async (workId: string, title: string) => {
    if (!confirm(`确定要删除作品「${title}」吗？此操作不可恢复！`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', workId)

      if (error) throw error

      alert('删除成功！')
      setWorks(works.filter(w => w.id !== workId))
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }

  const handleToggleApproval = async (workId: string, currentStatus: boolean, title: string) => {
    const action = currentStatus ? '隐藏' : '显示'
    if (!confirm(`确定要${action}作品「${title}」吗？`)) {
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('works')
        .update({ is_approved: !currentStatus })
        .eq('id', workId)

      if (error) throw error

      alert(`${action}成功！`)
      setWorks(works.map(w => 
        w.id === workId ? { ...w, is_approved: !currentStatus } : w
      ))
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败，请重试')
    }
  }

  // 如果未登录或不是管理员
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Shield className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">访问受限</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              此页面仅限管理员访问。
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                返回首页
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="container py-8 px-4">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-calligraphy">
              管理员后台
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              作品管理 · 数据监控
            </p>
          </div>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">总作品数</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{works.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">总浏览量</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {works.reduce((sum, w) => sum + w.views, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">总点赞数</p>
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {works.reduce((sum, w) => sum + w.likes, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">今日新增</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {works.filter(w => {
                  const today = new Date().toDateString()
                  return new Date(w.created_at).toDateString() === today
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 作品列表 */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-serif">作品管理 ({works.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {works.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                暂无作品
              </div>
            ) : (
              works.map((work) => {
                const htmlContent = getHtmlContent(work.source_code_url)
                
                return (
                <div
                  key={work.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                >
                  {/* 缩略图 */}
                  <div className="w-32 h-20 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {work.thumbnail ? (
                      <Image
                        src={work.thumbnail}
                        alt={work.title}
                        width={128}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : htmlContent ? (
                      <iframe
                        srcDoc={htmlContent}
                        className="w-full h-full pointer-events-none scale-50 origin-top-left"
                        sandbox="allow-scripts"
                        title={work.title}
                        style={{ width: '200%', height: '200%' }}
                      />
                    ) : work.url ? (
                      <iframe
                        src={work.url}
                        className="w-full h-full pointer-events-none scale-50 origin-top-left"
                        sandbox="allow-scripts allow-same-origin"
                        title={work.title}
                        style={{ width: '200%', height: '200%' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                        无预览
                      </div>
                    )}
                  </div>

                  {/* 作品信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100 truncate">
                      {work.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {work.description || '暂无描述'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        作者: {work.author || '匿名'}
                      </span>
                      {work.uploaded_by && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <User className="h-3 w-3" />
                          上传者: {work.uploaded_by}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {work.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {work.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(work.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {work.tags && work.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {work.tags.slice(0, 5).map((tag) => (
                          <Badge key={tag} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/works/${work.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        查看
                      </Button>
                    </Link>
                    <Link href={`/upload?edit=${work.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700">
                        <Edit className="h-3 w-3 mr-1" />
                        编辑
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleApproval(work.id, work.is_approved, work.title)}
                      className={`w-full ${
                        work.is_approved 
                          ? 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700' 
                          : 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700'
                      }`}
                    >
                      {work.is_approved ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          隐藏
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          显示
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(work.id, work.title)}
                      className="w-full"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              )})
            )}
          </div>

          {/* 加载更多按钮 */}
          {hasMore && works.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    加载中...
                  </>
                ) : (
                  `加载更多 (${works.length}/${total})`
                )}
              </Button>
            </div>
          )}

          {!hasMore && works.length > 0 && (
            <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              已加载全部 {total} 个作品
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

