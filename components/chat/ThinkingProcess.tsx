'use client'

import { motion } from 'framer-motion'
import { Brain, Loader2 } from 'lucide-react'

interface ThinkingProcessProps {
  isThinking: boolean
  thinkingText?: string
}

export function ThinkingProcess({
  isThinking,
  thinkingText,
}: ThinkingProcessProps) {
  if (!isThinking) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border border-muted"
    >
      <Brain className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Thinking...
          </span>
        </div>
        {thinkingText && (
          <p className="text-sm text-muted-foreground italic">
            {thinkingText}
          </p>
        )}
      </div>
    </motion.div>
  )
}

