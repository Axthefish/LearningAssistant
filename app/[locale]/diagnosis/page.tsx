'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import {
  useStore,
  useUniversalFramework,
  useDiagnosticQuestions,
  useUserAnswers,
} from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { StepNavigator } from '@/components/StepNavigator'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DiagnosticQuestion as DiagnosticQuestionType, UserAnswer } from '@/lib/types'
import { parseDiagnosticQuestions } from '@/lib/markdown-parser'

export default function DiagnosisPage() {
  const t = useTranslations('diagnosis')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const locale = useLocale() as Locale
  const framework = useUniversalFramework()
  const existingQuestions = useDiagnosticQuestions()
  const existingAnswers = useUserAnswers()
  
  const setDiagnosticQuestions = useStore(state => state.setDiagnosticQuestions)
  const addUserAnswer = useStore(state => state.addUserAnswer)
  const goToStep = useStore(state => state.goToStep)
  
  const [questions, setQuestions] = useState<DiagnosticQuestionType[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(true)
  
  const { content, isStreaming, error, sendMessage, abort, retry } = useChat({
    onFinish: (finalContent) => {
      // 解析AI生成的诊断问题
      const parsed = parseDiagnosticQuestions(finalContent)
      setQuestions(parsed)
      setDiagnosticQuestions(parsed)
      setIsGeneratingQuestions(false)
    },
  })
  
  useEffect(() => {
    if (!framework) {
      router.push(getPathWithLocale('/universal', locale))
      return
    }
    
    // 如果已有问题，直接使用
    if (existingQuestions && existingQuestions.length > 0) {
      setQuestions(existingQuestions)
      setIsGeneratingQuestions(false)
      
      // 恢复已有答案
      if (existingAnswers) {
        const answersMap: Record<string, string> = {}
        existingAnswers.forEach(a => {
          answersMap[a.questionId] = a.answer
        })
        setAnswers(answersMap)
      }
      return
    }
    
    // 调用AI生成诊断问题
    sendMessage('diagnosis', {
      UNIVERSAL_ACTION_SYSTEM: framework.rawMarkdown,
      FOKAL_POINT: framework.systemGoal,
    }, locale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }))
  }
  
  const handleNext = async () => {
    if (currentQuestion) {
      const answer: UserAnswer = {
        questionId: currentQuestion.id,
        answer: answers[currentQuestion.id] || '',
        timestamp: Date.now(),
      }
      
      await addUserAnswer(answer)
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }
  
  const handleSubmitAll = async () => {
    // 保存最后一个答案
    if (currentQuestion) {
      const answer: UserAnswer = {
        questionId: currentQuestion.id,
        answer: answers[currentQuestion.id] || '',
        timestamp: Date.now(),
      }
      await addUserAnswer(answer)
    }
    
    await goToStep(7)
    router.push(getPathWithLocale('/personalized', locale))
  }
  
  const allQuestionsAnswered = questions.every(q => answers[q.id]?.trim())
  
  return (
    <div className="min-h-screen bg-background">
      <StepNavigator />
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress - 简化版 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
        
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-apple-h1">{t('title')}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Generating Questions - Apple风格骨架屏 */}
        {isGeneratingQuestions && (
          <>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-apple-body">{t('preparingQuestions')}</span>
            </div>
            
            {/* 骨架屏预览 */}
            <div className="space-y-4 animate-pulse">
              <Card className="p-8 space-y-4 border-0 bg-muted/20">
                <div className="h-8 bg-muted/50 rounded-xl w-2/3" />
                <div className="h-4 bg-muted/40 rounded-lg w-full" />
                <div className="h-4 bg-muted/40 rounded-lg w-5/6" />
                <div className="h-32 bg-muted/30 rounded-xl mt-6" />
              </Card>
              
              <Card className="p-8 space-y-4 border-0 bg-muted/20">
                <div className="h-8 bg-muted/50 rounded-xl w-1/2" />
                <div className="h-4 bg-muted/40 rounded-lg w-full" />
                <div className="h-32 bg-muted/30 rounded-xl mt-6" />
              </Card>
            </div>
            
            {content && (
              <Card className="p-6">
                <StreamingMessage
                  content={content}
                  isStreaming={isStreaming}
                />
              </Card>
            )}
          </>
        )}
        
        {/* Questions */}
        {!isGeneratingQuestions && questions.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6 space-y-6">
                {/* Focus Area */}
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {currentQuestion.focusArea}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {currentQuestion.coachTitle}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentQuestion.coachExplanation}
                  </p>
                </div>
                
                {/* Question */}
                <div className="space-y-3">
                  <label className="text-lg font-medium">
                    {currentQuestion.question}
                  </label>
                  <Textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="在这里输入你的回答..."
                    className="min-h-[150px] resize-none"
                  />
                </div>
                
                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {questions.map((q, index) => (
                      <div
                        key={q.id}
                        className={`w-2 h-2 rounded-full ${
                          answers[q.id]?.trim()
                            ? 'bg-primary'
                            : index === currentQuestionIndex
                            ? 'bg-primary/50'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button onClick={handleNext}>
                        下一个问题
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitAll}
                        disabled={!allQuestionsAnswered}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        完成，生成个性化方案
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
        </div>
      </div>
    </div>
  )
}

