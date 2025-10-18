'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Node3D } from '@/lib/3d-mapper'

interface NodeDetailModalProps {
  node: Node3D | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NodeDetailModal({
  node,
  open,
  onOpenChange,
}: NodeDetailModalProps) {
  if (!node) return null
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'strength':
        return <Badge variant="success">🟢 优势区域</Badge>
      case 'opportunity':
        return <Badge variant="warning">🟠 机会区域</Badge>
      case 'maintenance':
        return <Badge variant="info">🟡 维护区域</Badge>
      default:
        return null
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{node.label}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {node.status && (
            <div>{getStatusBadge(node.status)}</div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">描述</h4>
            <p className="text-muted-foreground">{node.description}</p>
          </div>
          
          {node.recommendations && node.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">🎯 推荐行动</h4>
              <ul className="space-y-2">
                {node.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button onClick={() => onOpenChange(false)} className="w-full">
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

