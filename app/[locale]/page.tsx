'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const t = useTranslations('homepage')
  const router = useRouter()
  const locale = useLocale() as Locale
  const goToStep = useStore(state => state.goToStep)
  const currentSession = useStore(state => state.session)
  
  const handleStartPersonalization = async () => {
    await goToStep(1)
    // 跳转到Dashboard或目标输入页
    const dashboardPath = getPathWithLocale('/dashboard', locale)
    router.push(dashboardPath)
  }
  
  const handleContinueUniversal = async () => {
    await goToStep(1)
    // 直接跳转到目标输入页
    const ambitionPath = getPathWithLocale('/ambition', locale)
    router.push(ambitionPath)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background via-background to-background/95">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.36, 0.66, 0.04, 1] }}
        className="w-full max-w-3xl space-y-12 text-center"
      >
        {/* Brand Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-teal-amber mx-auto"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            A Plan Built Just For You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The next few questions will help us understand your specific goals, learning style, 
            and challenges to create a truly effective framework for your growth.
          </p>
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Button
            onClick={handleStartPersonalization}
            size="lg"
            className="w-full max-w-md text-lg h-16 rounded-2xl shadow-2xl hover:shadow-primary/50"
          >
            Start Personalization
          </Button>
          
          <button
            onClick={handleContinueUniversal}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            No Thanks, Continue with Universal...
          </button>
        </motion.div>
        
        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-12"
        >
          <p className="text-sm text-muted-foreground italic">
            &quot;The secret of getting ahead is getting started.&quot; - Mark Twain
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

