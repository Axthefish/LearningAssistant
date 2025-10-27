/**
 * Markdown解析器
 * 将AI生成的结构化Markdown转换为TypeScript对象
 */

import type {
  UniversalFramework,
  PersonalizedFramework,
  Module,
  KeyAction,
  SystemDynamics,
  DynamicEffect,
  PersonalInsight,
  ActionMapItem,
} from './types'

/**
 * 解析通用框架Markdown
 */
export function parseUniversalFramework(markdown: string): UniversalFramework {
  const lines = markdown.split('\n')
  
  // 提取系统名称
  const systemNameMatch = markdown.match(/# Universal Action System: (.+)/)
  const systemName = systemNameMatch ? systemNameMatch[1].trim() : 'Unknown System'
  
  // 提取系统目标：优先从 Markdown 正文中提取（在标题后、Core Modules 前的段落）
  // 如果没有，再从 systemName 移除装饰词
  let systemGoal = ''
  
  // 尝试匹配标题后、## Core Modules 前的第一个非空段落作为目标描述
  const goalMatch = markdown.match(/# Universal Action System:[^\n]*\n+([\s\S]+?)(?=\n##|\n\*\*|$)/)
  if (goalMatch) {
    // 提取第一段，去除多余空格与换行
    const firstParagraph = goalMatch[1].trim().split('\n')[0].trim()
    if (firstParagraph && firstParagraph.length > 10 && firstParagraph.length < 300) {
      systemGoal = firstParagraph
    }
  }
  
  // 如果未能提取，回退到从 systemName 移除装饰词
  if (!systemGoal) {
    systemGoal = systemName
      .replace(/^The\s+/i, '')
      .replace(/\s+(System|Framework|Flywheel|Model|Approach)$/i, '')
      .trim()
  }
  
  // 如果仍为空，使用 systemName
  if (!systemGoal) systemGoal = systemName
  
  // 解析模块
  const modules: Module[] = []
  let currentModule: Module | null = null
  let inModuleSection = false
  let inDynamicsSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 检测模块区域开始
    if (line.includes('## Core Modules')) {
      inModuleSection = true
      inDynamicsSection = false
      continue
    }
    
    // 检测动态区域开始
    if (line.includes('## System Dynamics')) {
      inModuleSection = false
      inDynamicsSection = true
      if (currentModule) {
        modules.push(currentModule)
        currentModule = null
      }
      continue
    }
    
    // 解析模块
    if (inModuleSection) {
      // 模块标题 (### Module Name)
      if (line.startsWith('###') && !line.includes('Core Modules')) {
        if (currentModule) {
          modules.push(currentModule)
        }
        const moduleName = line.replace(/^###\s*/, '').trim()
        currentModule = {
          name: moduleName,
          coreIdea: '',
          keyActions: []
        }
      }
      
      // Core Idea
      if (currentModule && line.startsWith('*') && line.includes('**Core Idea**')) {
        const ideaMatch = line.match(/\*\*Core Idea\*\*:\s*(.+)/)
        if (ideaMatch) {
          currentModule.coreIdea = ideaMatch[1].trim()
        }
      }
      
      // Key Actions（过滤掉标题本身和没有具体描述的行）
      if (currentModule && line.match(/^\*\s+\*\*(.+?)\*\*:/)) {
        const actionMatch = line.match(/^\*\s+\*\*(.+?)\*\*:\s*(.*)/)
        if (actionMatch) {
          const action = actionMatch[1].trim()
          const description = actionMatch[2].trim()
          
          // 跳过标题行和空描述（Key Actions通常后面没有冒号后内容）
          if (action === 'Key Actions' || action === 'Core Idea' || action === 'Example' || !description) {
            continue
          }
          
          // 查找Example（在下一行）
          let example = ''
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim()
            const exampleMatch = nextLine.match(/\*\s+\*\*Example\*\*:\s*(.+)/)
            if (exampleMatch) {
              example = exampleMatch[1].trim()
            }
          }
          
          currentModule.keyActions.push({
            action: description || action,
            example
          })
        }
      }
    }
  }
  
  // 添加最后一个模块
  if (currentModule) {
    modules.push(currentModule)
  }
  
  // 解析Dynamics
  const dynamics: SystemDynamics = {}
  
  const synergyMatch = markdown.match(/###\s*📈\s*Synergy:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*\+\s*`(.+?)`\n\s*\*\s*\*\*Result\*\*:\s*([\s\S]+?)(?=\n###|\n\n|$)/)
  if (synergyMatch) {
    dynamics.synergy = {
      effectName: synergyMatch[1].trim(),
      modulesInvolved: [synergyMatch[2].trim(), synergyMatch[3].trim()],
      explanation: synergyMatch[4].trim()
    }
  }
  
  const tradeoffMatch = markdown.match(/###\s*⚖️\s*Trade-off:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*vs\.\s*`(.+?)`\n\s*\*\s*\*\*Result\*\*:\s*([\s\S]+?)(?=\n###|\n\n|$)/)
  if (tradeoffMatch) {
    dynamics.tradeoff = {
      effectName: tradeoffMatch[1].trim(),
      modulesInvolved: [tradeoffMatch[2].trim(), tradeoffMatch[3].trim()],
      explanation: tradeoffMatch[4].trim()
    }
  }
  
  const dependencyMatch = markdown.match(/###\s*🔗\s*Dependency:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*→\s*`(.+?)`\n\s*\*\s*\*\*Result\*\*:\s*([\s\S]+?)(?=\n###|\n\n|$)/)
  if (dependencyMatch) {
    dynamics.dependency = {
      effectName: dependencyMatch[1].trim(),
      modulesInvolved: [dependencyMatch[2].trim(), dependencyMatch[3].trim()],
      explanation: dependencyMatch[4].trim()
    }
  }
  
  const feedbackMatch = markdown.match(/###\s*🔁\s*Feedback Loop:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*→\s*`(.+?)`\s*→\s*`(.+?)`/)
  if (feedbackMatch) {
    dynamics.feedbackLoop = {
      effectName: feedbackMatch[1].trim(),
      modulesInvolved: [
        feedbackMatch[2].trim(),
        feedbackMatch[3].trim(),
        feedbackMatch[4].trim()
      ],
      explanation: feedbackMatch[0] // 简化处理
    }
  }
  
  return {
    systemName,
    systemGoal,
    modules,
    dynamics,
    rawMarkdown: markdown,
    timestamp: Date.now(),
  }
}

/**
 * 解析个性化框架Markdown
 */
export function parsePersonalizedFramework(
  markdown: string,
  baseFramework: UniversalFramework
): PersonalizedFramework {
  // 解析个人见解
  const personalInsights: PersonalInsight[] = []
  const insightMatches = markdown.matchAll(/\*\s+\*\*Regarding\s+(.+?)\*\*:\s*(.+?)(?=\n\*|\n---|\n##|$)/gs)
  for (const match of insightMatches) {
    personalInsights.push({
      diagnosticPoint: match[1].trim(),
      derivedInsight: match[2].trim()
    })
  }
  
  // 解析Action Map
  const actionMap: ActionMapItem[] = []
  const lines = markdown.split('\n')
  
  let currentModule = ''
  let currentAction = ''
  let currentStatus: 'strength' | 'opportunity' | 'maintenance' | null = null
  let currentNote = ''
  let currentMoves: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 检测模块
    if (line.startsWith('### Module:')) {
      currentModule = line.replace(/### Module:\s*/, '').trim()
    }
    
    // 检测Action
    if (line.startsWith('*') && line.includes('**Action**:')) {
      // 保存之前的action
      if (currentAction && currentStatus) {
        actionMap.push({
          module: currentModule,
          action: currentAction,
          status: currentStatus,
          coachNote: currentNote || undefined,
          nextMoves: currentMoves.length > 0 ? currentMoves : undefined
        })
      }
      
      // 重置
      const actionMatch = line.match(/\*\*Action\*\*:\s*`(.+?)`/)
      currentAction = actionMatch ? actionMatch[1].trim() : ''
      currentStatus = null
      currentNote = ''
      currentMoves = []
    }
    
    // 检测Status
    if (line.includes('**Status**:')) {
      if (line.includes('🟢') || line.includes('Strength Zone')) {
        currentStatus = 'strength'
      } else if (line.includes('🟠') || line.includes('Opportunity Zone')) {
        currentStatus = 'opportunity'
      } else if (line.includes('🟡') || line.includes('Maintenance Zone')) {
        currentStatus = 'maintenance'
      }
    }
    
    // 检测Coach's Note
    if (line.includes("**Coach's Note**:")) {
      const noteMatch = line.match(/\*\*Coach's Note\*\*:\s*(.+)/)
      if (noteMatch) {
        currentNote = noteMatch[1].trim()
      }
    }
    
    // 检测Next Moves
    if (line.includes('**🎯 Your Next Moves**:')) {
      // 读取接下来的recommendations
      for (let j = i + 1; j < lines.length && j < i + 10; j++) {
        const moveLine = lines[j].trim()
        if (moveLine.startsWith('*') && moveLine.includes('**')) {
          const moveMatch = moveLine.match(/\*\*(.+?)\*\*:\s*(.+)/)
          if (moveMatch) {
            currentMoves.push(moveMatch[2].trim())
          }
        } else if (moveLine.startsWith('###') || moveLine.startsWith('---')) {
          break
        }
      }
    }
  }
  
  // 保存最后一个action
  if (currentAction && currentStatus) {
    actionMap.push({
      module: currentModule,
      action: currentAction,
      status: currentStatus,
      coachNote: currentNote || undefined,
      nextMoves: currentMoves.length > 0 ? currentMoves : undefined
    })
  }
  
  // 解析 superpower 和 firstStep
  let superpower = ''
  let firstStep = ''
  
  // 提取superpower
  const superpowerMatch = markdown.match(/mastering your current opportunity zones—\*\*(.+?)\*\*—/i)
  if (superpowerMatch) {
    superpower = superpowerMatch[1].trim()
  }
  
  // 提取first step
  const firstStepMatch = markdown.match(/The single most impactful first step is to\s+\*\*(.+?)\*\*/i)
  if (firstStepMatch) {
    firstStep = firstStepMatch[1].trim()
  }
  
  return {
    ...baseFramework,
    personalInsights,
    actionMap,
    superpower,
    firstStep,
    rawMarkdown: markdown,
    timestamp: Date.now(),
  }
}

/**
 * 解析诊断问题Markdown
 * 从AI生成的诊断提问markdown中提取问题列表
 */
export interface DiagnosticQuestion {
  id: string
  focusArea: string
  coachTitle: string
  coachExplanation: string
  question: string
}

export function parseDiagnosticQuestions(markdown: string): DiagnosticQuestion[] {
  const questions: DiagnosticQuestion[] = []
  const lines = markdown.split('\n')
  
  let currentFocusArea = ''
  let currentCoachTitle = ''
  let currentCoachExplanation = ''
  let questionCounter = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 匹配 Focus Area (#### Focus Area 1: Title)
    const focusAreaMatch = line.match(/^####\s*Focus Area\s*\d+:\s*(.+)/)
    if (focusAreaMatch) {
      currentFocusArea = focusAreaMatch[1].trim()
      currentCoachTitle = focusAreaMatch[1].trim()
      currentCoachExplanation = ''
      
      // 读取下面的explanation（*   **Here's why this matters**: ...）
      for (let j = i + 1; j < lines.length && j < i + 10; j++) {
        const nextLine = lines[j].trim()
        const explanationMatch = nextLine.match(/^\*\s*\*\*Here's why this matters\*\*:\s*(.+)/)
        if (explanationMatch) {
          currentCoachExplanation = explanationMatch[1].trim()
          break
        }
      }
      continue
    }
    
    // 匹配问题 (**1. Question text**)
    const questionMatch = line.match(/^\*\*(\d+)\.\s*(.+?)\*\*$/)
    if (questionMatch && currentFocusArea) {
      const questionText = questionMatch[2].trim()
      questionCounter++
      
      questions.push({
        id: `q${questionCounter}`,
        focusArea: currentFocusArea,
        coachTitle: currentCoachTitle,
        coachExplanation: currentCoachExplanation,
        question: questionText,
      })
    }
  }
  
  return questions
}

