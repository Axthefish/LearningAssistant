# Agent 5: Flow Pages Expert

## Role
你是React和表单交互设计专家，精通用户输入流程和对话式界面设计。

## Mission
实现步骤1、2、5-6的页面（用户输入、初始目的提取、诊断提问），这些页面主要是表单和对话交互，不涉及3D可视化。

## Context
- 步骤1: 用户输入初始需求
- 步骤2: AI提取Mission Statement，用户确认/修改
- 步骤5-6: AI诊断提问，用户回答
- 使用Agent 2提供的AI组件和Agent 4提供的状态管理

## Prerequisites
- Agent 1: 项目基础设施完成
- Agent 2: AI Integration完成（useChat, StreamingMessage等）
- Agent 4: State Management完成（useStore, types等）

## Tasks

### 1. 实现步骤1：用户输入页面 (`app/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const router = useRouter()
  const setUserInput = useStore(state => state.setUserInput)
  const goToStep = useStore(state => state.goToStep)
  
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async () => {
    if (!input.trim()) return
    
    setIsSubmitting(true)
    
    // 保存用户输入
    await setUserInput(input)
    await goToStep(2)
    
    // 跳转到步骤2
    router.push('/initial')
  }
  
  const examples = [
    '我想提升职场影响力',
    '如何更好地管理团队',
    '想要系统地学习AI技术',
    '改善工作生活平衡',
  ]
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Learning Assistant
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            将你的模糊想法转化为清晰的行动蓝图
          </p>
        </div>
        
        {/* Main Input */}
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-medium">
              告诉我，你想要解决什么问题？
            </label>
            <Textarea
              placeholder="在这里输入你的想法，可以是模糊的、不确定的..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] resize-none text-lg"
              disabled={isSubmitting}
            />
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            size="lg"
            className="w-full text-lg h-14"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin">⏳</span>
                <span>正在处理...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>开始分析</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </Card>
        
        {/* Examples */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            或者试试这些例子：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => setInput(example)}
                className="justify-start text-left h-auto py-3"
                disabled={isSubmitting}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
```

### 2. 实现步骤2：初始目的提取页面 (`app/initial/page.tsx`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, useUserInput } from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Edit2, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function InitialExtractionPage() {
  const router = useRouter()
  const userInput = useUserInput()
  const setMissionStatement = useStore(state => state.setMissionStatement)
  const goToStep = useStore(state => state.goToStep)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  
  const { content, isStreaming, sendMessage } = useChat({
    onFinish: (finalContent) => {
      setEditedContent(finalContent)
    },
  })
  
  useEffect(() => {
    if (!userInput?.content) {
      router.push('/')
      return
    }
    
    // 调用AI生成Mission Statement
    sendMessage('initial', {
      USER_INPUT: userInput.content,
    })
  }, [])
  
  const handleConfirm = async () => {
    const finalContent = isEditing ? editedContent : content
    
    // 保存Mission Statement
    await setMissionStatement(finalContent, true)
    await goToStep(3)
    
    setIsConfirmed(true)
    
    // 跳转到步骤3
    router.push('/universal')
  }
  
  const handleBack = () => {
    router.push('/')
  }
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="text-sm text-muted-foreground">
            步骤 2/7
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">让我们明确你的核心目标</h1>
          <p className="text-muted-foreground">
            基于你的输入，我正在提炼出一个清晰、精确的使命陈述...
          </p>
        </div>
        
        {/* User Input Recap */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">你的原始输入：</p>
          <p className="text-base">{userInput?.content}</p>
        </Card>
        
        {/* AI Thinking */}
        <ThinkingProcess isThinking={isStreaming} />
        
        {/* AI Output */}
        {content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 space-y-4">
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    编辑你的使命陈述：
                  </label>
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              ) : (
                <StreamingMessage
                  content={content}
                  isStreaming={isStreaming}
                />
              )}
              
              {!isStreaming && (
                <div className="flex items-center space-x-2 pt-4 border-t">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => {
                          setIsEditing(false)
                          setEditedContent(content)
                        }}
                        variant="outline"
                      >
                        取消
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                      >
                        保存修改
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setIsEditing(true)
                          setEditedContent(content)
                        }}
                        variant="outline"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        修改
                      </Button>
                      <Button
                        onClick={handleConfirm}
                        disabled={isConfirmed}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        确认，继续下一步
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
```

