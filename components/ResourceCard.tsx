'use client'

/**
 * Resource Card Component
 * 显示资源推荐的卡片（书籍、视频等）
 */

import { Card } from '@/components/ui/card'
import { BookOpen, Video, ExternalLink } from 'lucide-react'

interface ResourceCardProps {
  type: 'book' | 'video' | 'article'
  title: string
  author?: string
  description?: string
  url?: string
  className?: string
}

export function ResourceCard({ 
  type, 
  title, 
  author, 
  description,
  url,
  className = '' 
}: ResourceCardProps) {
  const Icon = type === 'book' ? BookOpen : type === 'video' ? Video : ExternalLink
  
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <Card 
      className={`p-6 cursor-pointer hover:shadow-apple-lg transition-all ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          {author && (
            <p className="text-sm text-muted-foreground mb-2">by {author}</p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {url && (
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    </Card>
  )
}

