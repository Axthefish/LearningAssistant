'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore, usePurposeStatement } from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { StepNavigator } from '@/components/StepNavigator'
import { EnergyPillarSystemPro } from '@/components/3d/EnergyPillarSystemPro'
import { mapToEnergyPillarData } from '@/lib/3d-mapper'
import { parseUniversalFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import type { UniversalFramework } from '@/lib/types'
import type { EnergyPillarData } from '@/lib/3d-mapper'

export default function UniversalFrameworkPage() {
  const t = useTranslations('universal')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const locale = useLocale() as Locale
  const { toast } = useToast()
  const purposeStatement = usePurposeStatement()
  const existingFramework = useStore(state => state.session?.universalFramework)
  const setUniversalFramework = useStore(state => state.setUniversalFramework)
  const confirmPersonalization = useStore(state => state.confirmPersonalization)
  const previousStep = useStore(state => state.previousStep)
  
  const [parsedFramework, setParsedFramework] = useState<UniversalFramework | null>(null)
  const [energyPillarData, setEnergyPillarData] = useState<EnergyPillarData | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  
  const { content, isStreaming, error, sendMessage, abort, retry } = useChat({
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
    if (!purposeStatement?.confirmed) {
      router.push(getPathWithLocale('/initial', locale))
      return
    }
    
    // 如果已有框架但语言不一致，忽略旧缓存并重新请求
    if (existingFramework && (existingFramework as any).language === locale) {
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
        PURPOSE_STATEMENT: purposeStatement.content,
      }, locale)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleConfirmPersonalization = async () => {
    setIsNavigating(true)
    await confirmPersonalization()
    router.push(getPathWithLocale('/diagnosis', locale))
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Step Navigator */}
      <StepNavigator />
      
      {/* Header */}
      <div className="border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-apple-h1">{t('title')}</h1>
              <p className="text-apple-caption text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  await previousStep()
                  router.push(getPathWithLocale('/initial', locale))
                }}
                variant="outline"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {tCommon('previous')}
              </Button>
              {showConfirmation && (
                <Button 
                  onClick={handleConfirmPersonalization} 
                  size="lg"
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t('preparing')}
                    </>
                  ) : (
                    <>
                      {t('customizeButton')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - 可调整大小的面板 
          注意：当前针对桌面优化。移动端建议：
          - 使用 @media 检测小屏切为 direction="vertical"
          - 或提供"切换视图"按钮在 Markdown/3D 间切换
          - PanelResizeHandle 在触屏设备上增大命中区 */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left: Markdown Content */}
          <Panel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full overflow-y-auto p-6 scrollbar-thin">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Context说明卡片 */}
                {energyPillarData && (
                  <Card className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
                    <h3 className="text-lg font-semibold mb-3">{t('contextTitle')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('contextBody', { 
                        systemName: energyPillarData.metadata.systemName 
                      })}
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• {t('contextPoints.pillars')}</li>
                      <li>• {t('contextPoints.interactions')}</li>
                      <li>• {t('contextPoints.balance')}</li>
                    </ul>
                  </Card>
                )}
                
                <ThinkingProcess
                  isThinking={isStreaming}
                  thinkingText="正在为你思考..."
                />
                
                {/* Stream Controls */}
                {isStreaming && (
                  <Card className="p-4 flex items-center justify-between bg-muted/30">
                    <p className="text-sm text-muted-foreground">{tCommon('thinking')}</p>
                    <Button variant="outline" size="sm" onClick={abort}>
                      {tCommon('stop')}
                    </Button>
                  </Card>
                )}
                
                {/* Error State with Retry */}
                {error && (
                  <Card className="p-4 bg-destructive/10 border-destructive/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-destructive">{error.message}</p>
                      <Button variant="outline" size="sm" onClick={retry}>
                        {tCommon('retry')}
                      </Button>
                    </div>
                  </Card>
                )}
                
                {(content || markdownContent) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="p-6 relative bg-card/40 backdrop-blur-xl">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(content || markdownContent)
                          toast({
                            title: tCommon('copied'),
                            duration: 2000,
                          })
                        }}
                        className="absolute top-6 right-6 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg transition-colors z-10 shadow-sm"
                      >
                        {tCommon('copy')}
                      </button>
                      <div className="pr-16">
                        <StreamingMessage
                          content={content || markdownContent}
                          isStreaming={isStreaming}
                        />
                      </div>
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
