# Agent 6: Framework Pages Expert

## Role
你是复杂交互界面设计专家，精通3D可视化集成和多栏布局设计。

## Mission
实现步骤3和步骤7的页面（通用框架展示、个性化框架展示），这些页面需要集成3D可视化，采用左右分屏设计。

## Context
- 步骤3: 展示通用框架 + 3D可视化，询问是否个性化
- 步骤7: 展示个性化框架 + 3D可视化（高亮opportunity zones）
- 左侧：Markdown内容流式展示
- 右侧：3D实时可视化
- 需要数据解析逻辑（AI markdown → 结构化数据 → 3D场景）

## Prerequisites
- Agent 2: AI Integration完成
- Agent 3: 3D Visualization完成
- Agent 4: State Management完成

## Tasks

### 1. 创建Markdown解析器 (`lib/markdown-parser.ts`)

将AI生成的markdown解析为结构化数据：

```typescript
/**
 * Markdown解析器
 * 将AI生成的框架markdown解析为结构化数据
 */

import type { UniversalFramework, PersonalizedFramework } from './types'

/**
 * 解析通用框架markdown
 */
export function parseUniversalFramework(markdown: string): UniversalFramework {
  const lines = markdown.split('\n')
  
  let systemName = ''
  let systemGoal = ''
  const modules: any[] = []
  const dynamics: any = {}
  
  let currentModule: any = null
  let currentSection = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 提取系统名称
    if (trimmed.startsWith('# Universal Action System:')) {
      systemName = trimmed.replace('# Universal Action System:', '').trim()
    }
    
    // 提取模块
    if (trimmed.startsWith('### ') && currentSection === 'modules') {
      if (currentModule) {
        modules.push(currentModule)
      }
      currentModule = {
        name: trimmed.replace('###', '').trim(),
        coreIdea: '',
        keyActions: [],
      }
    }
    
    // 提取核心理念
    if (trimmed.startsWith('*   **Core Idea**:') && currentModule) {
      currentModule.coreIdea = trimmed.replace('*   **Core Idea**:', '').trim()
    }
    
    // 提取关键行动
    if (trimmed.match(/^\*   \*\*(.+?)\*\*:/) && currentModule) {
      const actionMatch = trimmed.match(/^\*   \*\*(.+?)\*\*:\s*(.+)/)
      if (actionMatch) {
        currentModule.keyActions.push({
          action: actionMatch[1],
          example: actionMatch[2] || '',
        })
      }
    }
    
    // 识别章节
    if (trimmed === '## Core Modules: The Pillars of Success') {
      currentSection = 'modules'
    }
    
    if (trimmed === '## System Dynamics: How the Modules Work Together') {
      if (currentModule) {
        modules.push(currentModule)
        currentModule = null
      }
      currentSection = 'dynamics'
    }
    
    // 提取动态关系
    if (currentSection === 'dynamics') {
      if (trimmed.startsWith('### 📈 Synergy:')) {
        dynamics.synergy = parseDynamic(lines, lines.indexOf(line))
      }
      if (trimmed.startsWith('### ⚖️ Trade-off:')) {
        dynamics.tradeoff = parseDynamic(lines, lines.indexOf(line))
      }
      if (trimmed.startsWith('### 🔗 Dependency:')) {
        dynamics.dependency = parseDynamic(lines, lines.indexOf(line))
      }
      if (trimmed.startsWith('### 🔁 Feedback Loop:')) {
        dynamics.feedbackLoop = parseDynamic(lines, lines.indexOf(line))
      }
    }
  }
  
  return {
    systemName,
    systemGoal: systemName, // 简化
    modules,
    dynamics,
    rawMarkdown: markdown,
    timestamp: Date.now(),
  }
}

function parseDynamic(lines: string[], startIndex: number): any {
  const effectName = lines[startIndex].split(':')[1]?.trim() || ''
  let modulesInvolved: string[] = []
  let explanation = ''
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('*   **Interaction**:')) {
      const match = line.match(/`(.+?)`/g)
      if (match) {
        modulesInvolved = match.map(m => m.replace(/`/g, ''))
      }
    }
    
    if (line.startsWith('*   **Result**:')) {
      explanation = line.replace('*   **Result**:', '').trim()
    }
  }
  
  return { modulesInvolved, effectName, explanation }
}

/**
 * 解析个性化框架markdown
 */
