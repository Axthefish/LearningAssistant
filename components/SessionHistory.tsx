'use client'

/**
 * 会话历史管理组件
 * Agent 4: State Management Expert
 */

import { useEffect, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Session } from '@/lib/types'
import type { Locale } from '@/i18n/routing'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Clock, Trash2, Download } from 'lucide-react'

export function SessionHistory() {
  const locale = useLocale() as Locale
  const t = useTranslations('sessionHistory')
  const sessions = useStore(state => state.sessions)
  const loadAllSessions = useStore(state => state.loadAllSessions)
  const switchSession = useStore(state => state.switchSession)
  const deleteSession = useStore(state => state.deleteSession)
  const currentSession = useStore(state => state.session)
  
  useEffect(() => {
    loadAllSessions()
  }, [loadAllSessions, locale])
  
  const handleLoadSession = async (id: string) => {
    await switchSession(id)
  }
  
  const handleDeleteSession = async (id: string) => {
    await deleteSession(id)
  }
  
  const handleDownloadMarkdown = useCallback((session: Session) => {
    const parts: string[] = []

    if (session.purposeStatement) {
      parts.push(`## Purpose Statement\n\n${session.purposeStatement.content}`)
    }

    if (session.universalFramework?.rawMarkdown) {
      parts.push(`---\n\n## Universal Action System\n\n${session.universalFramework.rawMarkdown}`)
    }

    if (session.diagnosticRawMarkdown) {
      parts.push(`---\n\n## Diagnostic Questions\n\n${session.diagnosticRawMarkdown}`)
    }

    if (!session.diagnosticRawMarkdown && session.diagnosticQuestions?.length) {
      const answersMap = new Map(session.userAnswers?.map(a => [a.questionId, a.answer]) || [])
      const diagnosticMarkdown = session.diagnosticQuestions
        .map((q, index) => {
          const answer = answersMap.get(q.id) || ''
          return `#### Focus Area ${index + 1}: ${q.coachTitle}` +
            `\n* **Here's why this matters**: ${q.coachExplanation}` +
            `\n**Question**: ${q.question}` +
            (answer ? `\n**User Answer**: ${answer}` : '')
        })
        .join('\n\n')
      parts.push(`---\n\n## Diagnostic Questions\n\n${diagnosticMarkdown}`)
    }

    if (session.personalizedRawMarkdown) {
      parts.push(`---\n\n## Personalized Framework\n\n${session.personalizedRawMarkdown}`)
    } else if (session.personalizedFramework?.rawMarkdown) {
      parts.push(`---\n\n## Personalized Framework\n\n${session.personalizedFramework.rawMarkdown}`)
    }

    if (session.userAnswers?.length) {
      const answersMarkdown = session.userAnswers
        .map((answer, index) => `**Question ${index + 1}**\n${answer.answer}`)
        .join('\n\n')
      parts.push(`---\n\n## User Answers\n\n${answersMarkdown}`)
    }

    const finalMarkdown = parts.join('\n\n')

    if (!finalMarkdown) {
      alert('当前会话没有可导出的内容。')
      return
    }

    const blob = new Blob([finalMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${new Date(session.updatedAt).toISOString()}-learning-assistant.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const formatDate = (timestamp: number) => {
    const localeString = locale === 'zh' ? 'zh-CN' : 'en-US'
    return new Date(timestamp).toLocaleString(localeString)
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('title')}</h2>
      
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">{t('empty')}</p>
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
                    {session.purposeStatement?.content
                      ? session.purposeStatement.content.slice(0, 100)
                      : t('newSession')}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(session.updatedAt)}</span>
                    <span>•</span>
                    <span>{t('step', { current: session.currentStep, total: 7 })}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadMarkdown(session)
                    }}
                    title={t('download')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

