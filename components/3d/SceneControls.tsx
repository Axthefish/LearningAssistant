'use client'

import { Button } from '@/components/ui/button'
import { RotateCw, Maximize2 } from 'lucide-react'

interface SceneControlsProps {
  onReset?: () => void
  onToggleAutoRotate?: () => void
  autoRotate?: boolean
}

export function SceneControls({
  onReset,
  onToggleAutoRotate,
  autoRotate = false,
}: SceneControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
      <Button
        variant="secondary"
        size="icon"
        onClick={onReset}
        title="重置视角"
        className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggleAutoRotate}
        title={autoRotate ? '停止旋转' : '自动旋转'}
        className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20"
      >
        <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}