export function parsePersonalizedFramework(
  markdown: string,
  baseFramework: UniversalFramework
): PersonalizedFramework {
  const lines = markdown.split('\n')
  
  const personalInsights: any[] = []
  const actionMap: any[] = []
  let superpower = ''
  let firstStep = ''
  
  let currentSection = ''
  let currentModule = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 提取个人洞察
    if (trimmed.startsWith('*   **Regarding')) {
      const match = trimmed.match(/\*\*Regarding (.+?)\*\*:\s*(.+)/)
      if (match) {
        personalInsights.push({
          diagnosticPoint: match[1],
          derivedInsight: match[2],
        })
      }
    }
    
    // 识别模块section
    if (trimmed.startsWith('### Module:')) {
      currentModule = trimmed.replace('### Module:', '').trim()
    }
    
    // 提取action map
    if (trimmed.startsWith('*   **Action**: `')) {
      const actionMatch = trimmed.match(/\*\*Action\*\*: `(.+?)`/)
      if (actionMatch) {
        const action = actionMatch[1]
        
        // 查找status和notes
        let status: 'strength' | 'opportunity' | 'maintenance' = 'maintenance'
        let coachNote = ''
        const nextMoves: string[] = []
        
        // 解析接下来几行
        for (let i = lines.indexOf(line) + 1; i < lines.length; i++) {
          const nextLine = lines[i].trim()
          
          if (nextLine.startsWith('*   **Action**:') || nextLine.startsWith('### Module:')) {
            break
          }
          
          if (nextLine.includes('🟢 Strength Zone')) {
            status = 'strength'
          } else if (nextLine.includes('🟠 Opportunity Zone')) {
            status = 'opportunity'
          } else if (nextLine.includes('🟡 Maintenance Zone')) {
            status = 'maintenance'
          }
          
          if (nextLine.startsWith('*   **Coach\'s Note**:')) {
            coachNote = nextLine.replace('*   **Coach\'s Note**:', '').trim()
          }
          
          if (nextLine.match(/^\*   \*\*.+?\*\*:/)) {
            const moveMatch = nextLine.match(/\*\*(.+?)\*\*:\s*(.+)/)
            if (moveMatch) {
              nextMoves.push(moveMatch[2])
            }
          }
        }
        
        actionMap.push({
          module: currentModule,
          action,
          status,
          coachNote,
          nextMoves: nextMoves.length > 0 ? nextMoves : undefined,
        })
      }
    }
    
    // 提取superpower
    if (trimmed.startsWith('Your path to the next level is clear')) {
      const match = markdown.match(/mastering your current opportunity zones—\*\*(.+?)\*\*—/)
      if (match) {
        superpower = match[1]
      }
    }
    
    // 提取first step
    if (trimmed.includes('The single most impactful first step is to')) {
      const match = trimmed.match(/\*\*(.+?)\*\*/)
      if (match) {
        firstStep = match[1]
      }
    }
  }
  
  return {
    personalInsights,
    actionMap,
    superpower,
    firstStep,
    rawMarkdown: markdown,
    timestamp: Date.now(),
  }
}
```

### 2. 实现步骤3：通用框架页面 (`app/universal/page.tsx`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, useMissionStatement } from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { UniversalFramework3D } from '@/components/3d/UniversalFramework3D'
import { mapUniversalFrameworkTo3D } from '@/lib/3d-mapper'
import { parseUniversalFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Box, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import type { UniversalFramework } from '@/lib/types'

export default function UniversalFrameworkPage() {
  const router = useRouter()
  const missionStatement = useMissionStatement()
  const setUniversalFramework = useStore(state => state.setUniversalFramework)
  const confirmPersonalization = useStore(state => state.confirmPersonalization)
  
  const [parsedFramework, setParsedFramework] = useState<UniversalFramework | null>(null)
  const [scene3DData, setScene3DData] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const { content, isStreaming, sendMessage } = useChat({
    onFinish: (finalContent) => {
      // 解析markdown为结构化数据
      const parsed = parseUniversalFramework(finalContent)
      setParsedFramework(parsed)
      
      // 转换为3D场景数据
      const sceneData = mapUniversalFrameworkTo3D(parsed)
      setScene3DData(sceneData)
      
      // 保存到store
      setUniversalFramework(parsed)
      
      // 显示确认按钮
      setShowConfirmation(true)
    },
  })
  
  useEffect(() => {
    if (!missionStatement?.confirmed) {
      router.push('/initial')
      return
    }
    
    // 调用AI生成通用框架
    sendMessage('universal', {
      FOKAL_POINT: missionStatement.content,
    })
  }, [])
  
  const handleConfirmPersonalization = async () => {
    await confirmPersonalization()
    router.push('/diagnosis')
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">通用行动框架</h1>
              <p className="text-sm text-muted-foreground">
                步骤 3/7
              </p>
            </div>
            {showConfirmation && (
              <Button onClick={handleConfirmPersonalization} size="lg">
                生成个性化方案
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Markdown Content */}
          <div className="overflow-y-auto p-6 border-r">
            <div className="max-w-2xl mx-auto space-y-6">
              <ThinkingProcess
                isThinking={isStreaming}
                thinkingText="正在构建通用框架，分析核心模块和系统动态..."
              />
              
              {content && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="p-6">
                    <StreamingMessage
                      content={content}
                      isStreaming={isStreaming}
                    />
                  </Card>
                </motion.div>
              )}
              
              {showConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky bottom-0 bg-background/95 backdrop-blur p-4 border-t lg:hidden"
                >
                  <Card className="p-4 space-y-4">
                    <p className="font-medium">
                      是否需要为你生成个性化的行动建议？
                    </p>
                    <p className="text-sm text-muted-foreground">
                      通过几个简短的问题，我们可以识别你的优势和机会区域，
                      为你定制最适合的行动路径。
                    </p>
                    <Button
                      onClick={handleConfirmPersonalization}
                      className="w-full"
                      size="lg"
                    >
                      是的，开始个性化分析
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Right: 3D Visualization */}
          <div className="relative bg-muted/20">
            {!scene3DData ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Box className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
                  <p className="text-muted-foreground">
                    等待框架生成中...
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                <UniversalFramework3D
                  data={scene3DData}
                  onNodeClick={(node) => {
                    console.log('Node clicked:', node)
                    // TODO: 显示节点详情modal
                  }}
                />
                
                {/* 3D Controls Info */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                  <p className="font-medium mb-1">💡 提示</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 拖拽旋转查看</li>
                    <li>• 悬停查看详情</li>
                    <li>• 点击节点深入了解</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3. 实现步骤7：个性化框架页面 (`app/personalized/page.tsx`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useStore,
  useUniversalFramework,
  useUserAnswers,
  usePersonalizedFramework as useStoredPersonalizedFramework,
} from '@/lib/store'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { PersonalizedFramework3D } from '@/components/3d/PersonalizedFramework3D'
import { mapPersonalizedFrameworkTo3D } from '@/lib/3d-mapper'
import { parsePersonalizedFramework } from '@/lib/markdown-parser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Share2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PersonalizedFramework } from '@/lib/types'

export default function PersonalizedFrameworkPage() {
  const router = useRouter()
  const framework = useUniversalFramework()
  const userAnswers = useUserAnswers()
  const storedPersonalized = useStoredPersonalizedFramework()
  
  const setPersonalizedFramework = useStore(state => state.setPersonalizedFramework)
  const resetSession = useStore(state => state.resetSession)
  
  const [parsedFramework, setParsedFramework] = useState<PersonalizedFramework | null>(null)
  const [scene3DData, setScene3DData] = useState<any>(null)
  const [isComplete, setIsComplete] = useState(false)
  
  const { content, isStreaming, sendMessage } = useChat({
    onFinish: (finalContent) => {
      if (!framework) return
      
      // 解析markdown
      const parsed = parsePersonalizedFramework(finalContent, framework)
      setParsedFramework(parsed)
      
      // 转换为3D场景数据
      const sceneData = mapPersonalizedFrameworkTo3D({
        ...framework,
        ...parsed,
      })
      setScene3DData(sceneData)
      
      // 保存到store
      setPersonalizedFramework(parsed)
      setIsComplete(true)
    },
  })
  
  useEffect(() => {
    if (!framework || !userAnswers || userAnswers.length === 0) {
      router.push('/diagnosis')
      return
    }
    
    // 如果已有个性化框架，直接展示
    if (storedPersonalized) {
      setParsedFramework(storedPersonalized)
      const sceneData = mapPersonalizedFrameworkTo3D({
        ...framework,
        ...storedPersonalized,
      })
      setScene3DData(sceneData)
      setIsComplete(true)
      return
    }
    
    // 构建用户答案文本
    const answersText = userAnswers
      .map((a, i) => `**问题 ${i + 1}**: ${a.answer}`)
      .join('\n\n')
    
    // 调用AI生成个性化框架
    sendMessage('personalized', {
      UNIVERSAL_ACTION_SYSTEM: framework.rawMarkdown,
      DIAGNOSTIC_POINTS_AND_QUESTIONS: '...', // TODO: 从store获取
      USER_ANSWERS: answersText,
    })
  }, [])
  
  const handleExport = () => {
    if (!content) return
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `个性化行动框架-${Date.now()}.md`
    a.click()
  }
  
  const handleStartNew = async () => {
    if (confirm('确定要开始新的会话吗？当前进度将被保存到历史记录。')) {
      await resetSession()
      router.push('/')
    }
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">你的个性化行动框架</h1>
              <p className="text-sm text-muted-foreground">
                步骤 7/7 - 完成 ✨
              </p>
            </div>
            {isComplete && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
                <Button onClick={handleStartNew}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  开始新会话
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Markdown Content */}
          <div className="overflow-y-auto p-6 border-r">
            <div className="max-w-2xl mx-auto space-y-6">
              <ThinkingProcess
                isThinking={isStreaming}
                thinkingText="正在整合你的答案，生成个性化建议..."
              />
              
              {content && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="p-6">
                    <StreamingMessage
                      content={content}
                      isStreaming={isStreaming}
                    />
                  </Card>
                </motion.div>
              )}
              
              {isComplete && parsedFramework && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky bottom-0 bg-background/95 backdrop-blur p-4 border-t"
                >
                  <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
                    <h3 className="text-xl font-bold">🎯 你的下一步</h3>
                    <p className="text-lg">{parsedFramework.firstStep}</p>
                    <Button size="lg" className="w-full">
                      立即开始
                    </Button>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Right: 3D Visualization */}
          <div className="relative bg-muted/20">
            {!scene3DData ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
                  <p className="text-muted-foreground">
                    正在生成你的个性化3D框架...
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="h-full"
              >
                <PersonalizedFramework3D
                  data={scene3DData}
                  onNodeClick={(node) => {
                    console.log('Node clicked:', node)
                    // TODO: 显示节点详情和recommendations
                  }}
                />
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm space-y-2">
                  <p className="font-medium mb-2">图例</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs">🟢 优势区域</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs">🟠 机会区域</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-xs">🟡 维护区域</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 4. 创建节点详情Modal (`components/NodeDetailModal.tsx`)

```typescript
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Node3D } from '@/lib/3d-mapper'

