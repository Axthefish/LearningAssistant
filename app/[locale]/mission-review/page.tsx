'use client'

/**
 * Mission Review Page
 * Mission精炼页 - 显示AI精炼后的mission + blind spots
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore, useUserInput } from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { Sidebar } from '@/components/Sidebar'
import { StepIndicator } from '@/components/StepIndicator'
import { BlindSpotCard } from '@/components/BlindSpotCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { Edit2, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MissionReviewPage() {
  const router = useRouter()
  const locale = useLocale() as Locale
  const userInput = useUserInput()
  const setPurposeStatement = useStore(state => state.setPurposeStatement)
  const goToStep = useStore(state => state.goToStep)
  const purposeStatement = useStore(state => state.session?.purposeStatement)
  
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
      router.push(getPathWithLocale('/ambition', locale))
      return
    }
    
    // 如果已有 Purpose Statement，直接使用
    if (purposeStatement?.content) {
      setEditedContent(purposeStatement.content)
      return
    }
    
    // 调用AI生成Purpose Statement
    if (!content && !isStreaming) {
      sendMessage('purpose', {
        INITIAL_USER_INPUT: userInput.content,
      }, locale)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleConfirm = async () => {
    const finalContent = (isEditing ? editedContent : content) || ''
    
    // 保存 Purpose Statement
    await setPurposeStatement(finalContent, true)
    await goToStep(3)
    
    setIsConfirmed(true)
    
    // 跳转到Universal Framework页
    router.push(getPathWithLocale('/universal', locale))
  }

  // Mock blind spots data
  const blindSpots = [
    {
      title: 'Resource Allocation',
      description: 'Ensuring sufficient funding and talent to support both platform development and aggressive market entry simultaneously.'
    },
    {
      title: 'Market Timing',
      description: 'The target market of early-stage startups is volatile; a downturn could significantly impact customer acquisition.'
    },
    {
      title: 'Data Privacy',
      description: 'Handling sensitive startup data requires robust security measures to build and maintain user trust.'
    }
  ]

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-8">
          {/* Progress Indicator */}
          <StepIndicator currentStep={2} totalSteps={4} title="Mission Refinement" />
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="text-4xl font-bold">Review Your Mission Statement</h1>
            <p className="text-lg text-muted-foreground">
              Our AI has refined your initial thoughts into a clear mission. Review it below and make any edits you see fit.
            </p>
          </motion.div>

          {/* Mission Statement Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Mission:</h2>
                {!isEditing && !isStreaming && content && (
                  <Button
                    onClick={() => {
                      setIsEditing(true)
                      setEditedContent(content)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Statement
                  </Button>
                )}
              </div>

              {isStreaming && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>AI is refining your mission...</span>
                  </div>
                </div>
              )}

              {content && !isEditing && (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <StreamingMessage content={content} isStreaming={isStreaming} />
                </div>
              )}

              {isEditing && (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[200px] text-lg"
                />
              )}

              {isEditing && (
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedContent(content)
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Blind Spots Section */}
          {content && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
                <h2 className="text-2xl font-bold">Potential Blind Spots to Consider</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {blindSpots.map((spot, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <BlindSpotCard title={spot.title} description={spot.description} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {content && !isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end gap-4"
            >
              <Button
                onClick={handleConfirm}
                disabled={isConfirmed}
                size="lg"
                className="px-8"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirm Mission
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

