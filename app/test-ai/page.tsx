'use client'

import { useState } from 'react'
import { useChat } from '@/lib/hooks/useChat'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ThinkingProcess } from '@/components/chat/ThinkingProcess'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestAIPage() {
  const { content, isStreaming, error, sendMessage } = useChat()
  const [testStatus, setTestStatus] = useState<string>('')
  
  const testInitialPrompt = () => {
    setTestStatus('测试初始目的提取 Prompt...')
    sendMessage('initial', {
      USER_INPUT: '我想提升我的职场影响力',
    })
  }
  
  const testUniversalPrompt = () => {
    setTestStatus('测试通用架构生成 Prompt...')
    sendMessage('universal', {
      FOKAL_POINT: '提升职场影响力：通过系统化地展示专业价值和建立战略关系，成为团队中不可或缺的关键人物。',
    })
  }
  
  const testDiagnosisPrompt = () => {
    setTestStatus('测试诊断问题 Prompt...')
    sendMessage('diagnosis', {
      FOKAL_POINT: '提升职场影响力',
      UNIVERSAL_ACTION_SYSTEM: '示例框架内容...',
    })
  }
  
  const testPersonalizedPrompt = () => {
    setTestStatus('测试个性化架构 Prompt...')
    sendMessage('personalized', {
      UNIVERSAL_ACTION_SYSTEM: '示例框架...',
      DIAGNOSTIC_POINTS_AND_QUESTIONS: '示例诊断问题...',
      USER_ANSWERS: '我通常只专注技术工作，很少主动分享成果。',
    })
  }
  
  return (
    <div className="container py-10 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">AI Integration Test</h1>
        <p className="text-muted-foreground">
          测试 Gemini 2.5 Pro 流式 API 和各个 Prompt 模板
        </p>
      </div>
      
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">测试控制台</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={testInitialPrompt} disabled={isStreaming}>
            测试初始目的提取
          </Button>
          <Button onClick={testUniversalPrompt} disabled={isStreaming}>
            测试通用架构生成
          </Button>
          <Button onClick={testDiagnosisPrompt} disabled={isStreaming}>
            测试诊断问题生成
          </Button>
          <Button onClick={testPersonalizedPrompt} disabled={isStreaming}>
            测试个性化架构生成
          </Button>
        </div>
        {testStatus && (
          <p className="text-sm text-muted-foreground mt-4">{testStatus}</p>
        )}
      </Card>
      
      {error && (
        <Card className="p-6 border-destructive">
          <h3 className="text-lg font-semibold text-destructive mb-2">错误</h3>
          <p className="text-sm">{error.message}</p>
        </Card>
      )}
      
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold">AI 响应</h2>
        
        <ThinkingProcess isThinking={isStreaming} />
        
        {content && (
          <div className="mt-4">
            <StreamingMessage
              content={content}
              isStreaming={isStreaming}
              onStreamComplete={(finalContent) => {
                console.log('Stream completed, final length:', finalContent.length)
              }}
            />
          </div>
        )}
        
        {!content && !isStreaming && (
          <p className="text-muted-foreground text-center py-8">
            点击上方按钮开始测试
          </p>
        )}
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">测试说明</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>✅ 流式输出正常工作</li>
          <li>✅ 思考过程动画显示</li>
          <li>✅ Markdown 渲染正确</li>
          <li>✅ 错误处理完善</li>
          <li>✅ 类 Cursor 的 UX 体验</li>
        </ul>
      </Card>
    </div>
  )
}

