'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import {
  useStore,
  useUniversalFramework,
  useUserAnswers,
  usePersonalizedFramework as useStoredPersonalizedFramework,
} from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { StepNavigator } from '@/components/StepNavigator'
import { EnergyPillarSystemPro } from '@/components/3d/EnergyPillarSystemPro'
import { mapToEnergyPillarData } from '@/lib/3d-mapper'
import { parsePersonalizedFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PersonalizedFramework } from '@/lib/types'
import type { EnergyPillarData } from '@/lib/3d-mapper'

export default function PersonalizedFrameworkPage() {
  const t = useTranslations('personalized')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const locale = useLocale() as Locale
  const framework = useUniversalFramework()
  const userAnswers = useUserAnswers()
  const storedPersonalized = useStoredPersonalizedFramework()
  
  const setPersonalizedFramework = useStore(state => state.setPersonalizedFramework)
  const resetSession = useStore(state => state.resetSession)
  const previousStep = useStore(state => state.previousStep)
  
  const [parsedFramework, setParsedFramework] = useState<PersonalizedFramework | null>(null)
  const [energyPillarData, setEnergyPillarData] = useState<EnergyPillarData | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [finalMarkdown, setFinalMarkdown] = useState('')
  
  const { content, isStreaming, error, sendMessage, abort, retry } = useChat({
    onFinish: (finalContent) => {
      if (!framework) return
      
      // 解析markdown
      const parsed = parsePersonalizedFramework(finalContent, framework)
      setParsedFramework(parsed)
      
      // 转换为能量柱数据（支持个性化）
      const pillarData = mapToEnergyPillarData(parsed)
      setEnergyPillarData(pillarData)
      
      // 保存到store
      setPersonalizedFramework(parsed)
      setFinalMarkdown(finalContent)
      setIsComplete(true)
    },
  })
  
  useEffect(() => {
    if (!framework || !userAnswers || userAnswers.length === 0) {
      router.push(getPathWithLocale('/diagnosis', locale))
      return
    }
    
    // 如果已有个性化框架，但语言不一致则忽略旧缓存
    if (storedPersonalized && (storedPersonalized as any).language === locale) {
      setParsedFramework(storedPersonalized)
      setFinalMarkdown(storedPersonalized.rawMarkdown)
      const pillarData = mapToEnergyPillarData(storedPersonalized)
      setEnergyPillarData(pillarData)
      setIsComplete(true)
      return
    }
    
    // 构建用户答案文本
    const answersText = userAnswers
      .map((a, i) => `**Question ${i + 1}**: ${a.answer}`)
      .join('\n\n')
    
    // 优先使用诊断阶段的原始 Markdown 作为上下文（最完整）
    const diagnosticRawMarkdown = useStore.getState().session?.diagnosticRawMarkdown
    
    // 如果没有原始 Markdown，回退到手动构建（兼容旧会话）
    const diagnosticContext = diagnosticRawMarkdown || (() => {
      const diagnosticQuestions = useStore.getState().session?.diagnosticQuestions || []
      return diagnosticQuestions.map((q, i) => {
        const answer = userAnswers.find(ua => ua.questionId === q.id)
        return `### Focus Area ${i + 1}: ${q.coachTitle}\n**Why this matters**: ${q.coachExplanation}\n**Question**: ${q.question}\n**User Answer**: ${answer?.answer || '(No answer provided)'}`
      }).join('\n\n---\n\n')
    })()
    
    // 调用AI生成个性化框架
    setFinalMarkdown('')
    sendMessage('personalized', {
      UNIVERSAL_ACTION_SYSTEM: framework.rawMarkdown,
      DIAGNOSTIC_POINTS_AND_QUESTIONS: diagnosticContext || answersText,
      USER_ANSWERS: answersText,
    }, locale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleExport = () => {
    const markdownToExport = finalMarkdown || content
    if (!markdownToExport) return
    
    const blob = new Blob([markdownToExport], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `个性化行动框架-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleStartNew = async () => {
    if (confirm('确定要开始新的会话吗？当前进度将被保存到历史记录。')) {
      await resetSession()
      router.push(getPathWithLocale('/', locale))
    }
  }
  
  
  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <div className="w-64 h-full fixed left-0 top-0">
          <div className="h-full bg-card/50 backdrop-blur-xl border-r border-border/50" />
        </div>
      </div>
      
      <main className="flex-1 lg:ml-64 h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isComplete && (
                <Button
                  onClick={() => previousStep()}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {tCommon('previous')}
                </Button>
              )}
              {isComplete && (
                <>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    {t('exportButton')}
                  </Button>
                  <Button onClick={handleStartNew}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('newSessionButton')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Markdown Content */}
          <div className="overflow-y-auto p-6 border-r">
            <div className="max-w-2xl mx-auto space-y-6">
              <ThinkingProcess
                isThinking={isStreaming}
                thinkingText="正在整合你的答案，生成个性化建议..."
              />
              
              {/* Stream Controls */}
              {isStreaming && (
                <Card className="p-4 flex items-center justify-between bg-muted/30">
                  <p className="text-sm text-muted-foreground">{tCommon('thinking')}</p>
                  <Button variant="outline" size="sm" onClick={abort}>
                    {tCommon('stop')}
                  </Button>
                </Card>
              )}
              
              {/* Error State with Retry */}
              {error && (
                <Card className="p-4 bg-destructive/10 border-destructive/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-destructive">{error.message}</p>
                    <Button variant="outline" size="sm" onClick={retry}>
                      {tCommon('retry')}
                    </Button>
                  </div>
                </Card>
              )}
              
              {content && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="p-6">
                    <StreamingMessage
                      content={content}
                      isStreaming={isStreaming}
                    />
                  </Card>
                </motion.div>
              )}
              
            </div>
          </div>
          
          {/* Right: 3D Visualization */}
          <div className="relative bg-muted/20">
            {!energyPillarData ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
                  <p className="text-muted-foreground">
                    正在生成你的个性化3D框架...
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="h-full"
              >
                <EnergyPillarSystemPro
                  data={energyPillarData}
                  showSidebar={true}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
