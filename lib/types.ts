/**
 * 全局数据类型定义
 * Agent 4: State Management Expert
 */

export interface UserInput {
  content: string
  timestamp: number
}

export interface DomainExploration {
  topic: string
  rawMarkdown: string
  timestamp: number
  language?: 'en' | 'zh'
}

export interface MissionStatement {
  content: string
  blindSpot?: string // 新增：潜在盲区提示
  confirmed: boolean
  timestamp: number
  language?: 'en' | 'zh'
}

export interface UniversalFramework {
  systemName: string
  systemGoal: string
  modules: Module[]
  dynamics: SystemDynamics
  rawMarkdown: string
  timestamp: number
  language?: 'en' | 'zh'
}

export interface Module {
  name: string
  coreIdea: string
  differentiator?: string
  keyActions: KeyAction[]
  slug?: string
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
  risk?: DynamicEffect
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

export interface PersonalizedFramework extends UniversalFramework {
  personalInsights: PersonalInsight[]
  actionMap: ActionMapItem[]
  superpower: string
  firstStep: string
  stayOnTrackTactics?: StayOnTrackTactic[] // 新增：执行导航策略
}

export interface StayOnTrackTactic {
  name: string
  description: string
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
  domainExploration?: DomainExploration
  userInput?: UserInput
  missionStatement?: MissionStatement
  universalFramework?: UniversalFramework
  diagnosticQuestions?: DiagnosticQuestion[]
  diagnosticRawMarkdown?: string // 新增：存储诊断阶段 AI 输出原始 Markdown
  userAnswers?: UserAnswer[]
  personalizedFramework?: PersonalizedFramework
  personalizedRawMarkdown?: string
}

