import { NextRequest, NextResponse } from 'next/server'
import { GITHUB_OAUTH_CONFIG } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // 1. 通过授权码换取访问令牌
    const tokenResponse = await fetch(GITHUB_OAUTH_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_OAUTH_CONFIG.CLIENT_ID,
        client_secret: GITHUB_OAUTH_CONFIG.CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_OAUTH_CONFIG.REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('GitHub token error:', tokenData)
      return NextResponse.redirect(
        new URL('/?error=github_token_failed', request.url),
      )
    }

    // 2. 使用访问令牌获取用户信息
    const userResponse = await fetch(GITHUB_OAUTH_CONFIG.USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'gemini3-xiefang-collection',
      },
    })

    const userData = await userResponse.json()

    if (!userData.id) {
      console.error('GitHub user info error:', userData)
      return NextResponse.redirect(
        new URL('/?error=github_user_failed', request.url),
      )
    }

    // 3. 统一为前端构造用户对象（与 Linux DO 登录复用同一 storage key）
    const user = {
      id: String(userData.id),
      username: userData.login,
      name: userData.name || userData.login,
      avatar_url: userData.avatar_url,
      provider: 'github' as const,
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>登录成功</title>
      </head>
      <body>
        <script>
          const user = ${JSON.stringify(user)};
          const token = '${tokenData.access_token}';
          
          // 保存到 localStorage（沿用现有键名，兼容 Linux DO 登录）
          localStorage.setItem('linuxdo_user', JSON.stringify(user));
          localStorage.setItem('linuxdo_token', token);
          
          // 跳转到首页
          window.location.href = '/';
        </script>
        <p>登录成功，正在跳转...</p>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=github_auth_failed', request.url))
  }
}


