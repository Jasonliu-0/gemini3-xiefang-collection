import { NextRequest, NextResponse } from 'next/server'
import { OAUTH_CONFIG } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // 1. 获取访问令牌
    const tokenResponse = await fetch(OAUTH_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: OAUTH_CONFIG.CLIENT_ID,
        client_secret: OAUTH_CONFIG.CLIENT_SECRET,
        code: code,
        redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('Token error:', tokenData)
      return NextResponse.redirect(new URL('/?error=token_failed', request.url))
    }

    // 2. 获取用户信息
    const userResponse = await fetch(OAUTH_CONFIG.USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userData.id) {
      console.error('User info error:', userData)
      return NextResponse.redirect(new URL('/?error=user_failed', request.url))
    }

    // 3. 创建 HTML 页面，将用户信息传递给客户端
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>登录成功</title>
      </head>
      <body>
        <script>
          const user = ${JSON.stringify({ ...userData, provider: 'linuxdo' })};
          const token = '${tokenData.access_token}';
          
          // 保存到 localStorage
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
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}

