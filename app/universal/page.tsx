'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, useMissionStatement } from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { UniversalFramework3D } from '@/components/3d/UniversalFramework3D'
import { NodeDetailModal } from '@/components/NodeDetailModal'
import { mapUniversalFrameworkTo3D } from '@/lib/3d-mapper'
import { parseUniversalFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Box } from 'lucide-react'
import { motion } from 'framer-motion'
import type { UniversalFramework } from '@/lib/types'
import type { Scene3DData, Node3D } from '@/lib/3d-mapper'

export default function UniversalFrameworkPage() {
  const router = useRouter()
  const missionStatement = useMissionStatement()
  const setUniversalFramework = useStore(state => state.setUniversalFramework)
  const confirmPersonalization = useStore(state => state.confirmPersonalization)
  
  const [parsedFramework, setParsedFramework] = useState<UniversalFramework | null>(null)
  const [scene3DData, setScene3DData] = useState<Scene3DData | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  const { content, isStreaming, sendMessage } = useChat({
    onFinish: (finalContent) => {
      // 解析markdown为结构化数据
      const parsed = parseUniversalFramework(finalContent)
      setParsedFramework(parsed)
      
      // 转换为3D场景数据
      const sceneData = mapUniversalFrameworkTo3D(parsed)
      setScene3DData(sceneData)
      
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
    
    // 调用AI生成通用框架
    sendMessage('universal', {
      FOKAL_POINT: missionStatement.content,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleConfirmPersonalization = async () => {
    await confirmPersonalization()
    router.push('/diagnosis')
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
              <h1 className="text-2xl font-bold">通用行动框架</h1>
              <p className="text-sm text-muted-foreground">
                步骤 3/7
              </p>
            </div>
            {showConfirmation && (
              <Button onClick={handleConfirmPersonalization} size="lg">
                生成个性化方案
                <ArrowRight className="w-4 h-4 ml-2" />
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
              
              {showConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky bottom-0 bg-background/95 backdrop-blur p-4 border-t lg:hidden"
                >
                  <Card className="p-4 space-y-4">
                    <p className="font-medium">
                      是否需要为你生成个性化的行动建议？
                    </p>
                    <p className="text-sm text-muted-foreground">
                      通过几个简短的问题，我们可以识别你的优势和机会区域，
                      为你定制最适合的行动路径。
                    </p>
                    <Button
                      onClick={handleConfirmPersonalization}
                      className="w-full"
                      size="lg"
                    >
                      是的，开始个性化分析
                      <ArrowRight className="w-4 h-4 ml-2" />
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
                <UniversalFramework3D
                  data={scene3DData}
                  onNodeClick={handleNodeClick}
                />
                
                {/* 3D Controls Info */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                  <p className="font-medium mb-1">💡 提示</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 拖拽旋转查看</li>
                    <li>• 悬停查看详情</li>
                    <li>• 点击节点深入了解</li>
                  </ul>
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
