'use client'

import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { SessionHistory } from '@/components/SessionHistory'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Session History 页面
 * 显示所有历史会话
 */
export default function HistoryPage() {
  const t = useTranslations('sessionHistory')
  const router = useRouter()
  const locale = useLocale() as Locale
  
  const handleBack = () => {
    router.push(getPathWithLocale('/dashboard', locale))
  }
  
  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {t('title')}
              </h1>
              <p className="text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
          </div>
          
          {/* Session History Component */}
          <SessionHistory />
        </motion.div>
      </div>
    </div>
  )
}

