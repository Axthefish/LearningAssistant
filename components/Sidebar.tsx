'use client'

/**
 * 全局侧边栏组件 - 替代顶部导航栏
 * 只包含有效的导航功能，无无效按钮
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
import { Home, History, Globe, Sparkles, Plus } from 'lucide-react'
import { SessionHistory } from './SessionHistory'
import { useState } from 'react'
import { getPathnameWithoutLocale, getPathWithLocale, type Locale } from '@/i18n/routing'

export function Sidebar() {
  const router = useNextRouter()
  const pathname = useNextPathname()
  const locale = useLocale() as Locale
  const currentStep = useCurrentStep()
  const resetSession = useStore(state => state.resetSession)
  
  const [showHistory, setShowHistory] = useState(false)
  const [showHomeDialog, setShowHomeDialog] = useState(false)
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false)
  
  // 语言切换
  const handleLanguageChange = (newLocale: Locale) => {
    const cleanPath = getPathnameWithoutLocale(pathname)
    const newPath = getPathWithLocale(cleanPath, newLocale)
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
      {/* 固定左侧边栏 */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card/50 backdrop-blur-xl border-r border-border/50 z-40 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Learning Assistant</h1>
              <p className="text-xs text-muted-foreground">将想法，变为行动</p>
            </div>
          </div>
        </div>
        
        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleGoHome}
          >
            <Home className="w-5 h-5" />
            <span>首页</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => setShowHistory(true)}
          >
            <History className="w-5 h-5" />
            <span>历史记录</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleNewSession}
          >
            <Plus className="w-5 h-5" />
            <span>新会话</span>
          </Button>
        </nav>
        
        {/* 底部：语言切换 */}
        <div className="p-4 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Globe className="w-5 h-5" />
                <span>{locale === 'zh' ? '简体中文' : 'English'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
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
        </div>
      </aside>
      
      {/* History Sidebar Overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur">
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l shadow-lg overflow-y-auto">
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

