'use client'

/**
 * Dashboard Page
 * 主控制台 - Welcome back界面
 */

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore } from '@/lib/store'
import { Sidebar } from '@/components/Sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Play, History, Settings2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const router = useRouter()
  const locale = useLocale() as Locale
  const currentSession = useStore(state => state.session)
  const goToStep = useStore(state => state.goToStep)
  
  const handleStartNewGoal = async () => {
    await goToStep(2)
    router.push(getPathWithLocale('/ambition', locale))
  }
  
  const handleResumeSession = () => {
    if (!currentSession) return
    
    // 根据当前步骤跳转到对应页面
    const stepRoutes: Record<number, string> = {
      2: '/ambition',
      3: '/universal',
      4: '/universal',
      5: '/diagnosis',
      6: '/diagnosis',
      7: '/personalized'
    }
    
    const targetRoute = stepRoutes[currentSession.currentStep]
    if (targetRoute) {
      router.push(getPathWithLocale(targetRoute, locale))
    }
  }
  
  const handleReviewPastSessions = () => {
    // TODO: 实现历史会话查看
    alert('历史会话功能即将推出')
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Welcome back, Alex
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to shape your future?
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Start New Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className="p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-amber/50 bg-gradient-to-br from-card to-card/50 relative overflow-hidden group"
                onClick={handleStartNewGoal}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber/20 to-amber/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-7 h-7 text-amber" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Start a New Goal</h3>
                  <p className="text-muted-foreground mb-6">
                    Define your next goal and create a clear path forward.
                  </p>
                  <div className="flex items-center gap-2 text-amber font-medium">
                    <span>Begin</span>
                    <Play className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Resume Session */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className={`p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-teal/10 to-card relative overflow-hidden group ${
                  !currentSession ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={currentSession ? handleResumeSession : undefined}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-teal/20 flex items-center justify-center mb-6">
                    <Play className="w-7 h-7 text-teal" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Resume Session</h3>
                  {currentSession ? (
                    <>
                      <p className="text-muted-foreground mb-2">
                        Continue defining &apos;Launch Side Project&apos;.
                      </p>
                      <div className="text-sm text-muted-foreground mb-6">
                        Step {currentSession.currentStep}/7
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground mb-6">
                      No active session found.
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-teal font-medium">
                    <span>Continue</span>
                    <Play className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Review Past Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className="p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 relative overflow-hidden group"
                onClick={handleReviewPastSessions}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                    <History className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Review Past Sessions</h3>
                  <p className="text-muted-foreground mb-6">
                    Reflect on your journey and insights.
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>View History</span>
                    <History className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground italic">
              &quot;The secret of getting ahead is getting started.&quot; - Mark Twain
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

