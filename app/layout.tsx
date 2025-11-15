import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter, Noto_Serif_SC, Ma_Shan_Zheng } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BackToTopButton } from '@/components/back-to-top'

const inter = Inter({ subsets: ['latin'] })
const notoSerifSC = Noto_Serif_SC({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
  preload: true,
  fallback: ['serif'],
})
const maShanZheng = Ma_Shan_Zheng({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ma-shan',
  display: 'swap',
  preload: true,
  fallback: ['cursive', 'serif'],
})

export const metadata: Metadata = {
  title: 'Gemini 3.0-撷芳集 | AI 优秀作品展示平台',
  description: '撷芳拾翠，集珍纳华 - 发现并珍藏通过 Gemini 3.0 创作的优秀 AI 作品',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: worksData } = await supabase
    .from('works')
    .select('views, likes')

  const totalWorks = worksData?.length ?? 0
  const totalViews =
    worksData?.reduce((sum, w) => sum + (w.views ?? 0), 0) ?? 0
  const totalLikes =
    worksData?.reduce((sum, w) => sum + (w.likes ?? 0), 0) ?? 0

  return (
    <html lang="zh-CN">
      <body
        id="page-top"
        className={`${inter.className} ${notoSerifSC.variable} ${maShanZheng.variable}`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <BackToTopButton />
        <footer className="bg-white/40 backdrop-filter backdrop-blur-2xl backdrop-saturate-150 border-t border-white/40 py-8 mt-10 shadow-lg">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* 左侧：创作数据概览 */}
              <div className="flex justify-center md:justify-start">
                <div className="w-full max-w-sm rounded-2xl bg-white/80 border border-sky-100 shadow-md px-6 py-5 text-left space-y-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-sky-600 uppercase">
                    数据一瞥
                  </p>
                  <p className="text-base text-gray-700 font-serif">
                    用数字记录每一次灵感的闪光。
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm font-serif">
                    <div>
                      <p className="text-lg md:text-xl font-bold text-gray-900">
                        {totalWorks}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">作品收录</p>
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-bold text-gray-900">
                        {totalViews.toLocaleString('zh-CN')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">累计浏览</p>
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-bold text-gray-900">
                        {totalLikes.toLocaleString('zh-CN')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">获得点赞</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 中间：品牌介绍和导航 */}
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-sky-500" />
                  <span className="text-2xl font-bold text-gray-900 tracking-wider font-calligraphy">
                    撷芳集
                  </span>
                </div>
                <p className="text-base text-gray-600 max-w-md font-serif leading-relaxed">
                  撷芳拾翠，集珍纳华<br />
                  珍藏 Gemini 3.0 创作的优秀作品
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 font-serif">
                  <a
                    href="https://github.com/Jasonliu-0/gemini3-xiefang-collection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-600 transition-colors"
                  >
                    GitHub
                  </a>
                  <span className="hidden md:inline">·</span>
                  <a
                    href="https://github.com/Jasonliu-0/gemini3-xiefang-collection#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-600 transition-colors"
                  >
                    关于
                  </a>
                  <span className="hidden md:inline">·</span>
                  <a
                    href="https://github.com/Jasonliu-0/gemini3-xiefang-collection/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-600 transition-colors"
                  >
                    反馈
                  </a>
                </div>
              </div>

              {/* 右侧：行动召唤 + 少量热门标签 */}
              <div className="flex justify-center md:justify-end">
                <div className="w-full max-w-sm rounded-2xl bg-white/80 border border-emerald-100 shadow-md px-6 py-5 text-left space-y-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-emerald-600 uppercase">
                    加入创作
                  </p>
                  <p className="text-base text-gray-700 font-serif">
                    把你的 Gemini 3.0 佳作，也收入这本「撷芳集」。
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/upload"
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-emerald-600 transition-all"
                    >
                      上传作品
                    </Link>
                    <div className="flex flex-wrap gap-2 text-xs font-serif text-gray-600">
                      <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100">
                        插画灵感
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                        3D 场景
                      </span>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                        网页设计
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500 font-serif">
              Made with ❤️ by Jasonliu-0 · MIT License
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

