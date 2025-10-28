'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore, useDomainExploration, useMissionStatement, useUserInput } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { StepNavigator } from '@/components/StepNavigator'
import { ArrowLeft, FileText, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer'

export default function TopicClarificationPage() {
  const t = useTranslations('topic')
  const locale = useLocale() as Locale
  const router = useRouter()

  const domainExploration = useDomainExploration()
  const missionStatement = useMissionStatement()
  const userInput = useUserInput()
  const setUserInput = useStore(state => state.setUserInput)
  const goToStep = useStore(state => state.goToStep)
  const previousStep = useStore(state => state.previousStep)

  const [description, setDescription] = useState(userInput?.content || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!domainExploration?.rawMarkdown) {
      router.push(getPathWithLocale('/domain', locale))
      return
    }
    if (!userInput?.content) {
      setDescription(domainExploration.topic)
    }
  }, [domainExploration, userInput, router, locale])

  const explorationMarkdown = useMemo(() => domainExploration?.rawMarkdown || '', [domainExploration])

  const handleBackToDomain = () => {
    router.push(getPathWithLocale('/domain', locale))
  }

  const handleSubmit = async () => {
    if (!description.trim()) return
    setIsSubmitting(true)
    await setUserInput(description.trim())
    await goToStep(3)
    router.push(getPathWithLocale('/initial', locale))
  }

  const handleBack = () => {
    previousStep()
    router.push(getPathWithLocale('/domain', locale))
  }

  return (
    <div className="min-h-screen bg-background">
      <StepNavigator />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-8">
        <Button variant="ghost" onClick={handleBack} className="rounded-xl">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('backToDomain')}
        </Button>

        <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <Card className="p-6 md:p-8 shadow-apple-lg border-0 bg-gradient-to-b from-muted/60 to-background">
              <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {t('title')}
              </div>

              <div className="space-y-3 mt-6">
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
                  {t('subtitle')}
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {missionStatement?.content
                    ? missionStatement.content
                    : domainExploration?.topic}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <label htmlFor="topic-clarification" className="text-sm font-medium text-muted-foreground">
                  {t('inputLabel')}
                </label>
                <Textarea
                  id="topic-clarification"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  className="min-h-[200px] resize-none rounded-2xl border-0 bg-muted/60 focus:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-300 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {t('mapPreviewHint')}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-12 rounded-xl text-base"
                  onClick={handleSubmit}
                  disabled={!description.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      {t('loadingButton')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t('startButton')}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                  onClick={handleBackToDomain}
                >
                  {t('backToDomain')}
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <Card className="p-6 bg-muted/10 border-dashed border-muted-foreground/40">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    {t('mapPreviewTitle')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {domainExploration?.topic || t('mapPreviewHint')}
                  </p>
                </div>
              </div>
            </Card>

            {explorationMarkdown ? (
              <Card className="p-6 max-h-[80vh] overflow-y-auto">
                <MarkdownRenderer content={explorationMarkdown} />
              </Card>
            ) : (
              <Card className="p-8 border-dashed border-muted-foreground/30 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('mapPreviewHint')}
                </p>
              </Card>
            )}

            {missionStatement?.content && (
              <Card className="p-6 bg-muted/30 border-muted/40">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Mission Draft
                  </p>
                  <p className="text-base leading-relaxed text-foreground">
                    {missionStatement.content}
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function renderTopicHint(topic: string, t: ReturnType<typeof useTranslations<'topic'>>) {
  if (!topic) return t('mapPreviewHint')
  return t('mapPreviewTopic', { topic })
}
