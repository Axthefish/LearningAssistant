'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * Onboarding 欢迎页面
 * 让用户选择个性化流程或通用框架
 */
export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const locale = useLocale() as Locale
  const [isNavigating, setIsNavigating] = useState(false)
  
  const handleStartPersonalization = () => {
    setIsNavigating(true)
    // 跳转到首页开始个性化流程
    router.push(getPathWithLocale('/', locale))
  }
  
  const handleSkipToUniversal = () => {
    setIsNavigating(true)
    // 跳转到通用框架页面（跳过个人目标输入）
    router.push(getPathWithLocale('/universal', locale))
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.36, 0.66, 0.04, 1] }}
        className="w-full max-w-3xl text-center space-y-12"
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 mx-auto shadow-2xl"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            {t('title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col items-center gap-4 max-w-md mx-auto"
        >
          <Button
            onClick={handleStartPersonalization}
            disabled={isNavigating}
            size="lg"
            className="w-full text-lg h-16 rounded-2xl group"
          >
            <span className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>{t('startPersonalization')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          
          <Button
            onClick={handleSkipToUniversal}
            disabled={isNavigating}
            variant="ghost"
            size="lg"
            className="text-base text-muted-foreground hover:text-foreground"
          >
            {t('skipToUniversal')}
          </Button>
        </motion.div>
        
        {/* Features Preview (optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-8 text-sm text-muted-foreground"
        >
          <p>{t('features')}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

