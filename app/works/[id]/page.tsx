import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CommentSection } from '@/components/comment-section'
import { SourceCodeViewer } from '@/components/source-code-viewer'
import { LikeButton } from '@/components/like-button'
import { Eye, Heart, Calendar, User } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

export const revalidate = 0

async function getWork(id: string) {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  // 增加浏览量
  await supabase
    .from('works')
    .update({ views: data.views + 1 })
    .eq('id', id)

  return data
}

async function getComments(workId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('work_id', workId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取评论失败:', error)
    return []
  }

  return data
}

export default async function WorkDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const work = await getWork(params.id)

  if (!work) {
    notFound()
  }

  const comments = await getComments(params.id)

  return (
    <div className="container py-8 max-w-5xl">
      {/* 作品头部 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{work.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {work.author && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {work.author}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(work.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {formatNumber(work.views)} 浏览
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {formatNumber(work.likes)} 点赞
          </span>
        </div>

        {work.tags && work.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {work.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 作品预览图 */}
      {work.thumbnail && (
        <div className="mb-8 rounded-lg overflow-hidden border">
          <div className="relative aspect-video w-full">
            <Image
              src={work.thumbnail}
              alt={work.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* 作品描述 */}
      {work.description && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3">作品描述</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {work.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 源码查看器和操作按钮 */}
      <SourceCodeViewer
        sourceCodeUrl={work.source_code_url}
        sourceRepoUrl={work.source_repo_url}
        workUrl={work.url}
        workId={work.id}
      />

      {/* 点赞按钮 */}
      <div className="mb-8">
        <LikeButton workId={work.id} initialLikes={work.likes} />
      </div>

      {/* 评论区 */}
      <div className="border-t pt-8">
        <CommentSection workId={work.id} comments={comments} />
      </div>
    </div>
  )
}

