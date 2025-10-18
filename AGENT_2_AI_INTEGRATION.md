# Agent 2: AI Integration Expert

## Role
你是Gemini API和流式对话系统的专家，精通Vercel AI SDK和现代AI用户体验设计。

## Mission
实现基于Gemini 2.5 Pro的流式AI对话系统，包括4个prompt模板、流式API端点、以及类Cursor的思考过程展示组件。

## Context
- AI模型: Gemini 2.5 Pro (需web search确认性能参数)
- 流式体验: 类似Cursor，展示AI思考过程
- Prompt来源: 项目中的4个.md文档

## Prerequisites
- Agent 1 已完成项目基础设施搭建
- 可以访问项目根目录的4个prompt .md文件

## Tasks

### 1. 研究 Gemini 2.5 Pro 性能参数

使用 web_search 工具搜索：
- Gemini 2.5 Pro 的 token 限制
- 流式输出能力
- 推荐的 temperature 和 top_p 参数
- 思考过程（thinking）输出方式

### 2. 实现 Gemini 配置 (`lib/gemini.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
}

export const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY
)

export const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  generationConfig: {
    temperature: 0.7, // 根据搜索结果调整
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 8192,
  },
})

export interface StreamChunk {
  type: 'thinking' | 'content'
  text: string
}
```

### 3. 实现 Prompt 模板系统 (`lib/prompts.ts`)

读取项目中的4个.md文件，转换为可用的prompt模板：

```typescript
/**
 * Prompt模板系统
 * 基于项目中的4个.md文档
 */

// 从 初始目的提取.md 提取
export const INITIAL_EXTRACTION_PROMPT = `
[完整复制初始目的提取.md的内容，保留所有格式和结构]
`;

// 从 通用架构生成.md 提取
export const UNIVERSAL_FRAMEWORK_PROMPT = `
[完整复制通用架构生成.md的内容，保留所有格式和结构]
`;

// 从 分析权重并向用户提问.md 提取
export const DIAGNOSIS_PROMPT = `
[完整复制分析权重并向用户提问.md的内容，保留所有格式和结构]
`;

// 从 特殊化架构生成.md 提取
export const PERSONALIZED_PROMPT = `
[完整复制特殊化架构生成.md的内容，保留所有格式和结构]
`;

/**
 * 构建完整的prompt
 */
export function buildPrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  // 替换变量，如 {{USER_INPUT}}, {{FOKAL_POINT}} 等
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  return result;
}

export type PromptType = 'initial' | 'universal' | 'diagnosis' | 'personalized';

export function getPromptTemplate(type: PromptType): string {
  switch (type) {
    case 'initial':
      return INITIAL_EXTRACTION_PROMPT;
    case 'universal':
      return UNIVERSAL_FRAMEWORK_PROMPT;
    case 'diagnosis':
      return DIAGNOSIS_PROMPT;
    case 'personalized':
      return PERSONALIZED_PROMPT;
  }
}
```

### 4. 实现流式 API 端点 (`app/api/chat/route.ts`)

```typescript
import { model } from '@/lib/gemini'
import { buildPrompt, getPromptTemplate, type PromptType } from '@/lib/prompts'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { promptType, variables } = await req.json()
    
    // 构建完整prompt
    const template = getPromptTemplate(promptType as PromptType)
    const fullPrompt = buildPrompt(template, variables)
    
    // 创建流式响应
    const result = await model.generateContentStream(fullPrompt)
    
    // 创建 ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            
            // 发送数据块
            const data = JSON.stringify({
              type: 'content',
              text: text,
            })
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
          }
          
          // 结束流
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}
```

### 5. 创建流式消息组件 (`components/chat/StreamingMessage.tsx`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <div
        dangerouslySetInnerHTML={{
          __html: displayContent.replace(/\n/g, '<br/>'),
        }}
      />
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
```

### 6. 创建思考过程组件 (`components/chat/ThinkingProcess.tsx`)

```typescript
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
            AI 正在思考...
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
```

### 7. 创建自定义 useChat Hook (`lib/hooks/useChat.ts`)

```typescript
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
```

### 8. 创建 Markdown 渲染组件 (`components/chat/MarkdownRenderer.tsx`)

```typescript
'use client'

import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn(
        'prose prose-lg max-w-none dark:prose-invert',
        'prose-headings:font-bold prose-headings:tracking-tight',
        'prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl',
        'prose-p:leading-relaxed prose-li:leading-relaxed',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
        'prose-blockquote:border-l-primary prose-blockquote:bg-muted/30',
        'prose-strong:text-primary',
        className
      )}
      components={{
        // 自定义组件渲染
        h1: ({ children }) => (
          <h1 className="scroll-m-20 border-b pb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="scroll-m-20 border-b pb-2">{children}</h2>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 pl-4 italic">{children}</blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

### 9. 安装额外依赖

```bash
npm install react-markdown remark-gfm
```

## Deliverables

完成后应该有：
1. ✅ Gemini 2.5 Pro 正确配置（基于web search结果）
2. ✅ 4个完整的prompt模板
3. ✅ 可工作的流式API端点
4. ✅ StreamingMessage组件（类Cursor体验）
5. ✅ ThinkingProcess组件
6. ✅ useChat自定义hook
7. ✅ MarkdownRenderer组件
8. ✅ 所有组件都有TypeScript类型定义

## Testing Checklist

创建一个简单的测试页面 `app/test-ai/page.tsx` 验证功能：

```typescript
'use client'

import { useState } from 'react'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { Button } from '@/components/ui/button'

export default function TestAIPage() {
  const { content, isStreaming, sendMessage } = useChat()
  
  const testInitialPrompt = () => {
    sendMessage('initial', {
      USER_INPUT: '我想提升我的职场影响力',
    })
  }
  
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">AI Integration Test</h1>
      
      <Button onClick={testInitialPrompt}>
        Test Initial Extraction Prompt
      </Button>
      
      <ThinkingProcess isThinking={isStreaming} />
      
      <StreamingMessage
        content={content}
        isStreaming={isStreaming}
      />
    </div>
  )
}
```

测试步骤：
1. 访问 `/test-ai`
2. 点击测试按钮
3. 验证流式输出正常
4. 验证思考过程动画
5. 验证Markdown渲染正确

## Hand-off Information

完成后提供给其他Agents：
- **Agent 5 & 6**: 可以使用 `useChat` hook 和相关组件
- 导出的关键接口：
  - `useChat(options)` - 流式对话hook
  - `StreamingMessage` - 消息展示组件
  - `ThinkingProcess` - 思考过程组件
  - `MarkdownRenderer` - Markdown渲染
  - `getPromptTemplate(type)` - 获取prompt模板
  - `buildPrompt(template, variables)` - 构建prompt

## Notes
- 确保API key通过环境变量管理
- 流式响应必须稳定可靠
- 错误处理要完善
- 组件要有loading和error状态

