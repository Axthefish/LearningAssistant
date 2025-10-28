'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore, useDomainExploration, useCurrentStep, useUserInput } from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StepNavigator } from '@/components/StepNavigator'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, CompassIcon, Loader2, Map, RefreshCw, Sparkles, Target } from 'lucide-react'

interface ExamplePreset {
  id: string
  title: string
  description: string
  topic: string
}

const EXAMPLES: ExamplePreset[] = [
  {
    id: 'career-leader',
    title: '从技术骨干跃迁为策略型领导',
    description: '想知道如何设计成长路径、影响关键利益方并打造高杠杆团队',
    topic: '如何完成从资深工程师到策略型团队负责人的跃迁'
  },
  {
    id: 'ai-upskilling',
    title: '系统掌握最新 AI 能力',
    description: '面向非算法背景，想要在 3 个月内快速提升 AI 应用与创新能力',
    topic: '从 0 到 1 构建个人 AI 能力栈并输出可见成果'
  },
  {
    id: 'product-market',
    title: '验证创业方向的市场可行性',
    description: '如何在资源有限的情况下验证需求、设计 MVP 并拿到第一批真实用户',
    topic: '在 8 周内验证新创意的市场可行性并拿到前 10 个付费客户'
  },
  {
    id: 'wellbeing',
    title: '重建高质量的身心能量系统',
    description: '为长期高强度工作者设计科学的恢复机制和清晰的边界',
    topic: '在高压工作中持续保持身心能量并建立明确边界'
  }
]

