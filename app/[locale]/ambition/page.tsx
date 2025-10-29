'use client'

/**
 * Ambition Input Page
 * 目标输入页 - "What's Your Ambition?"
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { HelpCircle, Bell, User } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AmbitionPage() {
  const router = useRouter()
  const locale = useLocale() as Locale
  const setUserInput = useStore(state => state.setUserInput)
  const goToStep = useStore(state => state.goToStep)
  
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) return
    
    setIsSubmitting(true)
    
    try {
      // 保存用户输入
      await setUserInput(input)
      await goToStep(2)
      
      // 跳转到Mission Review页面
      const missionPath = getPathWithLocale('/mission-review', locale)
      router.push(missionPath)
    } catch (error) {
      console.error('Failed to submit ambition:', error)
      setIsSubmitting(false)
    }
  }

  const exampleText = `e.g., 'I want to become a better public speaker to advance in my career' or 'I feel stuck and want to find a more fulfilling professional path.'`

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-teal-amber flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-bold">AmbitionAI</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal to-amber flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold"
            >
              What&apos;s Your Ambition?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Describe your aspiration in your own words. The more detail, the better our AI can help you.
            </motion.p>
          </div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={exampleText}
              className="min-h-[300px] text-lg resize-none rounded-2xl border-2 border-border/50 focus:border-primary/50 bg-card p-8 leading-relaxed"
              disabled={isSubmitting}
            />

            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isSubmitting}
                size="lg"
                className="px-12 h-14 text-lg rounded-2xl shadow-xl hover:shadow-2xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  'Analyze My Goal'
                )}
              </Button>
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              💡 Tip: Include both what you want to achieve and why it matters to you
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

