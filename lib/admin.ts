// 管理员权限配置
// 支持两种配置方式：
// 1. 环境变量（推荐）：NEXT_PUBLIC_ADMIN_USERS=user1,user2,user3
// 2. 代码硬编码（不推荐）：在下方数组中添加

// 从环境变量读取管理员列表
const getAdminUsersFromEnv = (): string[] => {
  if (typeof window !== 'undefined') {
    // 客户端：从 NEXT_PUBLIC_ 环境变量读取
    const envAdmins = process.env.NEXT_PUBLIC_ADMIN_USERS
    if (envAdmins) {
      return envAdmins.split(',').map(u => u.trim()).filter(Boolean)
    }
  }
  return []
}

// 代码中配置的管理员列表（备用方案）
const CODE_ADMIN_USERS: string[] = [
  // 'your-github-username',
  // 'your-linuxdo-username',
]

// 合并环境变量和代码配置的管理员
export const ADMIN_USERS: string[] = [
  ...getAdminUsersFromEnv(),
  ...CODE_ADMIN_USERS,
]

// 检查是否是管理员
export function isAdmin(username?: string): boolean {
  if (!username) return false
  
  // 重新获取最新的管理员列表（支持动态更新）
  const allAdmins = [
    ...getAdminUsersFromEnv(),
    ...CODE_ADMIN_USERS,
  ]
  
  return allAdmins.includes(username)
}

// 从 localStorage 获取当前用户并检查是否是管理员
export function checkAdminStatus(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const userStr = localStorage.getItem('linuxdo_user')
    if (!userStr) return false
    
    const user = JSON.parse(userStr)
    return isAdmin(user.username)
  } catch {
    return false
  }
}

