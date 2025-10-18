'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PromptType } from '@/lib/prompts'

interface UseChatOptions {
  onFinish?: (content: string) => void
  onError?: (error: Error) => void
}

export function useChat(options: UseChatOptions = {}) {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // 使用 ref 存储 options 避免依赖变化导致重新创建
  const optionsRef = useRef(options)
  
  useEffect(() => {
    optionsRef.current = options
  }, [options])
  
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
                optionsRef.current.onFinish?.(accumulatedContent)
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
        optionsRef.current.onFinish?.(accumulatedContent)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        setIsStreaming(false)
        optionsRef.current.onError?.(error)
      }
    },
    [] // 移除 options 依赖
  )
  
  return {
    content,
    isStreaming,
    error,
    sendMessage,
  }
}

