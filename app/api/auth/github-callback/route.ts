import { NextRequest, NextResponse } from 'next/server'
import { GITHUB_OAUTH_CONFIG } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    console.log('开始 GitHub OAuth 认证流程...')
    console.log('Token URL:', GITHUB_OAUTH_CONFIG.TOKEN_URL)
    console.log('Redirect URI:', GITHUB_OAUTH_CONFIG.REDIRECT_URI)
    
    // 1. 获取访问令牌
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    const tokenResponse = await fetch(GITHUB_OAUTH_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_OAUTH_CONFIG.CLIENT_ID,
        client_secret: GITHUB_OAUTH_CONFIG.CLIENT_SECRET,
        code: code,
        redirect_uri: GITHUB_OAUTH_CONFIG.REDIRECT_URI,
      }),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    console.log('Token Response Status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token Response Error:', errorText)
      return NextResponse.redirect(new URL('/?error=token_request_failed', request.url))
    }
    
    const tokenData = await tokenResponse.json()
    console.log('Token Data received:', !!tokenData.access_token)

    if (!tokenData.access_token) {
      console.error('Token error:', tokenData)
      const errorMsg = tokenData.error_description || tokenData.error || 'token_failed'
      return NextResponse.redirect(new URL(`/?error=${errorMsg}`, request.url))
    }

    // 2. 获取用户信息
    const userController = new AbortController()
    const userTimeoutId = setTimeout(() => userController.abort(), 30000)
    
    const userResponse = await fetch(GITHUB_OAUTH_CONFIG.USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'User-Agent': 'Gemini-Xiefang-Collection',
      },
      signal: userController.signal,
    })
    
    clearTimeout(userTimeoutId)
    console.log('User Response Status:', userResponse.status)

    const userData = await userResponse.json()

    if (!userData.id) {
      console.error('User info error:', userData)
      return NextResponse.redirect(new URL('/?error=user_failed', request.url))
    }

    // 3. 转换 GitHub 用户数据格式以匹配 LinuxDoUser 接口
    const user = {
      id: userData.id.toString(),
      username: userData.login,
      name: userData.name || userData.login,
      avatar_url: userData.avatar_url,
      provider: 'github',
    }

    // 4. 创建 HTML 页面，将用户信息传递给客户端
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
    console.error('GitHub OAuth error:', error)
    
    let errorMsg = 'auth_failed'
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMsg = 'connection_timeout'
        console.error('连接超时: 无法连接到 GitHub 服务器')
      } else if (error.message.includes('fetch failed')) {
        errorMsg = 'network_error'
        console.error('网络错误: 请检查网络连接和防火墙设置')
      } else {
        console.error('错误详情:', error.message)
      }
    }
    
    return NextResponse.redirect(new URL(`/?error=${errorMsg}`, request.url))
  }
}
