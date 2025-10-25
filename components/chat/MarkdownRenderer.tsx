'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

/**
 * Markdown Renderer - 当前安全状态
 * 
 * - 默认安全：react-markdown 不允许原始 HTML（除非启用 rehype-raw）
 * - 未来如需渲染 HTML：添加 rehype-raw + rehype-sanitize 白名单
 * - 建议优化：
 *   1. 代码高亮：添加 rehype-highlight 或 prism
 *   2. 表格滚动：为 table 添加横向滚动容器
 *   3. 链接安全：外链添加 target="_blank" rel="noopener noreferrer"
 */

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
          // 表格横向滚动支持
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full">{children}</table>
            </div>
          ),
          // 外链安全处理
          a: ({ href, children }) => (
            <a 
              href={href} 
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

