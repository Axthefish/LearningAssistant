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
  
  const missionStatement = useStore(state => state.session?.missionStatement)
  
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
    
    // 如果已有Mission Statement，直接使用，避免重复调用AI
    if (missionStatement?.content && !missionStatement.confirmed) {
      setEditedContent(missionStatement.content)
      return
    }
    
    // 只有在没有内容时才调用AI
    if (!content && !isStreaming) {
      sendMessage('initial', {
        USER_INPUT: userInput.content,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Header - Apple风格简洁导航 */}
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-apple-body">返回</span>
          </Button>
        </div>
        
        {/* Title - Apple大标题 */}
        <div className="space-y-4 text-center">
          <h1 className="text-apple-hero">明确你的目标</h1>
          <p className="text-apple-h3 text-muted-foreground max-w-3xl mx-auto font-normal">
            基于你的想法，我们一起提炼出清晰的使命
          </p>
        </div>
        
        {/* User Input Recap - Apple风格卡片 */}
        <Card className="p-8 bg-muted/20 border-0">
          <p className="text-apple-caption text-muted-foreground mb-3 font-medium">你的想法</p>
          <p className="text-apple-body leading-relaxed">{userInput?.content}</p>
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

