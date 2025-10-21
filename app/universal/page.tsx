'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, useMissionStatement } from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { EnergyPillarSystemPro } from '@/components/3d/EnergyPillarSystemPro'
import { mapToEnergyPillarData } from '@/lib/3d-mapper'
import { parseUniversalFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Box } from 'lucide-react'
import { motion } from 'framer-motion'
import type { UniversalFramework } from '@/lib/types'
import type { EnergyPillarData } from '@/lib/3d-mapper'

export default function UniversalFrameworkPage() {
  const router = useRouter()
  const missionStatement = useMissionStatement()
  const existingFramework = useStore(state => state.session?.universalFramework)
  const setUniversalFramework = useStore(state => state.setUniversalFramework)
  const confirmPersonalization = useStore(state => state.confirmPersonalization)
  
  const [parsedFramework, setParsedFramework] = useState<UniversalFramework | null>(null)
  const [energyPillarData, setEnergyPillarData] = useState<EnergyPillarData | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  
  const { content, isStreaming, sendMessage } = useChat({
    onFinish: (finalContent) => {
      // 解析markdown为结构化数据
      const parsed = parseUniversalFramework(finalContent)
      setParsedFramework(parsed)
      setMarkdownContent(finalContent)
      
      // 转换为能量柱数据
      const pillarData = mapToEnergyPillarData(parsed)
      setEnergyPillarData(pillarData)
      
      // 保存到store
      setUniversalFramework(parsed)
      
      // 显示确认按钮
      setShowConfirmation(true)
    },
  })
  
  useEffect(() => {
    if (!missionStatement?.confirmed) {
      router.push('/initial')
      return
    }
    
    // 如果已有框架，直接使用，避免重复调用AI
    if (existingFramework) {
      setParsedFramework(existingFramework)
      const pillarData = mapToEnergyPillarData(existingFramework)
      setEnergyPillarData(pillarData)
      setMarkdownContent(existingFramework.rawMarkdown)
      setShowConfirmation(true)
      return
    }
    
    // 只有在没有内容时才调用AI
    if (!content && !isStreaming) {
      sendMessage('universal', {
        FOKAL_POINT: missionStatement.content,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleConfirmPersonalization = async () => {
    setIsNavigating(true)
    await confirmPersonalization()
    router.push('/diagnosis')
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">通用行动框架</h1>
              <p className="text-sm text-muted-foreground">
                步骤 3/7
              </p>
            </div>
            {showConfirmation && (
              <Button 
                onClick={handleConfirmPersonalization} 
                size="lg"
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    处理中...
                  </>
                ) : (
                  <>
                    生成个性化方案
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
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
                thinkingText="正在构建通用框架，分析核心模块和系统动态..."
              />
              
              {(content || markdownContent) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="p-6">
                    <StreamingMessage
                      content={content || markdownContent}
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
                  <Box className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
                  <p className="text-muted-foreground">
                    等待框架生成中...
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
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
