'use client'

import { Languages } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Locale } from '@/lib/i18n'

export function LocaleToggle() {
  const [locale, setLocale] = useState<Locale>('zh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 从 localStorage 读取语言设置
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale) {
      setLocale(savedLocale)
    }
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
    // 触发页面重新渲染
    window.location.reload()
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 md:w-10 md:h-10">
        <Languages className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 md:w-10 md:h-10 transition-all duration-300"
          aria-label="切换语言"
        >
          <Languages className="h-4 w-4 md:h-[18px] md:w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>选择语言 / Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => changeLocale('zh')}
          className={locale === 'zh' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇨🇳</span>
          简体中文
          {locale === 'zh' && <span className="ml-auto text-blue-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLocale('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          <span className="mr-2">🇺🇸</span>
          English
          {locale === 'en' && <span className="ml-auto text-blue-600">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

