'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Upload, Home, Shield, Star } from 'lucide-react'
import { LoginButton } from '@/components/login-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState, useEffect } from 'react'
import { checkAdminStatus } from '@/lib/admin'
import { isAuthenticated } from '@/lib/auth'

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsAdmin(checkAdminStatus())
    setIsLoggedIn(isAuthenticated())
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white/60 dark:bg-gray-900/60 backdrop-filter backdrop-blur-xl border-b border-white/30 dark:border-gray-700/30 shadow-lg transition-colors">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
          <Sparkles className="h-5 w-5 md:h-7 md:w-7 text-sky-500 dark:text-sky-400" />
          <div className="flex flex-col">
            <span className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider font-calligraphy">
              撷芳集
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 tracking-wide">
              Gemini 3.0
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 md:gap-3">
          {/* 桌面端：显示完整文字 */}
          <Link href="/" className="hidden md:block">
            <Button variant="ghost" className="gap-2 text-gray-700 dark:text-gray-300">
              <Home className="h-4 w-4" />
              浏览作品
            </Button>
          </Link>
          {/* 移动端：仅显示图标 */}
          <Link href="/" className="md:hidden">
            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 px-2">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* 我的收藏 - 仅登录用户可见 */}
          {isLoggedIn && (
            <>
              <Link href="/favorites" className="hidden md:block">
                <Button variant="ghost" className="gap-2 text-yellow-700 dark:text-yellow-400">
                  <Star className="h-4 w-4" />
                  我的收藏
                </Button>
              </Link>
              <Link href="/favorites" className="md:hidden">
                <Button variant="ghost" size="sm" className="text-yellow-700 dark:text-yellow-400 px-2">
                  <Star className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
          
          {/* 桌面端：显示完整文字 */}
          <Link href="/upload" className="hidden md:block">
            <Button className="gap-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600">
              <Upload className="h-4 w-4" />
              上传作品
            </Button>
          </Link>
          {/* 移动端：仅显示图标 */}
          <Link href="/upload" className="md:hidden">
            <Button size="sm" className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 px-2">
              <Upload className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* 管理员入口 - 仅管理员可见 */}
          {isAdmin && (
            <>
              <Link href="/admin" className="hidden md:block">
                <Button variant="outline" className="gap-2 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Shield className="h-4 w-4" />
                  管理后台
                </Button>
              </Link>
              <Link href="/admin" className="md:hidden">
                <Button variant="outline" size="sm" className="text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700 px-2">
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
          
          <ThemeToggle />
          <LoginButton />
        </nav>
      </div>
    </header>
  )
}