export default function DomainExplorerPage() {
  const t = useTranslations('domain')
  const tTopic = useTranslations('topic')
  const locale = useLocale() as Locale
  const router = useRouter()

  const setDomainExploration = useStore(state => state.setDomainExploration)
  const goToStep = useStore(state => state.goToStep)
  const currentStep = useCurrentStep()
  const existingExploration = useDomainExploration()
  const userInput = useUserInput()

  const [topicInput, setTopicInput] = useState(existingExploration?.topic || userInput?.content || '')
  const [examplesOpen, setExamplesOpen] = useState(false)
  const [hasEdited, setHasEdited] = useState(false)

  const {
    content: streamedContent,
    isStreaming,
    error,
    sendMessage,
    abort,
    retry
  } = useChat({
    onFinish: async (finalMarkdown) => {
      if (!topicInput.trim()) return
      await setDomainExploration({
        topic: topicInput.trim(),
        rawMarkdown: finalMarkdown,
        timestamp: Date.now(),
      })
    },
  })

  const mapContent = useMemo(() => {
    if (isStreaming) return streamedContent
    if (existingExploration && !hasEdited) return existingExploration.rawMarkdown
    return streamedContent
  }, [isStreaming, streamedContent, existingExploration, hasEdited])

  useEffect(() => {
    if (!topicInput.trim() && !existingExploration) {
      setExamplesOpen(true)
    }
  }, [topicInput, existingExploration])

  useEffect(() => {
    if (!userInput?.content) return
    if (topicInput.trim()) return
    setTopicInput(userInput.content)
  }, [userInput, topicInput])

  useEffect(() => {
    if (!topicInput.trim()) return
    if (!existingExploration) return
    if (existingExploration.topic !== topicInput.trim()) {
      setHasEdited(true)
    } else {
      setHasEdited(false)
    }
  }, [topicInput, existingExploration])

  useEffect(() => {
    if (currentStep < 1) {
      goToStep(1)
    }
  }, [currentStep, goToStep])

  const handleGenerate = async () => {
    if (!topicInput.trim()) return
    setHasEdited(false)
    await sendMessage('domain', {
      TOPIC: topicInput.trim(),
    }, locale)
  }

  const handleProceed = async () => {
    if (!existingExploration || !existingExploration.rawMarkdown) return
    await goToStep(2)
    router.push(getPathWithLocale('/topic', locale))
  }

  const handleRemap = () => {
    handleGenerate()
  }

  const handleSelectExample = (example: ExamplePreset) => {
    setTopicInput(example.topic)
    setExamplesOpen(false)
    setHasEdited(true)
  }

  const showMapPanel = Boolean(mapContent || isStreaming)
  const showEmptyState = !showMapPanel && !isStreaming

  return (
    <div className="min-h-screen bg-background">
      <StepNavigator />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
          <div className="space-y-6">
            <Card className="p-6 md:p-8 shadow-apple-lg border-0 bg-gradient-to-b from-muted/60 to-background">
              <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-medium">
                <Compass className="w-4 h-4" />
                {t('title')}
              </div>

              <div className="space-y-3 mt-6">
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
                  {t('subtitle')}
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {t('firstStep')}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="topic-input">
                  {tTopic('inputLabel')}
                </label>
                <Textarea
                  id="topic-input"
                  value={topicInput}
                  onChange={(e) => {
                    setTopicInput(e.target.value)
                    setHasEdited(true)
                  }}
                  placeholder={t('inputPlaceholder')}
                  className="min-h-[130px] resize-none rounded-2xl border-0 bg-muted/60 focus:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-300 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {t('examplesTitle')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map(example => (
                    <Button
                      key={example.id}
                      type="button"
                      variant="ghost"
                      className="justify-start h-auto px-3 py-2 rounded-xl text-left text-sm bg-muted/40 hover:bg-muted/60"
                      onClick={() => handleSelectExample(example)}
                    >
                      <span className="font-medium block text-foreground">{example.title}</span>
                      <span className="text-xs text-muted-foreground block mt-1 leading-normal">
                        {example.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-12 rounded-xl text-base"
                  onClick={handleGenerate}
                  disabled={!topicInput.trim() || isStreaming}
                >
                  {isStreaming ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('loadingButton')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('startButton')}
                    </span>
                  )}
                </Button>
                {isStreaming && (
                  <Button variant="outline" size="lg" className="h-12 rounded-xl" onClick={abort}>
                    {t('actions.stop')}
                  </Button>
                )}
                {!isStreaming && mapContent && (
                  <Button variant="outline" size="lg" className="h-12 rounded-xl" onClick={handleRemap}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('actions.remap')}
                  </Button>
                )}
              </div>
            </Card>

            {existingExploration && existingExploration.rawMarkdown && (
              <Card className="p-6 md:p-7 border-dashed border-primary/40 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-1" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">
                      {tTopic('subtitle')}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tTopic('mapPreviewHint')}
                    </p>
                    <Button
                      variant="link"
                      className="px-0 text-sm"
                      onClick={() => {
                        setTopicInput(existingExploration.topic)
                        setExamplesOpen(true)
                      }}
                    >
                      {tTopic('backToDomain')}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isStreaming && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ThinkingProcess isThinking={true} thinkingText={tTopic('loadingButton')} />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <Card className="p-4 bg-destructive/10 border-destructive/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-destructive">{error.message}</p>
                  <Button variant="outline" size="sm" onClick={retry}>
                    Retry
                  </Button>
                </div>
              </Card>
            )}

            {showEmptyState && (
              <Card className="p-8 border-dashed border-muted-foreground/30 bg-muted/10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <CompassIcon className="w-8 h-8 text-muted-foreground" />
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {t('mapTitle')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('emptyState')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <AnimatePresence mode="wait">
              {showMapPanel && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="overflow-hidden">
                    <div className="border-b px-6 py-4 flex items-center justify-between bg-muted/40">
                      <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Map className="w-4 h-4 text-primary" />
                          {t('mapTitle')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {t('mapDescription')}
                        </p>
                      </div>
                      {existingExploration && !isStreaming && (
                        <Button size="sm" variant="default" onClick={handleProceed}>
                          {t('actions.proceed')}
                        </Button>
                      )}
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                      {isStreaming ? (
                        <StreamingMessage content={mapContent || ''} isStreaming={isStreaming} />
                      ) : (
                        mapContent ? (
                          <MarkdownRenderer content={mapContent} />
                        ) : null
                      )}
                    </div>

                    {existingExploration && !isStreaming && (
                      <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                          {tTopic('mapPreviewHint')}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={handleRemap}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t('actions.remap')}
                          </Button>
                          <Button onClick={handleProceed}>
                            {tTopic('startButton')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
