'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useStore,
  useUniversalFramework,
  useUserAnswers,
  usePersonalizedFramework as useStoredPersonalizedFramework,
} from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { EnergyPillarSystemPro } from '@/components/3d/EnergyPillarSystemPro'
import { mapToEnergyPillarData } from '@/lib/3d-mapper'
import { parsePersonalizedFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PersonalizedFramework } from '@/lib/types'
import type { EnergyPillarData } from '@/lib/3d-mapper'

export default function PersonalizedFrameworkPage() {
  const router = useRouter()
  const framework = useUniversalFramework()
  const userAnswers = useUserAnswers()
  const storedPersonalized = useStoredPersonalizedFramework()
  
  const setPersonalizedFramework = useStore(state => state.setPersonalizedFramework)
  const resetSession = useStore(state => state.resetSession)
  
  const [parsedFramework, setParsedFramework] = useState<PersonalizedFramework | null>(null)
  const [energyPillarData, setEnergyPillarData] = useState<EnergyPillarData | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  
  const { content, isStreaming, sendMessage } = useChat({
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
      setIsComplete(true)
    },
  })
  
  useEffect(() => {
    if (!framework || !userAnswers || userAnswers.length === 0) {
      router.push('/diagnosis')
      return
    }
    
    // 如果已有个性化框架，直接展示
    if (storedPersonalized) {
      setParsedFramework(storedPersonalized)
      const pillarData = mapToEnergyPillarData(storedPersonalized)
      setEnergyPillarData(pillarData)
      setIsComplete(true)
      return
    }
    
    // 构建用户答案文本
    const answersText = userAnswers
      .map((a, i) => `**问题 ${i + 1}**: ${a.answer}`)
      .join('\n\n')
    
    // 调用AI生成个性化框架
    sendMessage('personalized', {
      UNIVERSAL_ACTION_SYSTEM: framework.rawMarkdown,
      DIAGNOSTIC_POINTS_AND_QUESTIONS: '...', // TODO: 从store获取
      USER_ANSWERS: answersText,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleExport = () => {
    if (!content) return
    
    const blob = new Blob([content], { type: 'text/markdown' })
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
      router.push('/')
    }
  }
  
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">你的个性化行动框架</h1>
              <p className="text-sm text-muted-foreground">
                步骤 7/7 - 完成 ✨
              </p>
            </div>
            {isComplete && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button onClick={handleStartNew}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  开始新会话
                </Button>
              </div>
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
    </div>
  )
}
