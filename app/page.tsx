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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Learning Assistant
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            将你的模糊想法转化为清晰的行动蓝图
          </p>
        </div>
        
        {/* Main Input */}
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-medium">
              告诉我，你想要解决什么问题？
            </label>
            <Textarea
              placeholder="在这里输入你的想法，可以是模糊的、不确定的..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] resize-none text-lg"
              disabled={isSubmitting}
            />
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            size="lg"
            className="w-full text-lg h-14"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin">⏳</span>
                <span>正在处理...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>开始分析</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </Card>
        
        {/* Examples */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            或者试试这些例子：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => setInput(example)}
                className="justify-start text-left h-auto py-3"
                disabled={isSubmitting}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

