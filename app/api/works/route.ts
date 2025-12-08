import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cache, CACHE_CONFIG, createCacheKey, cachedSupabaseQuery } from '@/lib/cache'

// 支持的查询参数
interface WorksQuery {
  page?: number
  limit?: number
  search?: string
  tag?: string
  author?: string
  sortBy?: 'latest' | 'views' | 'likes'
  minViews?: number
  minLikes?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const query: WorksQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '12'), 50), // 限制最大50条
      search: searchParams.get('search') || undefined,
      tag: searchParams.get('tag') || undefined,
      author: searchParams.get('author') || undefined,
      sortBy: (searchParams.get('sortBy') as 'latest' | 'views' | 'likes') || 'latest',
      minViews: parseInt(searchParams.get('minViews') || '0'),
      minLikes: parseInt(searchParams.get('minLikes') || '0')
    }

    // 创建缓存键
    const cacheKey = createCacheKey('works_list', query)
    const offset = (query.page! - 1) * query.limit!

    // 使用缓存的查询函数
    const result = await cachedSupabaseQuery(async () => {
      let dbQuery = supabase
        .from('works')
        .select('*', { count: 'exact' })
        .eq('is_approved', true)

      // 应用过滤器
      if (query.search) {
        dbQuery = dbQuery.or(
          `title.ilike.%${query.search}%,description.ilike.%${query.search}%,author.ilike.%${query.search}%`
        )
      }

      if (query.tag) {
        dbQuery = dbQuery.contains('tags', [query.tag])
      }

      if (query.author) {
        dbQuery = dbQuery.ilike('author', `%${query.author}%`)
      }

      if (query.minViews && query.minViews > 0) {
        dbQuery = dbQuery.gte('views', query.minViews)
      }

      if (query.minLikes && query.minLikes > 0) {
        dbQuery = dbQuery.gte('likes', query.minLikes)
      }

      // 排序
      switch (query.sortBy) {
        case 'views':
          dbQuery = dbQuery.order('views', { ascending: false })
          break
        case 'likes':
          dbQuery = dbQuery.order('likes', { ascending: false })
          break
        case 'latest':
        default:
          dbQuery = dbQuery.order('created_at', { ascending: false })
          break
      }

      // 分页
      return dbQuery.range(offset, offset + query.limit! - 1)
    }, {
      key: cacheKey,
      ttl: CACHE_CONFIG.WORKS_LIST.ttl,
      tags: ['works', `sort:${query.sortBy}`]
    })

    if (result.error) {
      console.error('获取作品列表失败:', result.error)
      return NextResponse.json(
        { error: '获取作品列表失败', details: result.error.message },
        { status: 500 }
      )
    }

    const { data, count } = result

    // 构建响应
    const response = {
      works: data || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        hasMore: count ? offset + (data?.length || 0) < count : false
      },
      filters: {
        search: query.search,
        tag: query.tag,
        author: query.author,
        sortBy: query.sortBy,
        minViews: query.minViews,
        minLikes: query.minLikes
      },
      timestamp: Date.now()
    }

    // 添加缓存头
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'X-Cache-Key': cacheKey,
      'X-Cache-Hit': 'false' // 这个会在缓存中间件中更新
    })

    return NextResponse.json(response, { headers })

  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// POST 请求用于创建新作品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 基本验证
    if (!body.title || !body.author) {
      return NextResponse.json(
        { error: '标题和作者为必填字段' },
        { status: 400 }
      )
    }

    // 插入新作品
    const { data, error } = await (supabase
      .from('works') as any)
      .insert({
        title: body.title,
        description: body.description || '',
        author: body.author,
        tags: body.tags || [],
        url: body.url || null,
        thumbnail: body.thumbnail || null,
        source_code_url: body.source_code_url || null,
        source_repo_url: body.source_repo_url || null,
        is_approved: false, // 默认需要审核
        views: 0,
        likes: 0,
        uploaded_by: body.uploaded_by || null
      })
      .select()
      .single()

    if (error) {
      console.error('创建作品失败:', error)
      return NextResponse.json(
        { error: '创建作品失败', details: error.message },
        { status: 500 }
      )
    }

    // 清除相关缓存
    cache.invalidateByTag('works')
    cache.invalidateByTag('stats')

    return NextResponse.json({
      success: true,
      work: data,
      message: '作品创建成功，等待审核'
    })

  } catch (error) {
    console.error('POST 错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}