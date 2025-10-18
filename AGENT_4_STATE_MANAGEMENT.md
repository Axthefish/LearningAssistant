# Agent 4: State Management Expert

## Role
你是前端状态管理专家，精通Zustand和浏览器持久化存储方案。

## Mission
实现全局状态管理系统，支持7步流程的数据流转、localStorage持久化，并为未来数据库迁移预留接口。

## Context
- 状态管理库: Zustand（轻量、简单）
- 持久化: localStorage（MVP阶段）
- 未来扩展: 需支持无缝切换到数据库（类ChatGPT历史记录体验）

## Prerequisites
- Agent 1 已完成项目基础设施搭建

## Tasks

### 1. 定义数据类型 (`lib/types.ts`)

```typescript
/**
 * 全局数据类型定义
 */

export interface UserInput {
  content: string
  timestamp: number
}

export interface MissionStatement {
  content: string
  confirmed: boolean
  timestamp: number
}

export interface UniversalFramework {
  systemName: string
  systemGoal: string
  modules: Module[]
  dynamics: SystemDynamics
  rawMarkdown: string
  timestamp: number
}

export interface Module {
  name: string
  coreIdea: string
  differentiator?: string
  keyActions: KeyAction[]
}

export interface KeyAction {
  action: string
  example: string
}

export interface SystemDynamics {
  synergy?: DynamicEffect
  tradeoff?: DynamicEffect
  dependency?: DynamicEffect
  feedbackLoop?: DynamicEffect
}

export interface DynamicEffect {
  modulesInvolved: string[]
  effectName: string
  explanation: string
}

export interface DiagnosticQuestion {
  id: string
  focusArea: string
  coachTitle: string
  coachExplanation: string
  question: string
}

export interface UserAnswer {
  questionId: string
  answer: string
  timestamp: number
}

export interface PersonalizedFramework {
  personalInsights: PersonalInsight[]
  actionMap: ActionMapItem[]
  superpower: string
  firstStep: string
  rawMarkdown: string
  timestamp: number
}

export interface PersonalInsight {
  diagnosticPoint: string
  derivedInsight: string
}

export interface ActionMapItem {
  module: string
  action: string
  status: 'strength' | 'opportunity' | 'maintenance'
  coachNote?: string
  nextMoves?: string[]
}

export interface Session {
  id: string
  createdAt: number
  updatedAt: number
  currentStep: number
  userInput?: UserInput
  missionStatement?: MissionStatement
  universalFramework?: UniversalFramework
  diagnosticQuestions?: DiagnosticQuestion[]
  userAnswers?: UserAnswer[]
  personalizedFramework?: PersonalizedFramework
}
```

### 2. 创建存储抽象层 (`lib/storage.ts`)

为未来数据库迁移预留接口：

