'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const t = useTranslations('homepage')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const locale = useLocale() as Locale
  const setUserInput = useStore(state => state.setUserInput)
  const goToStep = useStore(state => state.goToStep)
  
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showContinueBanner, setShowContinueBanner] = useState(false)
  const currentSession = useStore(state => state.session)
  
  // 清理可能导致路由问题的旧数据
  useEffect(() => {
    // 检查并清理旧的localStorage数据结构（支持新旧两种键名 + 按语言隔离的新键）
    const oldKey = 'learning-assistant-current-session'
    const newKey = 'learning-assistant:current-session'
    const localizedNewKey = `learning-assistant:current-session:${locale}`
    
    const checkAndClean = (key: string) => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          // 如果数据结构有问题，清除
          if (!parsed.id || !parsed.createdAt) {
            console.log(`Clearing corrupted session data from ${key}`)
            localStorage.removeItem(key)
          }
        } catch (e) {
          console.log(`Clearing invalid session data from ${key}`)
          localStorage.removeItem(key)
        }
      }
    }
    
    checkAndClean(oldKey)
    checkAndClean(newKey)
    checkAndClean(localizedNewKey)
    
    // 取消默认的“继续上次进度”提示（仅在本地显式需要时再打开）
    setShowContinueBanner(false)
  }, [currentSession, locale])
  
  const handleSubmit = async () => {
    if (!input.trim()) return
    
    setIsSubmitting(true)
    
    // 保存用户输入
    await setUserInput(input)
    await goToStep(1)
    
    // 跳转到探索步骤
    const domainPath = getPathWithLocale('/domain', locale)
    router.push(domainPath)
  }
  
  const examples = [
    '我想提升职场影响力',
    '如何更好地管理团队',
    '想要系统地学习AI技术',
    '改善工作生活平衡',
  ]
  
  const handleContinueSession = () => {
    if (!currentSession) return
    
    // 根据当前步骤跳转到对应页面
    const stepRoutes = {
      1: '/domain',
      2: '/topic',
      3: '/initial',
      4: '/universal',
      5: '/diagnosis',
      6: '/diagnosis',
      7: '/personalized'
    } as const
    
    const targetRoute = stepRoutes[currentSession.currentStep as keyof typeof stepRoutes]
    if (targetRoute) {
      router.push(getPathWithLocale(targetRoute, locale))
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      {/* Continue Session Banner */}
      {showContinueBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md"
        >
          <Card className="p-4 shadow-xl border-primary/50 bg-primary/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">{tCommon('continueSession')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  步骤 {currentSession?.currentStep}/7
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleContinueSession}>
                  继续
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowContinueBanner(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.36, 0.66, 0.04, 1] }}
        className="w-full max-w-4xl space-y-12"
      >
        {/* Hero Section - Apple风格 */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.36, 0.66, 0.04, 1] }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto shadow-apple-lg"
          >
            <Sparkles className="w-12 h-12 text-primary" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ lineHeight: '1.2', letterSpacing: '-0.02em' }}
          >
{t('title')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-normal"
            style={{ lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{ 
              __html: t('subtitle')
                .replace(/<highlight>/g, '<span class="text-foreground font-medium">')
                .replace(/<\/highlight>/g, '</span>')
            }}
          />
        </div>
        
        {/* Main Input - Apple风格大卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Card className="p-12 space-y-8 shadow-apple-lg border-0">
            <div className="space-y-3">
              <Textarea
                placeholder={t('inputPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[140px] resize-none text-lg border-0 bg-muted/50 focus:bg-muted/70 rounded-2xl p-6 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-300"
                disabled={isSubmitting}
                style={{ lineHeight: '1.6' }}
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isSubmitting}
              size="lg"
              className="w-full text-lg h-14 rounded-2xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('loadingButton')}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{t('startButton')}</span>
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </Card>
        </motion.div>
        
        {/* Examples + Explorer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-6"
        >
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('scenariosTitle')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['career', 'team', 'learning', 'balance'].map((key, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => setInput(t(`scenarios.${key}`))}
                  className="h-auto py-3 px-4 rounded-xl text-sm"
                  disabled={isSubmitting}
                >
                  {t(`scenarios.${key}`)}
                </Button>
              ))}
            </div>
          </div>
          
        </motion.div>
      </motion.div>
    </div>
  )
}

