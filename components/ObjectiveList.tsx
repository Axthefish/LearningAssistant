'use client'

/**
 * Objective List Component
 * 可折叠的目标列表，显示行动项和进度
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ActionItem {
  id: string
  title: string
  status: 'strength' | 'opportunity' | 'maintenance'
  completed?: boolean
}

interface ObjectiveProps {
  id: string
  title: string
  actions: ActionItem[]
  defaultExpanded?: boolean
}

export function ObjectiveList({ 
  id, 
  title, 
  actions,
  defaultExpanded = false 
}: ObjectiveProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  const completedCount = actions.filter(a => a.completed).length
  const totalCount = actions.length

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-primary">
            {Math.round((completedCount / totalCount) * 100)}%
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50"
          >
            <div className="p-6 pt-4 space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    action.completed 
                      ? 'bg-teal border-teal' 
                      : 'border-muted-foreground/30'
                  }`}>
                    {action.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`flex-1 text-sm ${
                    action.completed 
                      ? 'text-muted-foreground line-through' 
                      : 'text-foreground'
                  }`}>
                    {action.title}
                  </span>
                  <Badge variant={action.status} className="flex-shrink-0">
                    {action.status}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

