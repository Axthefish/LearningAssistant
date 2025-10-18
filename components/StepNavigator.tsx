'use client'

import { useCurrentStep } from '@/lib/store'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  { number: 1, label: '输入需求' },
  { number: 2, label: '明确目标' },
  { number: 3, label: '通用框架' },
  { number: 4, label: '个性化确认' },
  { number: 5, label: '诊断分析' },
  { number: 6, label: '深度提问' },
  { number: 7, label: '个性化方案' },
]

export function StepNavigator() {
  const currentStep = useCurrentStep()
  
  return (
    <div className="w-full bg-card border-b py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                    step.number < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.number === currentStep
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  animate={
                    step.number === currentStep
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {step.number < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </motion.div>
                <span
                  className={`text-xs mt-2 hidden md:block ${
                    step.number <= currentStep
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 md:w-16 mx-2 ${
                    step.number < currentStep
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

