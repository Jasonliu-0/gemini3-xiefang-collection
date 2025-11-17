'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TagSelector } from '@/components/tag-selector'
import { supabase } from '@/lib/supabase'
import { Upload, Code, Save } from 'lucide-react'

export function UploadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    sourceCodeUrl: '',
    author: '',
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [sourceCodeFile, setSourceCodeFile] = useState<File | null>(null)
  const [sourceCodeText, setSourceCodeText] = useState('')
  const [sourceCodeType, setSourceCodeType] = useState<'file' | 'code'>('file')

  // 加载编辑数据
  useEffect(() => {
    if (editId) {
      loadWorkData(editId)
    }
  }, [editId])

  const loadWorkData = async (workId: string) => {
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('works')
        .select('*')
        .eq('id', workId)
        .single()

      if (error) throw error

      if (data) {
        setIsEditing(true)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          url: data.url || '',
          sourceCodeUrl: data.source_code_url || '',
          author: data.author || '',
        })
        setSelectedTags(data.tags || [])
        
        // 如果有 HTML 代码，提取并显示
        if (data.source_code_url && data.source_code_url.startsWith('data:text/html')) {
          try {
            const cleanUrl = data.source_code_url.includes('[CODE-')
              ? data.source_code_url.substring(data.source_code_url.indexOf('data:'))
              : data.source_code_url
            const base64Data = cleanUrl.split(',')[1]
            const decodedCode = decodeURIComponent(escape(atob(base64Data)))
            setSourceCodeText(decodedCode)
            setSourceCodeType('code')
          } catch (err) {
            console.error('解码失败:', err)
          }
        }
      }
    } catch (error) {
      console.error('加载作品数据失败:', error)
      alert('加载作品数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return publicUrl
  }

  const uploadCodeAsFile = async (code: string, extension: string) => {
    // 临时方案：将完整代码编码为 base64 并作为 data URL 返回
    // 避免 Storage 权限问题
    const base64Code = btoa(unescape(encodeURIComponent(code)))
    const dataUrl = `data:text/${extension};base64,${base64Code}`
    
    // 返回完整的 data URL
    return dataUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('请填写作品标题')
      return
    }

    // 检查是否填写了源码（文件或代码）
    if (sourceCodeType === 'file' && !sourceCodeFile && !formData.sourceCodeUrl) {
      alert('请上传源码文件或填写源码链接')
      return
    }
    
    if (sourceCodeType === 'code' && !sourceCodeText.trim() && !formData.sourceCodeUrl) {
      alert('请粘贴代码或填写源码链接')
      return
    }

    // 检查是否选择了标签
    if (selectedTags.length === 0) {
      alert('请至少选择一个标签')
      return
    }

    // 检查代码大小（粘贴代码模式）
    if (sourceCodeType === 'code' && sourceCodeText.trim()) {
      const sizeInKB = new Blob([sourceCodeText]).size / 1024
      if (sizeInKB > 5000) { // 5MB 限制
        alert(`代码文件过大 (${sizeInKB.toFixed(2)} KB)。\n建议：\n1. 压缩代码\n2. 使用上传文件模式\n3. 使用 GitHub 链接`)
        return
      }
      
      // 警告大文件
      if (sizeInKB > 1000) { // 1MB 警告
        if (!confirm(`代码文件较大 (${sizeInKB.toFixed(2)} KB)，上传可能需要一些时间。是否继续？`)) {
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      let thumbnailUrl = null
      // 源码仓库链接（GitHub / Linux DO 等）
      const sourceRepoUrl = formData.sourceCodeUrl || null
      // 实际可预览 / 下载的源码内容（data URL 或文件地址）
      let sourceCodeUrl: string | null = null

      // 上传缩略图
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails')
      }

      // 上传源码文件或代码文本
      if (sourceCodeType === 'file' && sourceCodeFile) {
        sourceCodeUrl = await uploadFile(sourceCodeFile, 'source-code')
      } else if (sourceCodeType === 'code' && sourceCodeText.trim()) {
        // 根据代码内容判断文件扩展名
        const extension = sourceCodeText.trim().startsWith('<svg') ? 'svg' : 'html'
        sourceCodeUrl = await uploadCodeAsFile(sourceCodeText, extension)
      } else if (formData.sourceCodeUrl) {
        // 仅填写了源码链接（未上传文件 / 粘贴代码）时，兼容旧行为：
        // 将源码链接同时写入 source_code_url，方便老作品仍然可通过「查看源码链接」访问。
        sourceCodeUrl = formData.sourceCodeUrl
      }

      // 准备作品数据
      const workData = {
        title: formData.title,
        description: formData.description || null,
        url: formData.url || null,
        source_code_url: sourceCodeUrl || formData.sourceCodeUrl || null,
        source_repo_url: sourceRepoUrl,
        thumbnail: thumbnailUrl || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        author: formData.author || null,
      }

      let resultData

      if (isEditing && editId) {
        // 编辑模式：更新现有作品
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('works')
          .update(workData)
          .eq('id', editId)
          .select()
          .single()

        if (error) throw error
        resultData = data
        alert('更新成功！')
      } else {
        // 新建模式：插入新作品
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('works')
          .insert(workData)
          .select()
          .single()

        if (error) throw error
        resultData = data
        alert('上传成功！')
      }

      // 确保 data 对象存在且有 id 字段
      if (!resultData || !resultData.id) {
        throw new Error('操作成功但未返回作品ID')
      }

      // 跳转到作品详情页
      router.push(`/works/${resultData.id}`)
    } catch (error) {
      console.error('上传失败:', error)
      
      // 详细错误信息
      let errorMessage = '上传失败，请重试'
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = `上传失败: ${(error as { message: string }).message}`
        }
        if ('error' in error && (error as { error?: { message?: string } }).error?.message) {
          errorMessage = `上传失败: ${(error as { error: { message: string } }).error.message}`
        }
        if ('statusCode' in error && (error as { statusCode?: string }).statusCode === '413') {
          errorMessage = '文件太大，请减小文件大小'
        }
      }
      
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message: string }).message
        if (message.includes('storage')) {
          errorMessage += '\n\n可能原因：\n1. Supabase Storage 存储桶未创建\n2. 存储桶权限设置不正确\n3. 网络连接问题'
        }
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">加载中...</p>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8">
        <CardTitle className="text-3xl">{isEditing ? '编辑作品' : '上传作品'}</CardTitle>
        <CardDescription className="text-blue-50 text-base">
          {isEditing ? '修改您的作品信息' : '在 Gemini 3.0-撷芳集 珍藏您的优秀创作'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息区 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-2">📝 基本信息</h3>
            
            <div>
              <Label htmlFor="title" className="text-base font-medium">
                作品标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="请输入作品标题"
                required
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">
                作品描述 <span className="text-gray-400 text-sm font-normal">可选</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="介绍一下您的作品..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="author" className="text-base font-medium">
                作者 <span className="text-gray-400 text-sm font-normal">可选</span>
              </Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="您的名字"
                className="mt-2"
              />
            </div>
          </div>

          {/* 链接区 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🔗 相关链接</h3>
            
            <div>
              <Label htmlFor="url" className="text-base font-medium">
                作品链接 <span className="text-gray-400 text-sm font-normal">可选</span>
              </Label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://your-demo.com"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                💡 在线演示地址
              </p>
            </div>

            <div>
              <Label htmlFor="sourceCodeUrl" className="text-base font-medium">
                源码链接 <span className="text-gray-400 text-sm font-normal">可选</span>
              </Label>
              <Input
                id="sourceCodeUrl"
                name="sourceCodeUrl"
                type="url"
                value={formData.sourceCodeUrl}
                onChange={handleChange}
                placeholder="GitHub、Linux DO 等"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                💡 支持 GitHub、Google Drive、Linux DO 帖子等
              </p>
            </div>
          </div>

          {/* 媒体区 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🖼️ 媒体文件</h3>
            
            <div>
              <Label htmlFor="thumbnail" className="text-base font-medium">
                缩略图 <span className="text-gray-400 text-sm font-normal">可选</span>
              </Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                💡 不填写时自动使用代码预览
              </p>
            </div>
          </div>

          {/* 源码区 */}
          <div className="space-y-6 bg-blue-50 rounded-xl p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">💻 源码</h3>
              <span className="text-red-500">*</span>
            </div>
            <p className="text-sm text-gray-600">
              上传源码文件、粘贴代码，或填写源码链接（至少选择一种）
            </p>
            <Tabs className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger
                  type="button"
                  active={sourceCodeType === 'file'}
                  onClick={(e) => {
                    e.preventDefault()
                    setSourceCodeType('file')
                  }}
                  className="text-base"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  上传文件
                </TabsTrigger>
                <TabsTrigger
                  type="button"
                  active={sourceCodeType === 'code'}
                  onClick={(e) => {
                    e.preventDefault()
                    setSourceCodeType('code')
                  }}
                  className="text-base"
                >
                  <Code className="mr-2 h-5 w-5" />
                  粘贴代码 ✨
                </TabsTrigger>
              </TabsList>

              {sourceCodeType === 'file' && (
                <TabsContent value="file" className="mt-4">
                  <div className="space-y-4 p-6 border-2 border-dashed border-blue-200 rounded-lg bg-white">
                    <Label htmlFor="sourceCodeFile" className="text-base font-medium">
                      选择文件
                    </Label>
                    <Input
                      id="sourceCodeFile"
                      type="file"
                      accept=".zip,.rar,.7z,.tar.gz,.html,.svg"
                      onChange={(e) => setSourceCodeFile(e.target.files?.[0] || null)}
                      className="cursor-pointer h-12"
                    />
                    <p className="text-xs text-gray-500">
                      📁 支持：zip, rar, 7z, tar.gz, html, svg
                    </p>
                  </div>
                </TabsContent>
              )}

              {sourceCodeType === 'code' && (
                <TabsContent value="code" className="mt-4">
                  <div className="space-y-4 p-6 border-2 border-dashed border-blue-200 rounded-lg bg-white">
                    <Label htmlFor="sourceCodeText" className="text-base font-medium">
                      粘贴代码
                    </Label>
                    <Textarea
                      id="sourceCodeText"
                      value={sourceCodeText}
                      onChange={(e) => setSourceCodeText(e.target.value)}
                      placeholder="粘贴您的 HTML 或 SVG 代码...&#10;&#10;示例：&#10;&lt;!DOCTYPE html&gt;&#10;&lt;html&gt;&#10;&lt;body&gt;&#10;  &lt;h1&gt;Hello World!&lt;/h1&gt;&#10;&lt;/body&gt;&#10;&lt;/html&gt;"
                      rows={16}
                      className="font-mono text-sm"
                    />
                    {sourceCodeText.trim() && (
                      <div className="flex items-center justify-between bg-green-50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ 已输入 {sourceCodeText.length} 个字符
                        </p>
                        <p className="text-sm text-green-600">
                          {(new Blob([sourceCodeText]).size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* 标签区 */}
          <div className="space-y-6 bg-purple-50 rounded-xl p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">🏷️ 标签</h3>
              <span className="text-red-500">*</span>
            </div>
            <p className="text-sm text-gray-600">
              至少选择一个标签，方便搜索和分类
            </p>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
            {isEditing ? (
              <Save className="mr-2 h-6 w-6" />
            ) : (
              <Upload className="mr-2 h-6 w-6" />
            )}
            {isSubmitting ? (isEditing ? '保存中...' : '上传中...') : (isEditing ? '保存修改' : '上传作品')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

