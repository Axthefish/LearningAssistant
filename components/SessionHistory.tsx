'use client'

/**
 * 会话历史管理组件
 * Agent 4: State Management Expert
 */

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { storage } from '@/lib/storage'
import type { Session } from '@/lib/types'
import type { Locale } from '@/i18n/routing'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Clock, Trash2 } from 'lucide-react'

export function SessionHistory() {
  const locale = useLocale() as Locale
  const [sessions, setSessions] = useState<Session[]>([])
  const loadSession = useStore(state => state.loadSession)
  const currentSession = useStore(state => state.session)
  
  useEffect(() => {
    loadSessions()
  }, [locale])
  
  const loadSessions = async () => {
    // 只加载与当前语言匹配的会话（由于 storage 按 locale 隔离，自动过滤）
    const allSessions = await storage.listSessions()
    setSessions(allSessions.sort((a, b) => b.updatedAt - a.updatedAt))
  }
  
  const handleLoadSession = async (id: string) => {
    await loadSession(id)
  }
  
  const handleDeleteSession = async (id: string) => {
    await storage.deleteSession(id)
    await loadSessions()
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">历史会话</h2>
      
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">暂无历史会话</p>
      ) : (
        <div className="space-y-2">
          {sessions.map(session => (
            <Card
              key={session.id}
              className={`p-4 cursor-pointer hover:bg-muted/50 transition ${
                currentSession?.id === session.id ? 'border-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex-1"
                  onClick={() => handleLoadSession(session.id)}
                >
                  <div className="font-medium">
                    {session.missionStatement?.content.slice(0, 100) || '新会话'}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(session.updatedAt)}</span>
                    <span>•</span>
                    <span>步骤 {session.currentStep}/7</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSession(session.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

