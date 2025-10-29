'use client'

/**
 * Step Indicator Component
 * 显示当前步骤进度 "Step X of Y: Title"
 */

import { Progress } from '@/components/ui/progress'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  title?: string
  className?: string
}

export function StepIndicator({ 
  currentStep, 
  totalSteps, 
  title,
  className = ''
}: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
          {title && `: ${title}`}
        </span>
        <span className="text-muted-foreground font-medium">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

