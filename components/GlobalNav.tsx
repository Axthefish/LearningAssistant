'use client'

/**
 * Global Navigation Component
 * Agent 7: UI/UX Polish Expert
 */

import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useStore, useCurrentStep } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Menu, History, Home, Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SessionHistory } from './SessionHistory'
import { useState } from 'react'
import { getPathnameWithoutLocale, getPathWithLocale, type Locale } from '@/i18n/routing'

export function GlobalNav() {
  const router = useNextRouter()
  const pathname = useNextPathname()
  const locale = useLocale() as Locale
  const currentStep = useCurrentStep()
  const resetSession = useStore(state => state.resetSession)
  const { theme, setTheme } = useTheme()
  
  const [showHistory, setShowHistory] = useState(false)
  const [showHomeDialog, setShowHomeDialog] = useState(false)
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false)
  
  // 语言切换 - 使用原生 Next.js 路由
  const handleLanguageChange = (newLocale: Locale) => {
    // 获取不带 locale 的干净路径
    const cleanPath = getPathnameWithoutLocale(pathname)
    // 生成新的路径
    const newPath = getPathWithLocale(cleanPath, newLocale)
    // 直接跳转
    router.push(newPath)
  }
  
  const handleGoHome = async () => {
    if (currentStep > 1) {
      setShowHomeDialog(true)
    } else {
      const homePath = getPathWithLocale('/', locale)
      router.push(homePath)
    }
  }
  
  const confirmGoHome = () => {
    setShowHomeDialog(false)
    const homePath = getPathWithLocale('/', locale)
    router.push(homePath)
  }
  
  const handleNewSession = async () => {
    setShowNewSessionDialog(true)
  }
  
  const confirmNewSession = async () => {
    setShowNewSessionDialog(false)
    await resetSession()
    const homePath = getPathWithLocale('/', locale)
    router.push(homePath)
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
            
            {/* 语言切换器 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Language">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                  <span className={locale === 'en' ? 'font-semibold' : ''}>
                    English
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('zh')}>
                  <span className={locale === 'zh' ? 'font-semibold' : ''}>
                    简体中文
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
      
      {/* Go Home Confirmation Dialog */}
      <Dialog open={showHomeDialog} onOpenChange={setShowHomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>返回首页</DialogTitle>
            <DialogDescription>
              确定要返回首页吗？当前进度将被保存，您可以稍后继续。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHomeDialog(false)}>
              取消
            </Button>
            <Button onClick={confirmGoHome}>
              确认返回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Session Confirmation Dialog */}
      <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>开始新会话</DialogTitle>
            <DialogDescription>
              确定要开始新会话吗？当前进度将被保存到历史记录，您可以随时回顾。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
              取消
            </Button>
            <Button onClick={confirmNewSession}>
              确认开始
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
