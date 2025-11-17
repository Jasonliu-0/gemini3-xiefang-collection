'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Work } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'

interface StatsDashboardProps {
  works: Work[]
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function StatsDashboard({ works }: StatsDashboardProps) {
  // 标签分布统计
  const tagStats = useMemo(() => {
    const tagCounts: { [key: string]: number } = {}
    
    works.forEach(work => {
      if (work.tags && Array.isArray(work.tags)) {
        work.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
    
    return Object.entries(tagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // 只显示前8个标签
  }, [works])

  // 作品浏览量和点赞数 TOP 10
  const topWorks = useMemo(() => {
    return works
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(work => ({
        name: work.title.length > 15 ? work.title.slice(0, 15) + '...' : work.title,
        浏览量: work.views,
        点赞数: work.likes,
      }))
  }, [works])

  // 按月份统计作品数量
  const monthlyStats = useMemo(() => {
    const monthCounts: { [key: string]: number } = {}
    
    works.forEach(work => {
      const date = new Date(work.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    })
    
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, 作品数: count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // 最近6个月
  }, [works])

  if (works.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 md:gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-filter backdrop-blur-xl px-4 md:px-6 py-2 md:py-3 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
          <TrendingUp className="h-4 md:h-5 w-4 md:w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 font-serif">数据统计</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 标签分布饼图 */}
        {tagStats.length > 0 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <PieChartIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-serif">热门标签分布</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tagStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`} // eslint-disable-line @typescript-eslint/no-explicit-any
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tagStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 作品数量月度趋势 */}
        {monthlyStats.length > 0 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-serif">月度作品趋势</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="作品数" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* TOP 10 作品浏览量对比 */}
        {topWorks.length > 0 && (
          <Card className="lg:col-span-2 bg-white/90 dark:bg-gray-800/90 backdrop-filter backdrop-blur-xl border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <span className="font-serif">热门作品 TOP 10</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topWorks} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150}
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="浏览量" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="点赞数" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

