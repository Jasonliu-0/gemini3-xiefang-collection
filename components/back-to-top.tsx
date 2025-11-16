'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleClick = () => {
    if (typeof window === 'undefined') return

    const topElement = document.getElementById('page-top')
    if (topElement) {
      topElement.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!visible) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-label="回到顶部"
      className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-40 rounded-full shadow-lg bg-white/90 hover:bg-white w-10 h-10 md:w-11 md:h-11"
    >
      <ArrowUp className="h-4 w-4 md:h-5 md:w-5" />
    </Button>
  )
}


