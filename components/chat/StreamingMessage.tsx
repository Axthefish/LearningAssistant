'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MarkdownRenderer } from './MarkdownRenderer'

interface StreamingMessageProps {
  content: string
  isStreaming: boolean
  onStreamComplete?: (finalContent: string) => void
}

export function StreamingMessage({
  content,
  isStreaming,
  onStreamComplete,
}: StreamingMessageProps) {
  const [displayContent, setDisplayContent] = useState('')
  
  useEffect(() => {
    setDisplayContent(content)
    
    if (!isStreaming && onStreamComplete) {
      onStreamComplete(content)
    }
  }, [content, isStreaming, onStreamComplete])
  
  return (
    <div className="relative">
      <MarkdownRenderer content={displayContent} />
      {isStreaming && (
        <motion.span
          className="inline-block w-2 h-5 ml-1 bg-primary"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  )
}

