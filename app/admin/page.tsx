'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { checkAdminStatus } from '@/lib/admin'

// 动态导入大型组件和工具库
const AdminDashboard = dynamic(
  () => import('@/components/admin-dashboard'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载管理后台中...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // 检查管理员权限
    const adminStatus = checkAdminStatus()
    setIsAdmin(adminStatus)
  }, [])

  return <AdminDashboard initialIsAdmin={isAdmin} />
}

