'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 md:w-10 md:h-10">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 md:w-10 md:h-10 transition-all duration-300"
      aria-label="切换主题"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 md:h-[18px] md:w-[18px] rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-4 w-4 md:h-[18px] md:w-[18px] rotate-0 scale-100 transition-all" />
      )}
    </Button>
  )
}

