'use client'

/**
 * Blind Spot Card Component
 * 显示潜在盲点的卡片
 */

import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface BlindSpotCardProps {
  title: string
  description: string
  className?: string
}

export function BlindSpotCard({ title, description, className = '' }: BlindSpotCardProps) {
  return (
    <Card className={`p-6 border-amber/30 bg-amber/5 hover:bg-amber/10 transition-colors ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}

