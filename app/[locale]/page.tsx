'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const t = useTranslations('homepage')
  const router = useRouter()
  const setUserInput = useStore(state => state.setUserInput)
  const goToStep = useStore(state => state.goToStep)
  
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 清理可能导致路由问题的旧数据
  useEffect(() => {
    // 检查并清理旧的localStorage数据结构
    const currentSession = localStorage.getItem('learning-assistant-current-session')
    if (currentSession) {
      try {
        const parsed = JSON.parse(currentSession)
        // 如果数据结构有问题，清除
        if (!parsed.id || !parsed.createdAt) {
          console.log('Clearing corrupted session data')
          localStorage.removeItem('learning-assistant-current-session')
        }
      } catch (e) {
        console.log('Clearing invalid session data')
        localStorage.removeItem('learning-assistant-current-session')
      }
    }
  }, [])
  
  const handleSubmit = async () => {
    if (!input.trim()) return
    
    setIsSubmitting(true)
    
    // 保存用户输入
    await setUserInput(input)
    await goToStep(2)
    
    // 跳转到步骤2
    router.push('/initial')
  }
  
  const examples = [
    '我想提升职场影响力',
    '如何更好地管理团队',
    '想要系统地学习AI技术',
    '改善工作生活平衡',
  ]
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
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

