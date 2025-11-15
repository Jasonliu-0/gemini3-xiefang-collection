// Linux DO OAuth2 配置
export const OAUTH_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_LINUX_DO_CLIENT_ID || '',
  CLIENT_SECRET: process.env.LINUX_DO_CLIENT_SECRET || '',
  REDIRECT_URI:
    process.env.NEXT_PUBLIC_REDIRECT_URI ||
    'http://localhost:3000/api/auth/callback',
  AUTH_URL: 'https://connect.linux.do/oauth2/authorize',
  TOKEN_URL: 'https://connect.linux.do/oauth2/token',
  USER_INFO_URL: 'https://connect.linux.do/oauth2/userinfo',
}

// GitHub OAuth2 配置
export const GITHUB_OAUTH_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  REDIRECT_URI:
    process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ||
    'http://localhost:3000/api/auth/github-callback',
  AUTH_URL: 'https://github.com/login/oauth/authorize',
  TOKEN_URL: 'https://github.com/login/oauth/access_token',
  USER_INFO_URL: 'https://api.github.com/user',
}

export type AuthProvider = 'linuxdo' | 'github'

// 生成授权 URL
export function getAuthUrl(provider: AuthProvider = 'linuxdo') {
  if (provider === 'github') {
    const params = new URLSearchParams({
      client_id: GITHUB_OAUTH_CONFIG.CLIENT_ID,
      redirect_uri: GITHUB_OAUTH_CONFIG.REDIRECT_URI,
      scope: 'read:user user:email',
      allow_signup: 'true',
    })

    return `${GITHUB_OAUTH_CONFIG.AUTH_URL}?${params.toString()}`
  }

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.CLIENT_ID,
    redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: 'user',
  })

  return `${OAUTH_CONFIG.AUTH_URL}?${params.toString()}`
}

// 用户信息类型
export interface LinuxDoUser {
  id: string
  username: string
  name: string
  avatar_url?: string
  trust_level?: number
  provider?: 'linuxdo' | 'github'
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const user = localStorage.getItem('linuxdo_user')
  return !!user
}

// 获取当前用户
export function getCurrentUser(): LinuxDoUser | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('linuxdo_user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// 保存用户信息
export function saveUser(user: LinuxDoUser) {
  if (typeof window === 'undefined') return
  localStorage.setItem('linuxdo_user', JSON.stringify(user))
}

// 退出登录
export function logout() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('linuxdo_user')
  localStorage.removeItem('linuxdo_token')
  window.location.href = '/'
}

