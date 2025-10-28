'use client'

import { useCurrentStep, useStore } from '@/lib/store'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { getPathWithLocale, type Locale } from '@/i18n/routing'

export function StepNavigator() {
  const currentStep = useCurrentStep()
  const t = useTranslations('stepNavigator')
  const router = useRouter()
  const locale = useLocale() as Locale
  const session = useStore(state => state.session)
  const goToStep = useStore(state => state.goToStep)

  const steps = [
    { number: 1, label: t('step1') },
    { number: 2, label: t('step2') },
    { number: 3, label: t('step3') },
    { number: 4, label: t('step4') },
    { number: 5, label: t('step5') },
    { number: 6, label: t('step6') },
    { number: 7, label: t('step7') },
  ]

  const resolveRoute = (step: number): string | null => {
    switch (step) {
      case 1:
        return '/'
      case 2:
        return '/initial'
      case 3:
      case 4:
        return '/universal'
      case 5:
      case 6:
        return '/diagnosis'
      case 7:
        return '/personalized'
      default:
        return null
    }
  }

  const handleStepClick = async (stepNumber: number) => {
    if (!session || stepNumber > (session.currentStep || 1)) return

    const targetRoute = resolveRoute(stepNumber)
    if (!targetRoute) return

    if (stepNumber !== session.currentStep) {
      await goToStep(stepNumber)
    }

    router.push(getPathWithLocale(targetRoute, locale))
  }

  return (
    <div className="w-full bg-card border-b py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStep
            const isActive = step.number === currentStep
            const isClickable = session ? step.number <= session.currentStep : step.number === 1

            return (
              <div
                key={step.number}
                className={`flex items-center ${
                  isClickable ? 'cursor-pointer select-none' : 'cursor-default'
                }`}
                onClick={() => isClickable && handleStepClick(step.number)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : -1}
              >
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                  </motion.div>
                  <span
                    className={`text-xs mt-2 hidden md:block ${
                      step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 md:w-16 mx-2 ${
                      step.number < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