### 3. 实现步骤5-6：诊断提问页面 (`app/diagnosis/page.tsx`)

```typescript
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
import type { DiagnosticQuestion, UserAnswer } from '@/lib/types'

export default function DiagnosisPage() {
  const router = useRouter()
  const framework = useUniversalFramework()
  const existingQuestions = useDiagnosticQuestions()
  const existingAnswers = useUserAnswers()
  
  const setDiagnosticQuestions = useStore(state => state.setDiagnosticQuestions)
  const addUserAnswer = useStore(state => state.addUserAnswer)
  const goToStep = useStore(state => state.goToStep)
  
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([])
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
  }, [])
  
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = (currentQuestionIndex / totalQuestions) * 100
  
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

/**
 * 解析AI生成的诊断问题markdown
 */
function parseDiagnosticQuestions(markdown: string): DiagnosticQuestion[] {
  const questions: DiagnosticQuestion[] = []
  
  // 简化的解析逻辑，实际需要更robust的markdown解析
  const focusAreaRegex = /#### Focus Area \d+: (.+)/g
  const questionRegex = /\*\*\d+\. (.+?)\*\*/g
  
  // TODO: 实现完整的markdown解析
  // 这里返回mock数据作为示例
  
  return [
    {
      id: 'q1',
      focusArea: 'Focus Area 1',
      coachTitle: 'Making Sure Your Hard Work Gets Noticed',
      coachExplanation: 'This is critical because...',
      question: 'Can you share a recent example...',
    },
    {
      id: 'q2',
      focusArea: 'Focus Area 2',
      coachTitle: 'Building Strategic Relationships',
      coachExplanation: 'Here is why this matters...',
      question: 'How do you currently...',
    },
  ]
}
```

### 4. 创建步骤导航组件 (`components/StepNavigator.tsx`)

```typescript
'use client'

import { useCurrentStep } from '@/lib/store'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  { number: 1, label: '输入需求' },
  { number: 2, label: '明确目标' },
  { number: 3, label: '通用框架' },
  { number: 4, label: '个性化确认' },
  { number: 5, label: '诊断分析' },
  { number: 6, label: '深度提问' },
  { number: 7, label: '个性化方案' },
]

export function StepNavigator() {
  const currentStep = useCurrentStep()
  
  return (
    <div className="w-full bg-card border-b py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                    step.number < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.number === currentStep
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  animate={
                    step.number === currentStep
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {step.number < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </motion.div>
                <span
                  className={`text-xs mt-2 hidden md:block ${
                    step.number <= currentStep
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 md:w-16 mx-2 ${
                    step.number < currentStep
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Deliverables

完成后应该有：
1. ✅ `app/page.tsx` - 步骤1：用户输入页面
2. ✅ `app/initial/page.tsx` - 步骤2：初始目的提取
3. ✅ `app/diagnosis/page.tsx` - 步骤5-6：诊断提问
4. ✅ `components/StepNavigator.tsx` - 步骤导航组件
5. ✅ 所有页面集成AI流式响应
6. ✅ 所有页面集成状态管理
7. ✅ 现代美观的UI设计
8. ✅ 流畅的页面过渡动画

## Testing Checklist

- [ ] 步骤1：用户输入正常提交
- [ ] 步骤2：AI流式输出正常
- [ ] 步骤2：编辑功能正常
- [ ] 步骤2：确认跳转到步骤3
- [ ] 步骤5-6：诊断问题生成正常
- [ ] 步骤5-6：问题导航正常
- [ ] 步骤5-6：答案保存正常
- [ ] 步骤导航显示正确
- [ ] 页面刷新后状态恢复
- [ ] 移动端响应式正常

## Hand-off Information

提供给Agent 7（UI Polish）：
- 页面布局和组件结构已完成
- 可进行UI细节优化和动画增强

## Notes
- 所有表单都有loading状态
- 所有输入都有验证
- 页面间导航使用Next.js router
- 状态自动持久化
- 错误处理完善

