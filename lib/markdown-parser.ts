/**
 * Markdown解析器
 * 将AI生成的结构化Markdown转换为TypeScript对象
 */

export interface KeyAction {
  action: string
  example: string
}

export interface Module {
  name: string
  core_idea: string
  key_actions: KeyAction[]
}

export interface Dynamic {
  modules_involved: string[]
  effect_name: string
  explanation: string
}

export interface Dynamics {
  synergy?: Dynamic
  tradeoff?: Dynamic
  dependency?: Dynamic
  feedback_loop?: Dynamic
}

export interface UniversalFramework {
  system_name: string
  system_goal: string
  modules: Module[]
  dynamics: Dynamics
}

export interface PersonalInsight {
  diagnostic_point: string
  derived_insight: string
}

export interface ActionMapItem {
  module: string
  action: string
  status: 'strength' | 'opportunity' | 'maintenance'
  coach_note?: string
  next_moves?: string[]
}

export interface PersonalizedFramework extends UniversalFramework {
  personal_insights: PersonalInsight[]
  action_map: ActionMapItem[]
}

/**
 * 解析通用框架Markdown
 */
export function parseUniversalFramework(markdown: string): UniversalFramework {
  const lines = markdown.split('\n')
  
  // 提取系统名称
  const systemNameMatch = markdown.match(/# Universal Action System: (.+)/)
  const system_name = systemNameMatch ? systemNameMatch[1].trim() : 'Unknown System'
  
  // 提取系统目标（可能在第一段）
  const system_goal = system_name // 简化处理
  
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
          core_idea: '',
          key_actions: []
        }
      }
      
      // Core Idea
      if (currentModule && line.startsWith('*') && line.includes('**Core Idea**')) {
        const ideaMatch = line.match(/\*\*Core Idea\*\*:\s*(.+)/)
        if (ideaMatch) {
          currentModule.core_idea = ideaMatch[1].trim()
        }
      }
      
      // Key Actions
      if (currentModule && line.match(/^\*\s+\*\*(.+?)\*\*:/)) {
        const actionMatch = line.match(/^\*\s+\*\*(.+?)\*\*:\s*(.*)/)
        if (actionMatch) {
          const action = actionMatch[1].trim()
          const description = actionMatch[2].trim()
          
          // 查找Example（在下一行）
          let example = ''
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim()
            const exampleMatch = nextLine.match(/\*\s+\*\*Example\*\*:\s*(.+)/)
            if (exampleMatch) {
              example = exampleMatch[1].trim()
            }
          }
          
          currentModule.key_actions.push({
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
  const dynamics: Dynamics = {}
  
  const synergyMatch = markdown.match(/###\s*📈\s*Synergy:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*\+\s*`(.+?)`\n\s*\*\s*\*\*Result\*\*:\s*([\s\S]+?)(?=\n###|\n\n|$)/)
  if (synergyMatch) {
    dynamics.synergy = {
      effect_name: synergyMatch[1].trim(),
      modules_involved: [synergyMatch[2].trim(), synergyMatch[3].trim()],
      explanation: synergyMatch[4].trim()
    }
  }
  
  const tradeoffMatch = markdown.match(/###\s*⚖️\s*Trade-off:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*vs\.\s*`(.+?)`\n\s*\*\s*\*\*Result\*\*:\s*([\s\S]+?)(?=\n###|\n\n|$)/)
  if (tradeoffMatch) {
    dynamics.tradeoff = {
      effect_name: tradeoffMatch[1].trim(),
      modules_involved: [tradeoffMatch[2].trim(), tradeoffMatch[3].trim()],
      explanation: tradeoffMatch[4].trim()
    }
  }
  
  const dependencyMatch = markdown.match(/###\s*🔗\s*Dependency:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*→\s*`(.+?)`\n\s*\*\s*\*\*Result\*\*:\s*([\s\S]+?)(?=\n###|\n\n|$)/)
  if (dependencyMatch) {
    dynamics.dependency = {
      effect_name: dependencyMatch[1].trim(),
      modules_involved: [dependencyMatch[2].trim(), dependencyMatch[3].trim()],
      explanation: dependencyMatch[4].trim()
    }
  }
  
  const feedbackMatch = markdown.match(/###\s*🔁\s*Feedback Loop:\s*([\s\S]+?)\n\s*\*\s*\*\*Interaction\*\*:\s*`(.+?)`\s*→\s*`(.+?)`\s*→\s*`(.+?)`/)
  if (feedbackMatch) {
    dynamics.feedback_loop = {
      effect_name: feedbackMatch[1].trim(),
      modules_involved: [
        feedbackMatch[2].trim(),
        feedbackMatch[3].trim(),
        feedbackMatch[4].trim()
      ],
      explanation: feedbackMatch[0] // 简化处理
    }
  }
  
  return {
    system_name,
    system_goal,
    modules,
    dynamics
  }
}

/**
 * 解析个性化框架Markdown
 */
export function parsePersonalizedFramework(markdown: string): PersonalizedFramework {
  // 先解析基础框架（可能需要从之前的通用框架继承）
  // 这里假设个性化框架包含完整的模块信息
  const baseFramework = parseUniversalFramework(markdown)
  
  // 解析个人见解
  const personal_insights: PersonalInsight[] = []
  const insightMatches = markdown.matchAll(/\*\s+\*\*Regarding\s+(.+?)\*\*:\s*(.+?)(?=\n\*|\n---|\n##|$)/gs)
  for (const match of insightMatches) {
    personal_insights.push({
      diagnostic_point: match[1].trim(),
      derived_insight: match[2].trim()
    })
  }
  
  // 解析Action Map
  const action_map: ActionMapItem[] = []
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
        action_map.push({
          module: currentModule,
          action: currentAction,
          status: currentStatus,
          coach_note: currentNote || undefined,
          next_moves: currentMoves.length > 0 ? currentMoves : undefined
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
    action_map.push({
      module: currentModule,
      action: currentAction,
      status: currentStatus,
      coach_note: currentNote || undefined,
      next_moves: currentMoves.length > 0 ? currentMoves : undefined
    })
  }
  
  return {
    ...baseFramework,
    personal_insights,
    action_map
  }
}

