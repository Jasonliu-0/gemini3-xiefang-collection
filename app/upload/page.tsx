'use client'

import { UploadForm } from '@/components/upload-form'
import { useEffect, useState } from 'react'
import { isAuthenticated, getAuthUrl, AuthProvider } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Lock, Github, Terminal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UploadPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setChecking(false)
  }, [])

  const handleLogin = (provider: AuthProvider) => {
    window.location.href = getAuthUrl(provider)
  }

  if (checking) {
    return (
      <div className="container py-8 max-w-3xl">
        <div className="text-center py-20">
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="shadow-lg">
            <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 bg-blue-100 rounded-full p-6 w-fit">
              <Lock className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">需要登录</CardTitle>
            <CardDescription className="text-base mt-3">
              请先登录账号，才能在 Gemini 3.0-撷芳集 分享和珍藏你的作品。
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="flex flex-col gap-3 items-center">
              <Button
                onClick={() => handleLogin('github')}
                size="lg"
                className="gap-2 bg-slate-900 hover:bg-slate-800 px-8 w-full md:w-auto"
              >
                <Github className="h-5 w-5" />
                使用 GitHub 登录
              </Button>
              <Button
                variant="outline"
                onClick={() => handleLogin('linuxdo')}
                size="lg"
                className="gap-2 px-8 w-full md:w-auto"
              >
                <Terminal className="h-5 w-5" />
                使用 Linux DO 登录
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              登录后即可在撷芳集上传、管理你的 Gemini 3.0 作品。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <UploadForm />
    </div>
  )
}
