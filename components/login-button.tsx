'use client'

import { Button } from '@/components/ui/button'
import { LogIn, LogOut, User, Github, Terminal } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  getAuthUrl,
  isAuthenticated,
  getCurrentUser,
  logout,
  LinuxDoUser,
  AuthProvider,
} from '@/lib/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LoginButton() {
  const [user, setUser] = useState<LinuxDoUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated()) {
      setUser(getCurrentUser())
    }
  }, [])

  const handleLogin = (provider: AuthProvider) => {
    window.location.href = getAuthUrl(provider)
  }

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  if (!mounted) {
    return null
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 md:gap-2 px-2 md:px-4">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name || user.username || '用户头像'}
                width={24}
                height={24}
                unoptimized
                className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="hidden md:inline max-w-[100px] truncate">{user.name || user.username}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center">
            <User className="mr-2 h-4 w-4" />
            {user.username}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 md:gap-2 px-2 md:px-4">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">登录</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>选择登录方式</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleLogin('github')}>
          <Github className="mr-2 h-4 w-4" />
          使用 GitHub 登录 ⭐
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLogin('linuxdo')}>
          <Terminal className="mr-2 h-4 w-4" />
          使用 Linux DO 登录
        </DropdownMenuItem>
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          推荐使用 GitHub 登录
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

