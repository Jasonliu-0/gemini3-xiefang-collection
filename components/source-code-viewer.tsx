'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Eye, ExternalLink, Copy, Check, Share2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SourceCodeViewerProps {
  sourceCodeUrl: string | null
  // 新增：源码仓库 / 外部链接
  sourceRepoUrl?: string | null
  workUrl?: string | null
}

export function SourceCodeViewer({
  sourceCodeUrl,
  sourceRepoUrl,
  workUrl,
}: SourceCodeViewerProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    // 检查登录状态
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('linuxdo_user')
      setIsLoggedIn(!!user)
    }
  }, [])

  if (!sourceCodeUrl && !workUrl && !sourceRepoUrl) return null

  // 检查是否是 data URL 还是外部链接
  // 兼容旧格式：[CODE-HTML]-data:... 和新格式：data:...
  const cleanSourceUrl =
    sourceCodeUrl && sourceCodeUrl.includes('[CODE-')
      ? sourceCodeUrl.substring(sourceCodeUrl.indexOf('data:'))
      : sourceCodeUrl

  const isDataUrl = cleanSourceUrl && cleanSourceUrl.startsWith('data:')

  // 源码外部链接：优先使用单独的 sourceRepoUrl，其次兼容老数据中的 http/https sourceCodeUrl
  const externalUrl =
    sourceRepoUrl ||
    (sourceCodeUrl &&
    (sourceCodeUrl.startsWith('http://') || sourceCodeUrl.startsWith('https://'))
      ? sourceCodeUrl
      : null)
  const hasExternalUrl = !!externalUrl
  const isHtmlCode =
    isDataUrl && cleanSourceUrl && cleanSourceUrl.includes('data:text/html')

  const hasWorkUrl = !!workUrl
  const hasHtmlPreview = !!(isHtmlCode && cleanSourceUrl)

  const openByWorkUrl = () => {
    if (workUrl) {
      window.open(workUrl, '_blank')
    }
  }

  const openByHtmlFullscreen = () => {
    if (hasHtmlPreview && cleanSourceUrl) {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        try {
          const base64Data = cleanSourceUrl.split(',')[1]
          const htmlContent = decodeURIComponent(escape(atob(base64Data)))
          newWindow.document.write(htmlContent)
          newWindow.document.close()
        } catch (error) {
          console.error('Failed to open fullscreen:', error)
          newWindow.close()
        }
      }
    }
  }

  const handleViewSourceLink = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank')
    }
  }

  const handleDownload = () => {
    if (isDataUrl && cleanSourceUrl) {
      // 解码 base64 并下载
      const link = document.createElement('a')
      link.href = cleanSourceUrl
      link.download = `source-code-${Date.now()}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePreview = () => {
    setShowPreview(!showPreview)
  }

  const handleCopy = async () => {
    if (!codeContent) return
    
    try {
      await navigator.clipboard.writeText(codeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // 降级方案：使用旧的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = codeContent
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 分享当前作品详情页链接（无需登录）
  const handleShare = async () => {
    if (typeof window === 'undefined') return

    const url = window.location.href
    const title = document.title || 'Gemini 3.0 作品'
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any

    try {
      if ('share' in nav) {
        // 优先使用原生分享（可分享到系统支持的平台）
        await nav.share({
          title,
          url,
        })
      } else if (nav.clipboard && nav.clipboard.writeText) {
        // 退化方案：复制链接
        await nav.clipboard.writeText(url)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      } else {
        // 最基础退化：使用 prompt 提示用户复制
        window.prompt('请复制下面的链接进行分享：', url)
      }
    } catch (error) {
      console.error('Failed to share:', error)
      // 若原生分享失败，尝试复制链接
      try {
        if (nav.clipboard) {
          await nav.clipboard.writeText(url)
          setShareCopied(true)
          setTimeout(() => setShareCopied(false), 2000)
        }
      } catch {
        window.prompt('请复制下面的链接进行分享：', url)
      }
    }
  }

  // 获取代码内容用于预览
  const getCodeContent = () => {
    if (isDataUrl && cleanSourceUrl) {
      try {
        const base64Data = cleanSourceUrl.split(',')[1]
        const decodedCode = decodeURIComponent(escape(atob(base64Data)))
        return decodedCode
      } catch {
        return '无法解析代码内容'
      }
    }
    return null
  }

  const codeContent = getCodeContent()

  // 简单的HTML语法高亮
  const highlightHtml = (code: string) => {
    // 先转义HTML特殊字符
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    
    // 然后应用语法高亮
    highlighted = highlighted
      // HTML 标签名
      .replace(/(&lt;\/?)(\w+)/g, '<span style="color: #569CD6">$1$2</span>')
      .replace(/(&gt;)/g, '<span style="color: #569CD6">$1</span>')
      // 属性名
      .replace(/\s(\w+)=/g, ' <span style="color: #9CDCFE">$1</span>=')
      // 属性值（字符串）
      .replace(/=&quot;(.*?)&quot;/g, '=<span style="color: #CE9178">&quot;$1&quot;</span>')
      // 注释
      .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color: #6A9955">$1</span>')
      // CSS 内容
      .replace(/(&lt;style&gt;)([\s\S]*?)(&lt;\/style&gt;)/g, (match, open, content, close) => {
        const styledContent = content
          .replace(/([a-zA-Z-]+)\s*:/g, '<span style="color: #9CDCFE">$1</span>:')
          .replace(/:\s*([^;]+);/g, ': <span style="color: #CE9178">$1</span>;')
        return `${open}${styledContent}${close}`
      })
    
    return highlighted
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* 作品链接按钮：有 url 时始终单独展示 */}
        {hasWorkUrl && (
          <Button size="lg" onClick={openByWorkUrl}>
            <ExternalLink className="mr-2 h-5 w-5" />
            查看作品
          </Button>
        )}

        {/* 内嵌 HTML 源码预览按钮：
            - 只有源码时：作为主按钮显示「查看作品」
            - 同时有 url 时：显示为次级按钮「源码预览」 */}
        {hasHtmlPreview && (
          <Button
            size="lg"
            variant={hasWorkUrl ? 'outline' : 'default'}
            onClick={openByHtmlFullscreen}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            {hasWorkUrl ? '源码预览' : '查看作品'}
          </Button>
        )}
        {hasExternalUrl && (
          <Button variant="outline" size="lg" onClick={handleViewSourceLink}>
            <ExternalLink className="mr-2 h-5 w-5" />
            查看源码链接
          </Button>
        )}
        {/* 只有登录用户才能下载源码 */}
        {isDataUrl && isLoggedIn && (
          <Button variant="outline" size="lg" onClick={handleDownload}>
            <Download className="mr-2 h-5 w-5" />
            下载源码
          </Button>
        )}
        {/* 只有登录用户才能预览代码 */}
        {isDataUrl && codeContent && isLoggedIn && (
          <Button variant="outline" size="lg" onClick={handlePreview}>
            <Eye className="mr-2 h-5 w-5" />
            {showPreview ? '隐藏预览' : '预览代码'}
          </Button>
        )}

        {/* 分享按钮：任何用户都可使用 */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-5 w-5" />
          分享页面
          {shareCopied && (
            <span className="text-xs text-green-600 ml-1">链接已复制</span>
          )}
        </Button>

        {/* 未登录用户的提示 */}
        {isDataUrl && !isLoggedIn && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-4 py-3 rounded-lg">
            <span>🔒</span>
            <span>登录后可下载源码和预览代码</span>
          </div>
        )}
      </div>

      {showPreview && codeContent && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">代码预览</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      复制代码
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto max-h-96 relative">
                <code className="text-sm font-mono language-html"
                  dangerouslySetInnerHTML={{
                    __html: highlightHtml(codeContent)
                  }}
                />
              </pre>
            </div>
            {codeContent.toLowerCase().includes('<html') && (
              <div>
                <h3 className="text-lg font-semibold mb-2">HTML 预览</h3>
                <div className="border rounded overflow-hidden">
                  <iframe
                    srcDoc={codeContent}
                    className="w-full h-96"
                    sandbox="allow-scripts"
                    title="HTML Preview"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

 