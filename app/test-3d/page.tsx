'use client'

import { useState } from 'react'
import { UniversalFramework3D } from '@/components/3d/UniversalFramework3D'
import { PersonalizedFramework3D } from '@/components/3d/PersonalizedFramework3D'
import { SceneControls } from '@/components/3d/SceneControls'
import { parseUniversalFramework, parsePersonalizedFramework } from '@/lib/markdown-parser'
import { mapUniversalFrameworkTo3D, mapPersonalizedFrameworkTo3D } from '@/lib/3d-mapper'
import type { Node3D } from '@/lib/3d-mapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

// Mock数据：通用框架Markdown
const mockUniversalMarkdown = `# Universal Action System: Career Advancement Framework

## Core Modules: The Pillars of Success

### Value Creation
*   **Core Idea**: Building tangible skills and delivering measurable results that contribute to organizational goals.
*   **Key Actions**:
    *   **Technical Excellence**: Develop deep expertise in your domain.
        *   **Example**: Master advanced algorithms, design patterns, or domain-specific knowledge.
    *   **Impact Delivery**: Ship projects that solve real business problems.
        *   **Example**: Launch features that increase revenue or reduce costs.
    *   **Quality Standards**: Maintain high code quality and best practices.
        *   **Example**: Implement comprehensive testing and documentation.

### Strategic Communication
*   **Core Idea**: Effectively articulating your contributions and building visibility across the organization.
*   **Key Actions**:
    *   **Storytelling**: Frame your work in terms of business impact.
        *   **Example**: Translate technical achievements into business outcomes.
    *   **Stakeholder Updates**: Regularly communicate progress to key decision-makers.
        *   **Example**: Send weekly updates to leadership on project milestones.
    *   **Public Speaking**: Share knowledge through presentations and talks.
        *   **Example**: Present at team meetings or industry conferences.

### Network Building
*   **Core Idea**: Cultivating relationships across teams and levels to increase influence and opportunity.
*   **Key Actions**:
    *   **Cross-team Collaboration**: Partner with other teams on shared goals.
        *   **Example**: Lead cross-functional initiatives.
    *   **Mentorship**: Guide junior engineers and share expertise.
        *   **Example**: Mentor 2-3 engineers regularly.
    *   **Relationship Cultivation**: Build genuine connections with peers and leaders.
        *   **Example**: Have regular 1-on-1 coffee chats.

### Strategic Positioning
*   **Core Idea**: Aligning your work with organizational priorities and future opportunities.
*   **Key Actions**:
    *   **Trend Awareness**: Stay informed about industry and company direction.
        *   **Example**: Read quarterly business reviews and tech radar.
    *   **Opportunity Identification**: Spot high-impact projects early.
        *   **Example**: Volunteer for strategic initiatives.
    *   **Personal Branding**: Build reputation as a domain expert.
        *   **Example**: Become the go-to person for specific technologies.

---

## System Dynamics: How the Modules Work Together

### 📈 Synergy: Visibility Multiplier
*   **Interaction**: \`Value Creation\` + \`Strategic Communication\`
*   **Result**: Technical achievements become career capital when effectively communicated. Silent excellence rarely leads to promotion.

### ⚖️ Trade-off: Time Allocation Challenge
*   **Interaction**: \`Value Creation\` vs. \`Network Building\`
*   **Result**: Deep technical work requires focus, while networking requires availability. Balance is key.

### 🔗 Dependency: Foundation Requirement
*   **Interaction**: \`Value Creation\` → \`Strategic Positioning\`
*   **Result**: Strategic positioning only works when backed by solid technical credibility and delivered results.

### 🔁 Feedback Loop: Career Acceleration Cycle
*   **Interaction**: \`Value Creation\` → \`Strategic Communication\` → \`Network Building\` → More opportunities
*   **Result**: Success builds visibility, which attracts better opportunities, creating exponential growth.
`

