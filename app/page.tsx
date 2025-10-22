'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const router = useRouter()
  const setUserInput = useStore(state => state.setUserInput)
  const goToStep = useStore(state => state.goToStep)
  
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
            className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent"
            style={{ lineHeight: '1.1', letterSpacing: '-0.03em' }}
          >
            将想法，变为行动
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-apple-h3 text-muted-foreground max-w-2xl mx-auto font-normal"
          >
            让AI教练帮你把模糊的目标，梳理成清晰的成长路径
          </motion.p>
        </div>
        
        {/* Main Input - Apple风格大卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Card className="p-12 space-y-8 shadow-apple-lg border-0">
            <div className="space-y-4">
              <label className="text-apple-h3 font-semibold text-foreground">
                告诉我，你想要解决什么问题？
              </label>
              <Textarea
                placeholder="例如：我想提升职场影响力、如何平衡工作与生活..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[160px] resize-none text-apple-body border-0 bg-muted/50 focus:bg-muted/70 rounded-xl p-6 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-300"
                disabled={isSubmitting}
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isSubmitting}
              size="lg"
              className="w-full text-apple-body h-16 rounded-2xl shadow-apple-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>正在准备...</span>
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <span className="font-semibold">开始</span>
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </Card>
        </motion.div>
        
        {/* Examples - Apple风格 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-4"
        >
          <p className="text-apple-caption text-muted-foreground text-center font-medium">
            或者试试这些场景
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <Button
                key={index}
                variant="secondary"
                onClick={() => setInput(example)}
                className="justify-start text-left h-auto py-4 px-6 rounded-xl border-0 bg-muted/40 hover:bg-muted/70 transition-all duration-300"
                disabled={isSubmitting}
              >
                <span className="text-apple-body">{example}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

