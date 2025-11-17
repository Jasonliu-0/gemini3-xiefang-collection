'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  availableTags: string[]
}

export interface SearchFilters {
  keyword: string
  author: string
  tags: string[]
  minViews: number
  minLikes: number
}

export function AdvancedSearch({ onSearch, availableTags }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    author: '',
    tags: [],
    minViews: 0,
    minLikes: 0,
  })

  const handleSearch = () => {
    onSearch(filters)
    // 保存搜索历史
    saveSearchHistory(filters)
  }

  const handleReset = () => {
    const emptyFilters: SearchFilters = {
      keyword: '',
      author: '',
      tags: [],
      minViews: 0,
      minLikes: 0,
    }
    setFilters(emptyFilters)
    onSearch(emptyFilters)
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const saveSearchHistory = (searchFilters: SearchFilters) => {
    if (typeof window === 'undefined') return
    
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
      const newHistory = [
        { filters: searchFilters, timestamp: new Date().toISOString() },
        ...history.slice(0, 9) // 保留最近10条
      ]
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  return (
    <div className="mb-6">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="gap-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <Filter className="h-4 w-4" />
        高级搜索
        {(filters.keyword || filters.author || filters.tags.length > 0 || filters.minViews > 0 || filters.minLikes > 0) && (
          <Badge className="ml-1 bg-blue-600 text-white">
            {[filters.keyword, filters.author, ...filters.tags].filter(Boolean).length + (filters.minViews > 0 ? 1 : 0) + (filters.minLikes > 0 ? 1 : 0)}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="mt-4 bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6 space-y-4">
            {/* 关键词搜索 */}
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">关键词</Label>
              <Input
                placeholder="搜索标题、描述..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="mt-2 dark:bg-gray-900/50 dark:border-gray-600"
              />
            </div>

            {/* 作者筛选 */}
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">作者</Label>
              <Input
                placeholder="按作者筛选..."
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                className="mt-2 dark:bg-gray-900/50 dark:border-gray-600"
              />
            </div>

            {/* 标签筛选 */}
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">标签</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 15).map((tag) => (
                  <Badge
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`cursor-pointer transition-all ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 数据筛选 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">最少浏览量</Label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minViews || ''}
                  onChange={(e) => setFilters({ ...filters, minViews: parseInt(e.target.value) || 0 })}
                  className="mt-2 dark:bg-gray-900/50 dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">最少点赞数</Label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minLikes || ''}
                  onChange={(e) => setFilters({ ...filters, minLikes: parseInt(e.target.value) || 0 })}
                  className="mt-2 dark:bg-gray-900/50 dark:border-gray-600"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSearch} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1 dark:border-gray-600 dark:text-gray-300">
                <X className="h-4 w-4 mr-2" />
                重置
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