// Mock数据：个性化框架Markdown
const mockPersonalizedMarkdown = `# Your Personal Action Framework: From Insight to Impact

Based on the universal map and your deep reflections, we can now chart your unique path forward.

## Your Core Personal Insights

*   **Regarding Technical Excellence**: You have strong technical skills but haven't fully translated them into visible business impact.
*   **Regarding Communication**: You tend to focus on doing the work rather than sharing your achievements with stakeholders.

---
## Your Personalized Action Map

This is the personalized version of the universal framework. Each action point is now tagged with a status, highlighting your unique strengths and greatest opportunities.

### Module: Value Creation

*   **Action**: \`Technical Excellence\`
    *   **Status**: \`🟢 Strength Zone\`
    *   **Coach's Note**: Your technical depth is a key differentiator. Continue to build on this foundation.

*   **Action**: \`Impact Delivery\`
    *   **Status**: \`🟡 Maintenance Zone\`
    *   **Coach's Note**: Keep shipping solid work. This is your bread and butter.

*   **Action**: \`Quality Standards\`
    *   **Status**: \`🟢 Strength Zone\`
    *   **Coach's Note**: Your commitment to quality is noticed and appreciated.

### Module: Strategic Communication

*   **Action**: \`Storytelling\`
    *   **Status**: \`🟠 Opportunity Zone\`
    *   **🎯 Your Next Moves**:
        *   **Create Impact Template**: Write a 3-sentence template describing your projects: Problem, Solution, Impact.
        *   **Practice Weekly**: Share one achievement story each week in team meetings.

*   **Action**: \`Stakeholder Updates\`
    *   **Status**: \`🟠 Opportunity Zone\`
    *   **🎯 Your Next Moves**:
        *   **Schedule Recurring Updates**: Set up bi-weekly 15-min syncs with your manager.
        *   **Write Executive Summary**: Create a one-pager highlighting your Q4 achievements.

*   **Action**: \`Public Speaking\`
    *   **Status**: \`🟡 Maintenance Zone\`
    *   **Coach's Note**: Continue presenting when comfortable, but prioritize written communication first.

### Module: Network Building

*   **Action**: \`Cross-team Collaboration\`
    *   **Status**: \`🟡 Maintenance Zone\`
    *   **Coach's Note**: You collaborate well when needed. Keep this steady.

*   **Action**: \`Mentorship\`
    *   **Status**: \`🟢 Strength Zone\`
    *   **Coach's Note**: Your mentorship is valued. This builds your leadership brand.

*   **Action**: \`Relationship Cultivation\`
    *   **Status**: \`🟡 Maintenance Zone\`
    *   **Coach's Note**: Maintain your current relationships while focusing on communication.

### Module: Strategic Positioning

*   **Action**: \`Trend Awareness\`
    *   **Status**: \`🟢 Strength Zone\`
    *   **Coach's Note**: You stay well-informed about technology trends.

*   **Action**: \`Opportunity Identification\`
    *   **Status**: \`🟡 Maintenance Zone\`
    *   **Coach's Note**: Continue spotting good projects.

*   **Action**: \`Personal Branding\`
    *   **Status**: \`🟠 Opportunity Zone\`
    *   **🎯 Your Next Moves**:
        *   **Define Your Niche**: Identify 1-2 technical areas where you want to be known as the expert.
        *   **Share Knowledge**: Write monthly blog posts or internal tech docs on your expertise areas.

---
### Your Emerging Superpower & First Step

Your path to the next level is clear. Your foundational technical strengths are undeniable. By mastering your current opportunity zones—**systematically translating your technical value into visible business impact**—you will unlock your unique professional superpower.

The best part? You can start today. The single most impactful first step is to **create your 3-sentence Impact Template for your last major project**. Taking this small action this week will be the key that unlocks a new way of communicating your value.
`