```typescript
/**
 * 存储抽象层
 * MVP: localStorage实现
 * 未来: 可切换为数据库（Prisma/Supabase）
 */

import type { Session } from './types'

export interface StorageAdapter {
  saveSession(session: Session): Promise<void>
  getSession(id: string): Promise<Session | null>
  getCurrentSession(): Promise<Session | null>
  listSessions(): Promise<Session[]>
  deleteSession(id: string): Promise<void>
}

/**
 * LocalStorage 实现（MVP阶段）
 */
class LocalStorageAdapter implements StorageAdapter {
  private readonly CURRENT_SESSION_KEY = 'learning-assistant:current-session'
  private readonly SESSIONS_KEY = 'learning-assistant:sessions'
  
  async saveSession(session: Session): Promise<void> {
    // 保存当前会话
    localStorage.setItem(this.CURRENT_SESSION_KEY, JSON.stringify(session))
    
    // 保存到会话列表
    const sessions = await this.listSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }
    
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions))
  }
  
  async getSession(id: string): Promise<Session | null> {
    const sessions = await this.listSessions()
    return sessions.find(s => s.id === id) || null
  }
  
  async getCurrentSession(): Promise<Session | null> {
    const data = localStorage.getItem(this.CURRENT_SESSION_KEY)
    return data ? JSON.parse(data) : null
  }
  
  async listSessions(): Promise<Session[]> {
    const data = localStorage.getItem(this.SESSIONS_KEY)
    return data ? JSON.parse(data) : []
  }
  
  async deleteSession(id: string): Promise<void> {
    const sessions = await this.listSessions()
    const filtered = sessions.filter(s => s.id !== id)
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filtered))
    
    // 如果删除的是当前会话，清空当前会话
    const current = await this.getCurrentSession()
    if (current?.id === id) {
      localStorage.removeItem(this.CURRENT_SESSION_KEY)
    }
  }
}

/**
 * 数据库实现（未来）
 * 示例接口，实际实现时替换
 */
class DatabaseAdapter implements StorageAdapter {
  async saveSession(session: Session): Promise<void> {
    // TODO: 数据库实现
    // await prisma.session.upsert({ ... })
    throw new Error('Not implemented')
  }
  
  async getSession(id: string): Promise<Session | null> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
  
  async getCurrentSession(): Promise<Session | null> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
  
  async listSessions(): Promise<Session[]> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
  
  async deleteSession(id: string): Promise<void> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
}

// 导出当前使用的适配器（MVP使用localStorage）
export const storage: StorageAdapter = new LocalStorageAdapter()

// 未来切换到数据库时，只需改这一行：
// export const storage: StorageAdapter = new DatabaseAdapter()
```

### 3. 实现 Zustand Store (`lib/store.ts`)

