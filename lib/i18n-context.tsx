'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'en' | 'zh'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [messages, setMessages] = useState<Record<string, any>>({})

  useEffect(() => {
    // 从localStorage读取语言偏好
    const saved = localStorage.getItem('preferredLanguage') as Locale
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLocaleState(saved)
    }
  }, [])

  useEffect(() => {
    // 加载对应语言的翻译文件
    import(`@/messages/${locale}.json`).then(mod => {
      setMessages(mod.default)
    })
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('preferredLanguage', newLocale)
  }

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

