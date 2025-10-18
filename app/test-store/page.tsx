'use client'

/**
 * Store 功能测试页面
 * Agent 4: State Management Expert
 */

import { useStore, useCurrentStep } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SessionHistory } from '@/components/SessionHistory'

export default function TestStorePage() {
  const session = useStore(state => state.session)
  const setUserInput = useStore(state => state.setUserInput)
  const setMissionStatement = useStore(state => state.setMissionStatement)
  const setUniversalFramework = useStore(state => state.setUniversalFramework)
  const nextStep = useStore(state => state.nextStep)
  const previousStep = useStore(state => state.previousStep)
  const resetSession = useStore(state => state.resetSession)
  const currentStep = useCurrentStep()
  const isLoading = useStore(state => state.isLoading)
  const error = useStore(state => state.error)
  
  const handleTestUserInput = async () => {
    await setUserInput('测试用户输入：我想学习如何更好地管理时间')
  }
  
  const handleTestMissionStatement = async () => {
    await setMissionStatement('提升时间管理能力，实现高效工作和生活平衡', true)
  }
  
  const handleTestUniversalFramework = async () => {
    await setUniversalFramework({
      systemName: '高效时间管理系统',
      systemGoal: '优化时间利用，提升生产力',
      modules: [
        {
          name: '优先级管理',
          coreIdea: '区分重要和紧急任务',
          keyActions: [
            { action: '每日优先级排序', example: '使用艾森豪威尔矩阵' }
          ]
        }
      ],
      dynamics: {},
      rawMarkdown: '# 测试框架',
      timestamp: Date.now()
    })
  }
  
  return (
    <div className="container py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Store 功能测试</h1>
        <p className="text-muted-foreground">测试全局状态管理和持久化功能</p>
      </div>
      
      {error && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <p className="text-destructive">错误: {error}</p>
        </Card>
      )}
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">会话信息</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Session ID</p>
            <p className="font-mono text-sm">{session?.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">当前步骤</p>
            <p className="text-2xl font-bold">{currentStep} / 7</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">创建时间</p>
            <p className="text-sm">
              {session?.createdAt ? new Date(session.createdAt).toLocaleString('zh-CN') : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">更新时间</p>
            <p className="text-sm">
              {session?.updatedAt ? new Date(session.updatedAt).toLocaleString('zh-CN') : '-'}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">测试操作</h2>
        
        <div className="space-y-2">
          <h3 className="font-medium">步骤1: 用户输入</h3>
          <Button onClick={handleTestUserInput} disabled={isLoading}>
            设置测试用户输入
          </Button>
          {session?.userInput && (
            <Card className="p-3 bg-muted">
              <p className="text-sm">{session.userInput.content}</p>
            </Card>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">步骤2: Mission Statement</h3>
          <Button onClick={handleTestMissionStatement} disabled={isLoading}>
            设置测试 Mission Statement
          </Button>
          {session?.missionStatement && (
            <Card className="p-3 bg-muted">
              <p className="text-sm">{session.missionStatement.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                已确认: {session.missionStatement.confirmed ? '是' : '否'}
              </p>
            </Card>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">步骤3: 通用框架</h3>
          <Button onClick={handleTestUniversalFramework} disabled={isLoading}>
            设置测试通用框架
          </Button>
          {session?.universalFramework && (
            <Card className="p-3 bg-muted">
              <p className="text-sm font-medium">{session.universalFramework.systemName}</p>
              <p className="text-sm text-muted-foreground">{session.universalFramework.systemGoal}</p>
              <p className="text-xs text-muted-foreground mt-1">
                模块数: {session.universalFramework.modules.length}
              </p>
            </Card>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">导航控制</h3>
          <div className="flex gap-2">
            <Button onClick={previousStep} disabled={isLoading || currentStep === 1}>
              上一步
            </Button>
            <Button onClick={nextStep} disabled={isLoading || currentStep === 7}>
              下一步
            </Button>
            <Button onClick={resetSession} variant="destructive" disabled={isLoading}>
              重置会话
            </Button>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 space-y-4">
        <SessionHistory />
      </Card>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">完整会话数据 (JSON)</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>
      </Card>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">测试清单</h2>
        <ul className="space-y-1 text-sm">
          <li>✓ 应用启动时自动初始化会话</li>
          <li>✓ 状态更新自动保存到 localStorage</li>
          <li>✓ 刷新页面后状态恢复（请刷新页面测试）</li>
          <li>✓ 步骤导航正常</li>
          <li>✓ 会话历史列表显示</li>
          <li>✓ 删除会话功能</li>
          <li>✓ 切换会话功能</li>
        </ul>
      </div>
    </div>
  )
}

