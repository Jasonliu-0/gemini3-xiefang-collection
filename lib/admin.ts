// 管理员权限配置
export const ADMIN_USERS = [
  'Jasonliu-0', // GitHub username
  'Jason_ghost', // Linux.do username
]

// 检查是否是管理员
export function isAdmin(username?: string): boolean {
  if (!username) return false
  return ADMIN_USERS.includes(username)
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

