'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PromptType } from '@/lib/prompts'

interface UseChatOptions {
  onFinish?: (content: string) => void
  onError?: (error: Error) => void
}

export interface ChatController {
  abort: () => void
  retry: () => void
}

export function useChat(options: UseChatOptions = {}) {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // 使用 ref 存储 options 避免依赖变化导致重新创建
  const optionsRef = useRef(options)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastRequestRef = useRef<{
    promptType: PromptType
    variables: Record<string, string>
    locale?: string
  } | null>(null)
  
  useEffect(() => {
    optionsRef.current = options
  }, [options])
  
  const sendMessage = useCallback(
    async (promptType: PromptType, variables: Record<string, string>, locale?: string) => {
      // 保存请求参数以支持重试
      lastRequestRef.current = { promptType, variables, locale }
      
      setContent('')
      setIsStreaming(true)
      setError(null)
      
      // 创建新的 AbortController
      abortControllerRef.current = new AbortController()
      
      try {
        // 自动添加当前语言到variables - 优先使用传入的locale
        const currentLocale = locale || (typeof window !== 'undefined' ? (window.location.pathname.startsWith('/zh') ? 'zh' : 'en') : 'en')
        const languageName = currentLocale === 'zh' ? 'Simplified Chinese' : 'English'
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            promptType, 
            variables: {
              ...variables,
              LANGUAGE: languageName
            }
          }),
          signal: abortControllerRef.current.signal,
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
        let buffer = '' // 缓冲区：存储未处理完的不完整行
        
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          // 将新chunk追加到缓冲区
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          
          // 按行拆分，保留最后一个可能不完整的行
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 最后一行可能不完整，留在缓冲区
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data === '[DONE]') {
                setIsStreaming(false)
                abortControllerRef.current = null
                optionsRef.current.onFinish?.(accumulatedContent)
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'content') {
                  accumulatedContent += parsed.text
                  setContent(accumulatedContent)
                } else if (parsed.type === 'error') {
                  // 处理stream中的错误
                  throw new Error(parsed.text || 'Stream error')
                }
              } catch (e) {
                // 如果是JSON解析错误，忽略
                // 如果是业务错误，抛出
                if (e instanceof Error && e.message !== 'Unexpected token') {
                  throw e
                }
              }
            }
          }
        }
        
        setIsStreaming(false)
        abortControllerRef.current = null
        optionsRef.current.onFinish?.(accumulatedContent)
      } catch (err) {
        // 如果是用户主动取消，不报错
        if (err instanceof Error && err.name === 'AbortError') {
          setIsStreaming(false)
          return
        }
        
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        setIsStreaming(false)
        abortControllerRef.current = null
        optionsRef.current.onError?.(error)
      }
    },
    [] // 移除 options 依赖
  )
  
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }, [])
  
  const retry = useCallback(() => {
    if (lastRequestRef.current) {
      const { promptType, variables, locale } = lastRequestRef.current
      sendMessage(promptType, variables, locale)
    }
  }, [sendMessage])
  
  return {
    content,
    isStreaming,
    error,
    sendMessage,
    abort,
    retry,
  }
}