```typescript
'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Session,
  UserInput,
  MissionStatement,
  UniversalFramework,
  DiagnosticQuestion,
  UserAnswer,
  PersonalizedFramework,
} from './types'
import { storage } from './storage'

interface AppState {
  // 当前会话
  session: Session | null
  
  // 加载状态
  isLoading: boolean
  error: string | null
  
  // Actions - Session管理
  initializeSession: () => Promise<void>
  createNewSession: () => Promise<void>
  loadSession: (id: string) => Promise<void>
  
  // Actions - 步骤1: 用户输入
  setUserInput: (input: string) => Promise<void>
  
  // Actions - 步骤2: Mission Statement
  setMissionStatement: (content: string, confirmed: boolean) => Promise<void>
  
  // Actions - 步骤3: 通用框架
  setUniversalFramework: (framework: UniversalFramework) => Promise<void>
  
  // Actions - 步骤4: 确认个性化
  confirmPersonalization: () => Promise<void>
  
  // Actions - 步骤5-6: 诊断提问
  setDiagnosticQuestions: (questions: DiagnosticQuestion[]) => Promise<void>
  addUserAnswer: (answer: UserAnswer) => Promise<void>
  
  // Actions - 步骤7: 个性化框架
  setPersonalizedFramework: (framework: PersonalizedFramework) => Promise<void>
  
  // Navigation
  goToStep: (step: number) => Promise<void>
  nextStep: () => Promise<void>
  previousStep: () => Promise<void>
  
  // Utilities
  clearError: () => void
  resetSession: () => Promise<void>
}

export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      session: null,
      isLoading: false,
      error: null,
      
      // 初始化会话（应用启动时调用）
      initializeSession: async () => {
        set({ isLoading: true, error: null })
        
        try {
          let session = await storage.getCurrentSession()
          
          // 如果没有当前会话，创建新会话
          if (!session) {
            session = {
              id: `session-${Date.now()}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              currentStep: 1,
            }
            await storage.saveSession(session)
          }
          
          set({ session, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize',
            isLoading: false,
          })
        }
      },
      
      // 创建新会话
      createNewSession: async () => {
        const newSession: Session = {
          id: `session-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentStep: 1,
        }
        
        await storage.saveSession(newSession)
        set({ session: newSession })
      },
      
      // 加载指定会话
      loadSession: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const session = await storage.getSession(id)
          
          if (!session) {
            throw new Error('Session not found')
          }
          
          await storage.saveSession(session) // 设为当前会话
          set({ session, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load session',
            isLoading: false,
          })
        }
      },
      
      // 设置用户输入
      setUserInput: async (input: string) => {
        const { session } = get()
        if (!session) return
        
        const updatedSession: Session = {
          ...session,
          userInput: {
            content: input,
            timestamp: Date.now(),
          },
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 设置Mission Statement
      setMissionStatement: async (content: string, confirmed: boolean) => {
        const { session } = get()
        if (!session) return
        
        const updatedSession: Session = {
          ...session,
          missionStatement: {
            content,
            confirmed,
            timestamp: Date.now(),
          },
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 设置通用框架
      setUniversalFramework: async (framework: UniversalFramework) => {
        const { session } = get()
        if (!session) return
        
        const updatedSession: Session = {
          ...session,
          universalFramework: framework,
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 确认进入个性化分析
      confirmPersonalization: async () => {
        const { session } = get()
        if (!session) return
        
        const updatedSession: Session = {
          ...session,
          currentStep: 5,
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 设置诊断问题
      setDiagnosticQuestions: async (questions: DiagnosticQuestion[]) => {
        const { session } = get()
        if (!session) return
        
        const updatedSession: Session = {
          ...session,
          diagnosticQuestions: questions,
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 添加用户答案
      addUserAnswer: async (answer: UserAnswer) => {
        const { session } = get()
        if (!session) return
        
        const existingAnswers = session.userAnswers || []
        const updatedAnswers = [
          ...existingAnswers.filter(a => a.questionId !== answer.questionId),
          answer,
        ]
        
        const updatedSession: Session = {
          ...session,
          userAnswers: updatedAnswers,
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 设置个性化框架
      setPersonalizedFramework: async (framework: PersonalizedFramework) => {
        const { session } = get()
        if (!session) return
        
        const updatedSession: Session = {
          ...session,
          personalizedFramework: framework,
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 跳转到指定步骤
      goToStep: async (step: number) => {
        const { session } = get()
        if (!session) return
        
        const updatedSession: Session = {
          ...session,
          currentStep: step,
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 下一步
      nextStep: async () => {
        const { session } = get()
        if (!session) return
        
        const nextStep = Math.min(session.currentStep + 1, 7)
        await get().goToStep(nextStep)
      },
      
      // 上一步
      previousStep: async () => {
        const { session } = get()
        if (!session) return
        
        const prevStep = Math.max(session.currentStep - 1, 1)
        await get().goToStep(prevStep)
      },
      
      // 清除错误
      clearError: () => {
        set({ error: null })
      },
      
      // 重置会话
      resetSession: async () => {
        await get().createNewSession()
      },
    }),
    { name: 'LearningAssistantStore' }
  )
)

/**
 * 便捷选择器 Hooks
 */
export const useCurrentStep = () => useStore(state => state.session?.currentStep || 1)
export const useUserInput = () => useStore(state => state.session?.userInput)
export const useMissionStatement = () => useStore(state => state.session?.missionStatement)
export const useUniversalFramework = () => useStore(state => state.session?.universalFramework)
export const useDiagnosticQuestions = () => useStore(state => state.session?.diagnosticQuestions)
export const useUserAnswers = () => useStore(state => state.session?.userAnswers)
export const usePersonalizedFramework = () => useStore(state => state.session?.personalizedFramework)
```

### 4. 创建初始化Provider (`components/StoreInitializer.tsx`)

```typescript
'use client'

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
```

更新 `app/layout.tsx` 使用Provider：

```typescript
import { StoreInitializer } from '@/components/StoreInitializer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <StoreInitializer>{children}</StoreInitializer>
      </body>
    </html>
  )
}
```

### 5. 创建会话历史组件 (`components/SessionHistory.tsx`)

为未来的历史记录功能预留：

```typescript
'use client'

import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import type { Session } from '@/lib/types'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Clock, Trash2 } from 'lucide-react'

export function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([])
  const loadSession = useStore(state => state.loadSession)
  const currentSession = useStore(state => state.session)
  
  useEffect(() => {
    loadSessions()
  }, [])
  
  const loadSessions = async () => {
    const allSessions = await storage.listSessions()
    setSessions(allSessions.sort((a, b) => b.updatedAt - a.updatedAt))
  }
  
  const handleLoadSession = async (id: string) => {
    await loadSession(id)
  }
  
  const handleDeleteSession = async (id: string) => {
    await storage.deleteSession(id)
    await loadSessions()
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">历史会话</h2>
      
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">暂无历史会话</p>
      ) : (
        <div className="space-y-2">
          {sessions.map(session => (
            <Card
              key={session.id}
              className={`p-4 cursor-pointer hover:bg-muted/50 transition ${
                currentSession?.id === session.id ? 'border-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex-1"
                  onClick={() => handleLoadSession(session.id)}
                >
                  <div className="font-medium">
                    {session.missionStatement?.content.slice(0, 100) || '新会话'}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(session.updatedAt)}</span>
                    <span>•</span>
                    <span>步骤 {session.currentStep}/7</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSession(session.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Deliverables

完成后应该有：
1. ✅ `lib/types.ts` - 完整的类型定义
2. ✅ `lib/storage.ts` - 存储抽象层（localStorage + 数据库接口）
3. ✅ `lib/store.ts` - Zustand全局状态管理
4. ✅ `components/StoreInitializer.tsx` - 初始化Provider
5. ✅ `components/SessionHistory.tsx` - 会话历史组件
6. ✅ 所有操作都自动持久化到localStorage
7. ✅ 预留数据库迁移接口

## Testing Checklist

创建测试页面 `app/test-store/page.tsx`：

```typescript
'use client'

import { useStore, useCurrentStep } from '@/lib/store'
import { Button } from '@/components/ui/button'

export default function TestStorePage() {
  const session = useStore(state => state.session)
  const setUserInput = useStore(state => state.setUserInput)
  const nextStep = useStore(state => state.nextStep)
  const resetSession = useStore(state => state.resetSession)
  const currentStep = useCurrentStep()
  
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Store Test</h1>
      
      <div className="space-y-2">
        <p>Current Step: {currentStep}</p>
        <p>Session ID: {session?.id}</p>
      </div>
      
      <div className="space-x-2">
        <Button onClick={() => setUserInput('Test input')}>
          Set User Input
        </Button>
        <Button onClick={nextStep}>Next Step</Button>
        <Button onClick={resetSession}>Reset Session</Button>
      </div>
      
      <pre className="bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}
```

测试项目：
- [ ] 应用启动时自动初始化会话
- [ ] 状态更新自动保存到localStorage
- [ ] 刷新页面后状态恢复
- [ ] 步骤导航正常
- [ ] 会话历史列表正常
- [ ] 删除会话正常
- [ ] 切换会话正常

## Hand-off Information

提供给其他Agents：
- **Agent 5 & 6**: 使用store管理页面状态
- 导出接口：
  - `useStore()` - 访问全局状态和操作
  - `useCurrentStep()` - 当前步骤
  - `useUserInput()` - 用户输入
  - `useMissionStatement()` - Mission Statement
  - 等便捷hooks
  - 所有类型定义在 `lib/types.ts`

## Migration Path to Database

未来迁移到数据库时：

1. 实现 `DatabaseAdapter` 类（在`lib/storage.ts`）
2. 添加数据库schema（Prisma/Supabase）
3. 更改一行代码：`export const storage = new DatabaseAdapter()`
4. 其他代码无需改动

示例Prisma Schema：
```prisma
model Session {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  currentStep Int    @default(1)
  data      Json     // 存储整个session对象
  userId    String?  // 未来支持多用户
}
```

## Notes
- 所有异步操作都有错误处理
- Store使用devtools便于调试
- localStorage有5MB限制，session数据控制在合理范围
- 未来支持用户账户系统时，添加userId字段

