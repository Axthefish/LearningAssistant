'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
    <div
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
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
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
    </div>
  )
}

