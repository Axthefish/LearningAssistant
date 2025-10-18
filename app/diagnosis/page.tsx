'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useStore,
  useUniversalFramework,
  useDiagnosticQuestions,
  useUserAnswers,
} from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DiagnosticQuestion as DiagnosticQuestionType, UserAnswer } from '@/lib/types'
import { parseDiagnosticQuestions } from '@/lib/markdown-parser'

export default function DiagnosisPage() {
  const router = useRouter()
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
  
  const { content, isStreaming, sendMessage } = useChat({
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
      router.push('/universal')
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
    })
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
    router.push('/personalized')
  }
  
  const allQuestionsAnswered = questions.every(q => answers[q.id]?.trim())
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              步骤 5-6/7: 个性化诊断
            </span>
            <span className="font-medium">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <Progress value={progress} />
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">让我们更深入了解你的情况</h1>
          <p className="text-muted-foreground">
            回答这些问题将帮助我为你生成高度个性化的行动建议
          </p>
        </div>
        
        {/* Generating Questions */}
        {isGeneratingQuestions && (
          <>
            <ThinkingProcess
              isThinking={isStreaming}
              thinkingText="正在分析框架，识别高杠杆诊断点..."
            />
            <Card className="p-6">
              <StreamingMessage
                content={content}
                isStreaming={isStreaming}
              />
            </Card>
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
  )
}

