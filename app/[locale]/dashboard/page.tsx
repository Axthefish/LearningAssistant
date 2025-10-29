'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Target, Play, History, User } from 'lucide-react'

/**
 * Dashboard 用户中心页面
 * 提供新建目标、继续会话、回顾历史三个入口
 */
export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const router = useRouter()
  const locale = useLocale() as Locale
  const session = useStore(state => state.session)
  const loadAllSessions = useStore(state => state.loadAllSessions)
  const sessions = useStore(state => state.sessions)
  const createNewSession = useStore(state => state.createNewSession)
  
  const [userName, setUserName] = useState('User')
  
  useEffect(() => {
    // 加载历史会话
    loadAllSessions()
    
    // 从localStorage获取用户名（如果有）
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('learning-assistant:user-name')
      if (storedName) setUserName(storedName)
    }
  }, [loadAllSessions])
  
  const handleNewGoal = async () => {
    await createNewSession()
    router.push(getPathWithLocale('/', locale))
  }
  
  const handleResumeSession = () => {
    if (!session) return
    
    // 根据当前步骤跳转到对应页面
    const stepRoutes = {
      1: '/',
      2: '/initial',
      3: '/universal',
      4: '/universal',
      5: '/diagnosis',
      6: '/diagnosis',
      7: '/personalized'
    } as const
    
    const targetRoute = stepRoutes[session.currentStep as keyof typeof stepRoutes]
    if (targetRoute) {
      router.push(getPathWithLocale(targetRoute, locale))
    }
  }
  
  const handleReviewPast = () => {
    router.push(getPathWithLocale('/history', locale))
  }
  
  // 检查是否有进行中的会话
  const hasActiveSession = session && session.currentStep > 1 && session.currentStep < 8
  
  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {t('welcome', { name: userName })}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Action Cards */}
            <div className="space-y-4">
              {/* Start a New Goal */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Card 
                  className="p-8 cursor-pointer hover:border-primary/50 transition-all duration-300 group bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-2 border-amber-500/20 hover:shadow-xl"
                  onClick={handleNewGoal}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {t('newGoal.title')}
                      </h2>
                      <p className="text-muted-foreground">
                        {t('newGoal.description')}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              {/* Resume Session */}
              {hasActiveSession && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Card 
                    className="p-8 cursor-pointer hover:border-primary/50 transition-all duration-300 group bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border-2 border-teal-500/20 hover:shadow-xl"
                    onClick={handleResumeSession}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/30 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {t('resumeSession.title')}
                        </h2>
                        <p className="text-muted-foreground">
                          {session.purposeStatement?.content 
                            ? `"${session.purposeStatement.content.slice(0, 80)}${session.purposeStatement.content.length > 80 ? '...' : ''}"`
                            : t('resumeSession.description')
                          }
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('step', { current: session.currentStep, total: 7 })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
              
              {/* Review Past Sessions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card 
                  className="p-8 cursor-pointer hover:border-primary/50 transition-all duration-300 group bg-card/50 border-2 hover:shadow-xl"
                  onClick={handleReviewPast}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <History className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {t('reviewPast.title')}
                      </h2>
                      <p className="text-muted-foreground">
                        {t('reviewPast.description')}
                      </p>
                      {sessions.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('sessionsCount', { count: sessions.length })}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
            
            {/* Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-8"
            >
              <p className="text-muted-foreground italic">
                {t('quote')}
              </p>
            </motion.div>
          </div>
          
          {/* Right: 3D Decoration (Placeholder) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="w-full h-[600px] rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 flex items-center justify-center relative overflow-hidden">
              {/* 3D Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-pulse" />
              </div>
              <div className="relative z-10 text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center animate-float">
                  <Target className="w-16 h-16 text-primary" />
                </div>
                <p className="text-muted-foreground">{t('decorationText')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