interface NodeDetailModalProps {
  node: Node3D | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NodeDetailModal({
  node,
  open,
  onOpenChange,
}: NodeDetailModalProps) {
  if (!node) return null
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'strength':
        return <Badge className="bg-green-500">🟢 优势区域</Badge>
      case 'opportunity':
        return <Badge className="bg-orange-500">🟠 机会区域</Badge>
      case 'maintenance':
        return <Badge className="bg-gray-400">🟡 维护区域</Badge>
      default:
        return null
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{node.label}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {node.status && (
            <div>{getStatusBadge(node.status)}</div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">描述</h4>
            <p className="text-muted-foreground">{node.description}</p>
          </div>
          
          {node.recommendations && node.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">🎯 推荐行动</h4>
              <ul className="space-y-2">
                {node.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button onClick={() => onOpenChange(false)} className="w-full">
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## Deliverables

完成后应该有：
1. ✅ `lib/markdown-parser.ts` - Markdown解析器
2. ✅ `app/universal/page.tsx` - 步骤3：通用框架页面
3. ✅ `app/personalized/page.tsx` - 步骤7：个性化框架页面
4. ✅ `components/NodeDetailModal.tsx` - 节点详情弹窗
5. ✅ 左右分屏布局
6. ✅ 3D实时更新
7. ✅ 响应式设计
8. ✅ 导出功能

## Testing Checklist

- [ ] Markdown正确解析为结构化数据
- [ ] 3D场景正确渲染
- [ ] 左侧内容流式展示
- [ ] 右侧3D实时更新
- [ ] 节点点击展示详情
- [ ] 个性化框架高亮opportunity zones
- [ ] 导出功能正常
- [ ] 移动端自适应（3D在下方）
- [ ] 性能流畅

## Hand-off Information

提供给Agent 7（UI Polish）：
- 复杂交互页面已完成
- 可进行细节优化和动画增强

## Notes
- Markdown解析需要robust，处理各种格式
- 3D组件性能关键，需要优化
- 左右分屏在移动端切换为上下布局
- 考虑添加全屏3D模式
- 导出支持PDF和Markdown格式

