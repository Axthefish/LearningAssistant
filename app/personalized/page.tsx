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
import { PersonalizedFramework3D } from '@/components/3d/PersonalizedFramework3D'
import { NodeDetailModal } from '@/components/NodeDetailModal'
import { mapPersonalizedFrameworkTo3D } from '@/lib/3d-mapper'
import { parsePersonalizedFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Share2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PersonalizedFramework } from '@/lib/types'
import type { Scene3DData, Node3D } from '@/lib/3d-mapper'

export default function PersonalizedFrameworkPage() {
  const router = useRouter()
  const framework = useUniversalFramework()
  const userAnswers = useUserAnswers()
  const storedPersonalized = useStoredPersonalizedFramework()
  
  const setPersonalizedFramework = useStore(state => state.setPersonalizedFramework)
  const resetSession = useStore(state => state.resetSession)
  
  const [parsedFramework, setParsedFramework] = useState<PersonalizedFramework | null>(null)
  const [scene3DData, setScene3DData] = useState<Scene3DData | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  const { content, isStreaming, sendMessage } = useChat({
    onFinish: (finalContent) => {
      if (!framework) return
      
      // 解析markdown
      const parsed = parsePersonalizedFramework(finalContent, framework)
      setParsedFramework(parsed)
      
      // 转换为3D场景数据
      const sceneData = mapPersonalizedFrameworkTo3D(parsed)
      setScene3DData(sceneData)
      
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
      const sceneData = mapPersonalizedFrameworkTo3D(storedPersonalized)
      setScene3DData(sceneData)
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
  
  const handleNodeClick = (node: Node3D) => {
    setSelectedNode(node)
    setModalOpen(true)
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
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
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
              
              {isComplete && parsedFramework && parsedFramework.firstStep && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky bottom-0 bg-background/95 backdrop-blur p-4 border-t"
                >
                  <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
                    <h3 className="text-xl font-bold">🎯 你的下一步</h3>
                    <p className="text-lg">{parsedFramework.firstStep}</p>
                    <Button size="lg" className="w-full">
                      立即开始
                    </Button>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Right: 3D Visualization */}
          <div className="relative bg-muted/20">
            {!scene3DData ? (
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
                <PersonalizedFramework3D
                  data={scene3DData}
                  onNodeClick={handleNodeClick}
                />
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm space-y-2">
                  <p className="font-medium mb-2">图例</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs">🟢 优势区域</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs">🟠 机会区域</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-xs">🟡 维护区域</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Node Detail Modal */}
      <NodeDetailModal
        node={selectedNode}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