export default function Test3DPage() {
  const [autoRotate, setAutoRotate] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null)
  const [viewMode, setViewMode] = useState<'universal' | 'personalized'>('universal')
  
  // 解析数据
  const universalFramework = parseUniversalFramework(mockUniversalMarkdown)
  const personalizedFramework = parsePersonalizedFramework(mockPersonalizedMarkdown, universalFramework)
  
  // 转换为3D场景数据
  const universalSceneData = mapUniversalFrameworkTo3D(universalFramework)
  const personalizedSceneData = mapPersonalizedFrameworkTo3D(personalizedFramework)
  
  const handleNodeClick = (node: Node3D) => {
    setSelectedNode(node)
    console.log('Node clicked:', node)
  }
  
  const handleReset = () => {
    window.location.reload()
  }
  
  const handleToggleAutoRotate = () => {
    setAutoRotate(!autoRotate)
  }
  
  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/20 p-4">
        <h1 className="text-2xl font-bold">3D Framework Visualization Test</h1>
        <p className="text-sm text-gray-400 mt-1">
          Testing Universal and Personalized Framework 3D Components
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* 3D View */}
        <div className="flex-1 relative">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="h-full">
            <TabsList className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="universal">通用框架</TabsTrigger>
              <TabsTrigger value="personalized">个性化框架</TabsTrigger>
            </TabsList>
            
            <TabsContent value="universal" className="h-full m-0">
              <UniversalFramework3D
                data={universalSceneData}
                onNodeClick={handleNodeClick}
                autoRotate={autoRotate}
              />
              <SceneControls
                onReset={handleReset}
                onToggleAutoRotate={handleToggleAutoRotate}
                autoRotate={autoRotate}
              />
            </TabsContent>
            
            <TabsContent value="personalized" className="h-full m-0">
              <PersonalizedFramework3D
                data={personalizedSceneData}
                onNodeClick={handleNodeClick}
                autoRotate={autoRotate}
              />
              <SceneControls
                onReset={handleReset}
                onToggleAutoRotate={handleToggleAutoRotate}
                autoRotate={autoRotate}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Side Panel */}
        <div className="w-96 bg-black/50 backdrop-blur-sm border-l border-white/20 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">节点信息</h2>
          
          {selectedNode ? (
            <Card className="bg-white/10 border-white/20 p-4">
              <h3 className="font-semibold text-lg mb-2">{selectedNode.label}</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">模块:</span>
                  <p className="text-white">{selectedNode.moduleName}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">层级:</span>
                  <p className="text-white">Level {selectedNode.levelIndex}</p>
                </div>
                
                <div>
                  <span className="text-gray-400">描述:</span>
                  <p className="text-white">{selectedNode.description}</p>
                </div>
                
                {selectedNode.status && (
                  <div>
                    <span className="text-gray-400">状态:</span>
                    <p className="text-white">
                      {selectedNode.status === 'strength' && '🟢 Strength Zone'}
                      {selectedNode.status === 'opportunity' && '🟠 Opportunity Zone'}
                      {selectedNode.status === 'maintenance' && '🟡 Maintenance Zone'}
                    </p>
                  </div>
                )}
                
                {selectedNode.recommendations && selectedNode.recommendations.length > 0 && (
                  <div>
                    <span className="text-gray-400">建议行动:</span>
                    <ul className="mt-2 space-y-1 text-white">
                      {selectedNode.recommendations.map((rec, i) => (
                        <li key={i} className="pl-2">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="text-gray-400 text-center py-8">
              点击3D场景中的节点查看详细信息
            </div>
          )}
          
          {/* Stats */}
          <div className="mt-6 space-y-2 text-sm">
            <h3 className="font-semibold mb-3">场景统计</h3>
            <div className="flex justify-between">
              <span className="text-gray-400">节点数量:</span>
              <span>{viewMode === 'universal' ? universalSceneData.nodes.length : personalizedSceneData.nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">连接数量:</span>
              <span>{viewMode === 'universal' ? universalSceneData.connections.length : personalizedSceneData.connections.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">模块数量:</span>
              <span>{viewMode === 'universal' ? universalFramework.modules.length : personalizedFramework.modules.length}</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-sm">图例</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>模块 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>模块 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>模块 3</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>模块 4</span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                  <span>进化连接</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-0.5 bg-green-400"></div>
                  <span>协同效应</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-0.5 bg-orange-400"></div>
                  <span>权衡关系</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-purple-400"></div>
                  <span>依赖关系</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

