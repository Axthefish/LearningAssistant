'use client'

import { useState } from 'react'
import { EnergyPillarSystem } from '@/components/3d/EnergyPillarSystem'
import { mapToEnergyPillarData } from '@/lib/3d-mapper'
import type { EnergyPillar, EnergyPillarData } from '@/lib/3d-mapper'
import type { UniversalFramework } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ============ Mock数据 ============
const mockFramework: UniversalFramework = {
  systemName: '职业晋升飞轮系统',
  systemGoal: '通过系统化的自我提升和价值创造，实现职业发展的加速增长',
  modules: [
    {
      name: '自我定位',
      coreIdea: '清晰认知自己的优势、兴趣和市场价值，建立独特的个人品牌',
      keyActions: [
        {
          action: '优势识别',
          example: '通过反思过去的成功案例，找出你擅长且能带来成就感的技能（如：数据分析、团队协调、创意策划等）',
        },
        {
          action: '市场调研',
          example: '浏览招聘网站和行业报告，了解你所在/目标领域的人才需求和薪资水平',
        },
        {
          action: '品牌塑造',
          example: '在LinkedIn上完善个人简介，发布3篇行业观点文章，建立专业形象',
        },
      ],
    },
    {
      name: '技能提升',
      coreIdea: '持续学习和精进核心能力，保持竞争优势',
      keyActions: [
        {
          action: '目标技能学习',
          example: '报名在线课程（如Coursera、Udemy），每周投入5小时学习Python或产品管理',
        },
        {
          action: '实战应用',
          example: '在当前工作中主动承担一个小项目，应用新学技能并记录成果',
        },
      ],
    },
    {
      name: '价值创造',
      coreIdea: '通过具体成果证明你的能力，为组织和个人带来可见的价值',
      keyActions: [
        {
          action: '量化成果',
          example: '整理过去一年的工作成就，用数据说话（如：提升转化率15%、节省成本20万、管理团队从5人扩展到12人）',
        },
        {
          action: '可见性提升',
          example: '在团队会议上分享项目进展，向上级定期汇报关键成果',
        },
        {
          action: '跨部门协作',
          example: '主动与销售/市场/技术部门合作，推动一个跨职能项目落地',
        },
      ],
    },
    {
      name: '关系网络',
      coreIdea: '建立和维护高质量的职业人脉，获取机会和支持',
      keyActions: [
        {
          action: '内部连接',
          example: '每月约1-2位其他部门的同事喝咖啡，了解他们的工作和挑战',
        },
        {
          action: '外部拓展',
          example: '参加行业meetup或线上社群，每季度认识3位新朋友并保持联系',
        },
      ],
    },
  ],
  dynamics: {
    synergy: {
      modulesInvolved: ['自我定位', '技能提升'],
      effectName: '精准成长',
      explanation: '清晰的自我定位能帮你选择最有价值的技能进行提升，避免盲目学习；而技能的提升又会强化你的定位和品牌',
    },
    tradeoff: {
      modulesInvolved: ['技能提升', '价值创造'],
      effectName: '时间分配',
      explanation: '学习新技能需要时间，但短期内可能无法立即产出可见成果；需要平衡深度学习和快速交付',
    },
    dependency: {
      modulesInvolved: ['价值创造', '关系网络'],
      effectName: '成果铺路',
      explanation: '你创造的价值和成果是拓展人脉的最佳名片；有实力的人更容易获得他人的认可和资源',
    },
    feedbackLoop: {
      modulesInvolved: ['关系网络', '自我定位', '价值创造'],
      effectName: '加速飞轮',
      explanation: '优质人脉带来新机会和反馈 → 帮你更清晰定位 → 创造更大价值 → 吸引更多人脉，形成正向循环',
    },
  },
  rawMarkdown: '',
  timestamp: Date.now(),
}

export default function TestEnergyPillarPage() {
  const [pillarData] = useState<EnergyPillarData>(() => mapToEnergyPillarData(mockFramework))
  const [selectedPillar, setSelectedPillar] = useState<EnergyPillar | null>(null)
  const [showConnections, setShowConnections] = useState(false)
  
  const handlePillarClick = (pillar: EnergyPillar) => {
    setSelectedPillar(pillar)
  }
  
  const handleReset = () => {
    setSelectedPillar(null)
    setShowConnections(false)
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">能量柱系统 - 测试页面</h1>
              <p className="text-sm text-muted-foreground">
                {pillarData.metadata.systemName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showConnections ? 'default' : 'outline'}
                onClick={() => setShowConnections(!showConnections)}
                size="sm"
              >
                {showConnections ? '隐藏' : '显示'}连接线
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                size="sm"
              >
                重置视图
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Left: 3D Scene */}
          <div className="lg:col-span-2 relative bg-muted/20">
            <EnergyPillarSystem
              data={pillarData}
              onPillarClick={handlePillarClick}
            />
          </div>
          
          {/* Right: Control Panel */}
          <div className="border-l overflow-y-auto p-6 space-y-6">
            {/* System Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">系统概览</h3>
              <p className="text-sm text-muted-foreground">
                {pillarData.metadata.systemGoal}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">模块数量</span>
                  <span className="font-medium">{pillarData.pillars.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">动态关系</span>
                  <span className="font-medium">{pillarData.connections.length}</span>
                </div>
              </div>
            </Card>
            
            {/* Pillars List */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">核心模块</h3>
              <div className="space-y-3">
                {pillarData.pillars.map((pillar) => (
                  <button
                    key={pillar.id}
                    onClick={() => handlePillarClick(pillar)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedPillar?.id === pillar.id
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pillar.color }}
                      />
                      <span className="font-medium text-sm">{pillar.moduleName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {pillar.coreIdea}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
            
            {/* Selected Pillar Details */}
            {selectedPillar && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedPillar.color }}
                  />
                  <h3 className="font-semibold">{selectedPillar.moduleName}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedPillar.coreIdea}
                </p>
                
                <Separator className="my-4" />
                
                <h4 className="font-medium text-sm mb-3">关键行动</h4>
                <div className="space-y-3">
                  {selectedPillar.particles.map((particle) => (
                    <div
                      key={particle.id}
                      className="p-3 rounded-lg bg-muted/50"
                    >
                      <div className="font-medium text-sm mb-1">
                        {particle.label}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {particle.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Connections */}
            {showConnections && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">系统动态</h3>
                <div className="space-y-3">
                  {pillarData.connections.map((conn, index) => {
                    const fromPillar = pillarData.pillars.find(p => p.id === conn.from)
                    const toPillar = pillarData.pillars.find(p => p.id === conn.to)
                    
                    return (
                      <div key={index} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            style={{ borderColor: conn.color, color: conn.color }}
                          >
                            {conn.type === 'synergy' && '协同'}
                            {conn.type === 'tradeoff' && '权衡'}
                            {conn.type === 'dependency' && '依赖'}
                            {conn.type === 'feedback' && '反馈'}
                          </Badge>
                          <span className="text-xs font-medium">{conn.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fromPillar?.moduleName} → {toPillar?.moduleName}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
            
            {/* Test Info */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                🧪 测试模式
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                这是能量柱3D可视化系统的测试页面。
                使用mock数据展示功能，验证设计效果和用户体验。
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

