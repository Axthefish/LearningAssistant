# Agent 7: UI/UX Polish Expert

## Role
你是UI/UX细节打磨专家，精通现代Web设计、动画效果和用户体验优化。

## Mission
在所有页面完成的基础上，进行UI/UX细节打磨，包括：导航系统、加载状态、错误处理、动画效果、深色模式、响应式优化等。

## Context
- 所有核心页面已由Agent 5和Agent 6完成
- 需要添加全局导航、过渡动画、错误边界等
- 目标：达到现代SaaS产品的视觉和交互水准

## Prerequisites
- Agent 5: Flow Pages完成
- Agent 6: Framework Pages完成

## Tasks

### 1. 全局导航系统 (`components/GlobalNav.tsx`)

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useStore, useCurrentStep } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, History, Home, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SessionHistory } from './SessionHistory'
import { useState } from 'react'

export function GlobalNav() {
  const router = useRouter()
  const currentStep = useCurrentStep()
  const resetSession = useStore(state => state.resetSession)
  const { theme, setTheme } = useTheme()
  
  const [showHistory, setShowHistory] = useState(false)
  
  const handleGoHome = async () => {
    if (currentStep > 1) {
      if (confirm('确定要返回首页吗？当前进度将被保存。')) {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }
  
  const handleNewSession = async () => {
    if (confirm('确定要开始新会话吗？当前进度将被保存到历史记录。')) {
      await resetSession()
      router.push('/')
    }
  }
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoHome}
              title="返回首页"
            >
              <Home className="w-5 h-5" />
            </Button>
            
            <div className="hidden md:block">
              <h2 className="font-semibold">Learning Assistant</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(true)}
              title="历史记录"
            >
              <History className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="切换主题"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNewSession}>
                  开始新会话
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowHistory(true)}>
                  查看历史
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGoHome}>
                  返回首页
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      
      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur">
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">历史记录</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                >
                  ✕
                </Button>
              </div>
              <SessionHistory />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

### 2. 更新全局Layout添加导航 (`app/layout.tsx`)

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { StoreInitializer } from '@/components/StoreInitializer'
import { GlobalNav } from '@/components/GlobalNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Learning Assistant",
  description: "将模糊需求转化为个性化行动蓝图",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreInitializer>
            <GlobalNav />
            <main className="pt-16">{children}</main>
            <Toaster />
          </StoreInitializer>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 3. 主题Provider (`components/ThemeProvider.tsx`)

```typescript
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

安装依赖：
```bash
npm install next-themes
```

### 4. 错误边界 (`components/ErrorBoundary.tsx`)

```typescript
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">出错了</h2>
              <p className="text-muted-foreground">
                {this.state.error?.message || '发生了未知错误'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                重新加载
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                返回首页
              </Button>
            </div>
          </Card>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### 5. 加载状态组件优化 (`components/LoadingStates.tsx`)

```typescript
'use client'

import { motion } from 'framer-motion'
import { Loader2, Brain, Sparkles } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="text-muted-foreground">加载中...</p>
      </motion.div>
    </div>
  )
}

export function AIThinkingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-3"
    >
      <Brain className="w-5 h-5 text-primary animate-pulse" />
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-muted rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </div>
  )
}
```

### 6. Toast通知系统 (`components/ui/toaster.tsx`)

使用shadcn的toast组件：

```bash
npx shadcn-ui@latest add toast
```

创建hook (`lib/hooks/useToast.ts`):
```typescript
import { useToast as useToastBase } from '@/components/ui/use-toast'

export function useCustomToast() {
  const { toast } = useToastBase()
  
  return {
    success: (message: string) => {
      toast({
        title: '成功',
        description: message,
        variant: 'default',
      })
    },
    error: (message: string) => {
      toast({
        title: '错误',
        description: message,
        variant: 'destructive',
      })
    },
    info: (message: string) => {
      toast({
        title: '提示',
        description: message,
      })
    },
  }
}
```

### 7. 页面过渡动画 (`components/PageTransition.tsx`)

```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 8. 响应式优化 (`app/globals.css` 更新)

添加更好的响应式样式：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer utilities {
  /* Custom scrollbar */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: hsl(var(--muted));
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.3);
    border-radius: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.5);
  }
  
  /* Smooth animations */
  .animate-in {
    animation: animate-in 0.3s ease-out;
  }
  
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 3D scene optimizations */
  .canvas-container {
    image-rendering: crisp-edges;
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .prose {
    font-size: 0.95rem;
  }
  
  h1 {
    font-size: 1.75rem !important;
  }
  
  h2 {
    font-size: 1.5rem !important;
  }
}
```

### 9. 空状态组件 (`components/EmptyState.tsx`)

```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </Card>
  )
}
```

### 10. 性能优化和代码分割

更新 `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    
    // Three.js优化
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    return config
  },
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // 压缩
  compress: true,
  // 生产环境优化
  swcMinify: true,
}

module.exports = nextConfig
```

## Deliverables

完成后应该有：
1. ✅ 全局导航系统
2. ✅ 深色模式支持
3. ✅ 错误边界和错误处理
4. ✅ 加载状态优化
5. ✅ Toast通知系统
6. ✅ 页面过渡动画
7. ✅ 响应式优化
8. ✅ 空状态组件
9. ✅ 性能优化配置
10. ✅ 历史记录侧边栏

## Testing Checklist

- [ ] 所有页面导航流畅
- [ ] 深色/浅色模式切换正常
- [ ] 错误边界捕获错误
- [ ] 加载状态正确显示
- [ ] Toast通知正常工作
- [ ] 页面过渡动画流畅
- [ ] 移动端响应式完美
- [ ] 历史记录功能正常
- [ ] 性能优化生效（Lighthouse 90+）
- [ ] 无console错误或警告

## Final UX Checklist

- [ ] 首次加载时间 < 2秒
- [ ] 交互响应时间 < 100ms
- [ ] 所有按钮有hover和active状态
- [ ] 所有表单有验证和错误提示
- [ ] 所有异步操作有loading状态
- [ ] 所有成功/失败操作有反馈
- [ ] 键盘导航支持
- [ ] 色彩对比度符合WCAG AA标准
- [ ] 移动端手势支持
- [ ] 离线状态提示

## Hand-off to Agent 8

所有UI/UX优化完成，可以进行最终测试和部署。

## Notes
- 性能是关键，确保3D场景不影响整体体验
- 动画要自然，不要过度
- 深色模式需要特别注意对比度
- 移动端体验不妥协
- 确保所有交互都有明确反馈

