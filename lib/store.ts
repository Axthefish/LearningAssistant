'use client'

/**
 * Zustand 全局状态管理
 * Agent 4: State Management Expert
 */

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
        
        const currentLocale: 'en' | 'zh' = typeof window !== 'undefined' && window.location.pathname.startsWith('/zh') ? 'zh' : 'en'
        const missionChanged = content !== session.missionStatement?.content || currentLocale !== session.missionStatement?.language
        
        const updatedSession: Session = {
          ...session,
          missionStatement: {
            content,
            confirmed,
            timestamp: Date.now(),
            language: currentLocale,
          },
          // 如果使命内容或语言变更，清理后续步骤数据，避免旧数据串场
          universalFramework: missionChanged ? undefined : session.universalFramework,
          diagnosticQuestions: missionChanged ? undefined : session.diagnosticQuestions,
          userAnswers: missionChanged ? undefined : session.userAnswers,
          personalizedFramework: missionChanged ? undefined : session.personalizedFramework,
          updatedAt: Date.now(),
        }
        
        await storage.saveSession(updatedSession)
        set({ session: updatedSession })
      },
      
      // 设置通用框架
      setUniversalFramework: async (framework: UniversalFramework) => {
        const { session } = get()
        if (!session) return
        
        const currentLocale: 'en' | 'zh' = typeof window !== 'undefined' && window.location.pathname.startsWith('/zh') ? 'zh' : 'en'
        const updatedSession: Session = {
          ...session,
          universalFramework: { ...framework, language: currentLocale },
          // 更新通用框架后，清理后续依赖它的数据
          diagnosticQuestions: undefined,
          userAnswers: undefined,
          personalizedFramework: undefined,
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
