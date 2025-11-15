'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // 加载所有已有标签
  useEffect(() => {
    loadAllTags()
  }, [])

  const loadAllTags = async () => {
    try {
      const { data, error } = await supabase
        .from('works')
        .select('tags')

      if (error) throw error

      // 收集所有唯一的标签
      const tagSet = new Set<string>()
      data?.forEach(work => {
        if (work.tags && Array.isArray(work.tags)) {
          work.tags.forEach(tag => tagSet.add(tag))
        }
      })

      setAllTags(Array.from(tagSet).sort())
    } catch (error) {
      console.error('加载标签失败:', error)
    }
  }

  // 过滤建议标签（排除已选择的）
  const suggestedTags = allTags
    .filter(tag => !selectedTags.includes(tag))
    .filter(tag => tag.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 10)

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        handleAddTag(inputValue)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowSuggestions(e.target.value.length > 0)
  }

  return (
    <div>
      <Label htmlFor="tags">标签</Label>
      
      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 mt-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-sm px-3 py-1.5 gap-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* 标签输入框 */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            id="tags"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            placeholder="输入标签或选择已有标签..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => handleAddTag(inputValue)}
            disabled={!inputValue.trim()}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* 建议标签下拉 */}
        {showSuggestions && suggestedTags.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1">
                点击选择已有标签
              </p>
              {suggestedTags.map((tag) => (
                <div
                  key={tag}
                  className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center justify-between"
                  onClick={() => handleAddTag(tag)}
                >
                  <span className="text-sm">{tag}</span>
                  <Badge variant="outline" className="text-xs">
                    已存在
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 热门标签快捷选择 */}
      {allTags.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">💡 热门标签：</p>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 8).map((tag) => (
              selectedTags.includes(tag) ? null : (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-600 hover:text-white transition-colors px-3 py-1.5"
                  onClick={() => handleAddTag(tag)}
                >
                  + {tag}
                </Badge>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

