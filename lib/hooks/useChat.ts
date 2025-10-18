'use client'

import { useState, useCallback } from 'react'
import type { PromptType } from '@/lib/prompts'

interface UseChatOptions {
  onFinish?: (content: string) => void
  onError?: (error: Error) => void
}

export function useChat(options: UseChatOptions = {}) {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const sendMessage = useCallback(
    async (promptType: PromptType, variables: Record<string, string>) => {
      setContent('')
      setIsStreaming(true)
      setError(null)
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptType, variables }),
        })
        
        if (!response.ok) {
          throw new Error('API request failed')
        }
        
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) {
          throw new Error('No response body')
        }
        
        let accumulatedContent = ''
        
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data === '[DONE]') {
                setIsStreaming(false)
                options.onFinish?.(accumulatedContent)
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'content') {
                  accumulatedContent += parsed.text
                  setContent(accumulatedContent)
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
        
        setIsStreaming(false)
        options.onFinish?.(accumulatedContent)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        setIsStreaming(false)
        options.onError?.(error)
      }
    },
    [options]
  )
  
  return {
    content,
    isStreaming,
    error,
    sendMessage,
  }
}

