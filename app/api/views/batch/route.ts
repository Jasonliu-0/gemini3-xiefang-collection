import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    let works: string[] = []

    // 处理不同的请求格式
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      works = body.works || []
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const worksData = formData.get('works')
      if (worksData && typeof worksData === 'string') {
        works = JSON.parse(worksData)
      }
    }

    if (!Array.isArray(works) || works.length === 0) {
      return NextResponse.json({ error: '无效的作品列表' }, { status: 400 })
    }

    // 验证并清理作品ID
    const validWorkIds = works.filter(id =>
      typeof id === 'string' && id.length > 0 && id.length <= 100
    )

    if (validWorkIds.length === 0) {
      return NextResponse.json({ error: '没有有效的作品ID' }, { status: 400 })
    }

    // 限制每次批量更新的数量
    const limitedIds = validWorkIds.slice(0, 100)

    // 使用 RPC 函数批量更新浏览量（推荐方式）
    try {
      const { error } = await (supabase.rpc as any)('increment_views_batch', {
        work_ids: limitedIds
      })

      if (error) {
        console.error('RPC 批量更新失败:', error)
        // 降级到单独更新
        await fallbackUpdate(limitedIds)
      }
    } catch (rpcError) {
      console.error('RPC 调用失败:', rpcError)
      // 降级到单独更新
      await fallbackUpdate(limitedIds)
    }

    return NextResponse.json({
      success: true,
      updated: limitedIds.length,
      message: `成功更新 ${limitedIds.length} 个作品的浏览量`
    })

  } catch (error) {
    console.error('批量更新浏览量错误:', error)
    return NextResponse.json({
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 降级更新方法：逐个更新
async function fallbackUpdate(workIds: string[]) {
  const promises = workIds.map(async (workId) => {
    try {
      await (supabase.rpc as any)('increment_views', {
        work_id: workId
      })
    } catch (error) {
      console.error(`更新作品 ${workId} 浏览量失败:`, error)
    }
  })

  await Promise.allSettled(promises)
}