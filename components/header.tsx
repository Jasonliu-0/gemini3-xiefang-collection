import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Upload, Home } from 'lucide-react'
import { LoginButton } from '@/components/login-button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-filter backdrop-blur-2xl backdrop-saturate-150 border-b border-white/30 shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <Sparkles className="h-7 w-7 text-sky-500" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900 tracking-wider font-calligraphy">
              撷芳集
            </span>
            <span className="text-xs text-gray-500 tracking-wide">
              Gemini 3.0
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-gray-700">
              <Home className="h-4 w-4" />
              浏览作品
            </Button>
          </Link>
          <Link href="/upload">
            <Button className="gap-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600">
              <Upload className="h-4 w-4" />
              上传作品
            </Button>
          </Link>
          <LoginButton />
        </nav>
      </div>
    </header>
  )
}

