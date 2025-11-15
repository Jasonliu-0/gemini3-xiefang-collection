import { Work } from '@/types/database'
import { WorkCard } from './work-card'

interface WorkGridProps {
  works: Work[]
}

export function WorkGrid({ works }: WorkGridProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">暂无作品</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  )
}

