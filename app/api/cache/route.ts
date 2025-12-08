import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'

// 管理员密钥（实际项目中应该从环境变量获取）
const ADMIN_SECRET = process.env.CACHE_ADMIN_SECRET || 'admin-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, key, tag, secret } = body

    // 验证管理员权限
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: '无权限访问' },
        { status: 401 }
      )
    }

    let result: any = { success: false }

    switch (action) {
      case 'clear':
        if (key) {
          result.success = cache.delete(key)
          result.message = result.success ? `缓存键 ${key} 已清除` : `缓存键 ${key} 不存在`
        } else if (tag) {
          cache.invalidateByTag(tag)
          result.success = true
          result.message = `标签 ${tag} 的所有缓存已清除`
        } else {
          cache.clear()
          result.success = true
          result.message = '所有缓存已清除'
        }
        break

      case 'stats':
        result = {
          success: true,
          stats: cache.getStats()
        }
        break

      case 'get':
        if (key) {
          const data = cache.get(key)
          result = {
            success: data !== null,
            data,
            message: data !== null ? `缓存键 ${key} 找到` : `缓存键 ${key} 不存在`
          }
        } else {
          result.success = false
          result.message = '需要提供缓存键'
        }
        break

      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('缓存管理错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取缓存统计信息（不需要管理员权限）
export async function GET(request: NextRequest) {
  try {
    const stats = cache.getStats()

    return NextResponse.json({
      success: true,
      stats,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('获取缓存统计失败:', error)
    return NextResponse.json(
      { error: '获取缓存统计失败' },
      { status: 500 }
    )
  }
}