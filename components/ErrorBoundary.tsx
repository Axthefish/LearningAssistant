'use client'

/**
 * Error Boundary Component
 * Agent 7: UI/UX Polish Expert
 */

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
                onClick={() => {
                  const isZh = typeof window !== 'undefined' && window.location.pathname.startsWith('/zh')
                  window.location.href = isZh ? '/zh' : '/en'
                }}
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

