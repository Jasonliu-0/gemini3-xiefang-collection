import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Upload, Home } from 'lucide-react'
import { LoginButton } from '@/components/login-button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-filter backdrop-blur-2xl backdrop-saturate-150 border-b border-white/30 shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
          <Sparkles className="h-5 w-5 md:h-7 md:w-7 text-sky-500" />
          <div className="flex flex-col">
            <span className="text-lg md:text-2xl font-bold text-gray-900 tracking-wider font-calligraphy">
              撷芳集
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 tracking-wide">
              Gemini 3.0
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 md:gap-3">
          {/* 桌面端：显示完整文字 */}
          <Link href="/" className="hidden md:block">
            <Button variant="ghost" className="gap-2 text-gray-700">
              <Home className="h-4 w-4" />
              浏览作品
            </Button>
          </Link>
          {/* 移动端：仅显示图标 */}
          <Link href="/" className="md:hidden">
            <Button variant="ghost" size="sm" className="text-gray-700 px-2">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          
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
          
          <LoginButton />
        </nav>
      </div>
    </header>
  )
}

