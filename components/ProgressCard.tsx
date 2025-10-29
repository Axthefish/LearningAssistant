'use client'

/**
 * Progress Card Component
 * 显示整体进度的卡片
 */

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp } from 'lucide-react'

interface ProgressCardProps {
  title: string
  progress: number
  description?: string
  className?: string
}

export function ProgressCard({ 
  title, 
  progress, 
  description,
  className = '' 
}: ProgressCardProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-teal-amber flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">{progress}%</div>
        </div>
        <Progress value={progress} />
      </div>
    </Card>
  )
}

