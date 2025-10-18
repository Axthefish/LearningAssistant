'use client'

/**
 * 应用状态初始化组件
 * Agent 4: State Management Expert
 */

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

export function StoreInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const initializeSession = useStore(state => state.initializeSession)
  
  useEffect(() => {
    initializeSession().then(() => {
      setIsInitialized(true)
    })
  }, [initializeSession])
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">正在初始化...</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

