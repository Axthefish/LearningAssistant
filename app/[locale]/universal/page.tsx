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
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
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
              <h1 className="text-apple-h1">你的成长蓝图</h1>
              <p className="text-apple-caption text-muted-foreground">
                基于你的目标，我们为你梳理了清晰的行动路径
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
                    准备中...
                  </>
                ) : (
                  <>
                    为我定制
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content - 可调整大小的面板 */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left: Markdown Content */}
          <Panel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full overflow-y-auto p-6 scrollbar-thin">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Context说明卡片 */}
                {energyPillarData && (
                  <Card className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
                    <h3 className="text-lg font-semibold mb-3">🗺️ 为什么需要看全局？</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      很多人容易只盯一个点，但 <strong>{energyPillarData.metadata.systemName}</strong> 其实是个系统
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 看清所有支柱</li>
                      <li>• 理解相互影响</li>
                      <li>• 避免顾此失彼</li>
                    </ul>
                  </Card>
                )}
                
                <ThinkingProcess
                  isThinking={isStreaming}
                  thinkingText="正在为你思考..."
                />
                
                {(content || markdownContent) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="p-6 relative">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(content || markdownContent)
                          alert('已复制到剪贴板')
                        }}
                        className="absolute top-4 right-4 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                      >
                        复制
                      </button>
                      <StreamingMessage
                        content={content || markdownContent}
                        isStreaming={isStreaming}
                      />
                    </Card>
                  </motion.div>
                )}
                
              </div>
            </div>
          </Panel>
          
          {/* 可拖拽的分隔条 */}
          <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors relative group">
            <div className="absolute inset-y-0 -inset-x-1 group-hover:bg-primary/10 transition-colors" />
          </PanelResizeHandle>
          
          {/* Right: 3D Visualization */}
          <Panel defaultSize={50} minSize={30} maxSize={70}>
            <div className="relative bg-muted/20 h-full">
              {!energyPillarData ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto" />
                    <p className="text-apple-body text-muted-foreground mt-4">
                      正在为你梳理...
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
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
