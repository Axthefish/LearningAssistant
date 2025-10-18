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

