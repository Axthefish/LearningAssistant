/**
 * 3D场景数据映射器
 * 将AI生成的框架数据转换为3D可视化所需的结构
 */

import type { UniversalFramework, PersonalizedFramework } from './markdown-parser'

export interface Node3D {
  id: string
  moduleId: string
  moduleName: string
  levelIndex: number
  position: [number, number, number]
  color: string
  label: string
  description: string
  status?: 'strength' | 'opportunity' | 'maintenance'
  scale?: number
  recommendations?: string[]
}

export interface Connection3D {
  from: string
  to: string
  type: 'evolution' | 'synergy' | 'tradeoff' | 'dependency' | 'feedback'
  color: string
  label?: string
}

export interface Scene3DData {
  nodes: Node3D[]
  connections: Connection3D[]
  metadata: {
    systemName: string
    centerPosition: [number, number, number]
  }
}

/**
 * 将通用框架转换为3D场景数据
 */
export function mapUniversalFrameworkTo3D(
  framework: UniversalFramework
): Scene3DData {
  const nodes: Node3D[] = []
  const connections: Connection3D[] = []
  
  // 定义4个象限的颜色和位置
  const moduleColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const modulePositions: [number, number, number][] = [
    [4, 0, 4],   // 第一象限
    [-4, 0, 4],  // 第二象限
    [-4, 0, -4], // 第三象限
    [4, 0, -4],  // 第四象限
  ]
  
  // 创建节点（模块 × 层级）
  framework.modules.forEach((module, moduleIndex) => {
    const basePos = modulePositions[moduleIndex % 4]
    const color = moduleColors[moduleIndex % 4]
    
    module.key_actions.forEach((action, actionIndex) => {
      const nodeId = `${moduleIndex}-${actionIndex}`
      
      nodes.push({
        id: nodeId,
        moduleId: `module-${moduleIndex}`,
        moduleName: module.name,
        levelIndex: actionIndex,
        position: [
          basePos[0],
          actionIndex * 3, // 垂直分层
          basePos[2],
        ],
        color,
        label: action.action,
        description: action.example,
      })
      
      // 创建垂直进化线（同模块内的层级连接）
      if (actionIndex > 0) {
        connections.push({
          from: `${moduleIndex}-${actionIndex - 1}`,
          to: nodeId,
          type: 'evolution',
          color: color,
        })
      }
    })
  })
  
  // 创建跨模块连接（基于dynamics）
  if (framework.dynamics) {
    const { synergy, tradeoff, dependency, feedback_loop } = framework.dynamics
    
    // Synergy连接
    if (synergy) {
      const fromModule = framework.modules.findIndex(
        (m) => m.name === synergy.modules_involved[0]
      )
      const toModule = framework.modules.findIndex(
        (m) => m.name === synergy.modules_involved[1]
      )
      if (fromModule !== -1 && toModule !== -1) {
        // 连接中层节点
        const fromLevel = Math.floor(framework.modules[fromModule].key_actions.length / 2)
        const toLevel = Math.floor(framework.modules[toModule].key_actions.length / 2)
        connections.push({
          from: `${fromModule}-${fromLevel}`,
          to: `${toModule}-${toLevel}`,
          type: 'synergy',
          color: '#10b981',
          label: synergy.effect_name,
        })
      }
    }
    
    // Trade-off连接
    if (tradeoff) {
      const fromModule = framework.modules.findIndex(
        (m) => m.name === tradeoff.modules_involved[0]
      )
      const toModule = framework.modules.findIndex(
        (m) => m.name === tradeoff.modules_involved[1]
      )
      if (fromModule !== -1 && toModule !== -1) {
        const fromLevel = Math.floor(framework.modules[fromModule].key_actions.length / 2)
        const toLevel = Math.floor(framework.modules[toModule].key_actions.length / 2)
        connections.push({
          from: `${fromModule}-${fromLevel}`,
          to: `${toModule}-${toLevel}`,
          type: 'tradeoff',
          color: '#f59e0b',
          label: tradeoff.effect_name,
        })
      }
    }
    
    // Dependency连接
    if (dependency) {
      const fromModule = framework.modules.findIndex(
        (m) => m.name === dependency.modules_involved[0]
      )
      const toModule = framework.modules.findIndex(
        (m) => m.name === dependency.modules_involved[1]
      )
      if (fromModule !== -1 && toModule !== -1) {
        // 依赖通常连接底层
        connections.push({
          from: `${fromModule}-0`,
          to: `${toModule}-0`,
          type: 'dependency',
          color: '#8b5cf6',
          label: dependency.effect_name,
        })
      }
    }
    
    // Feedback Loop连接
    if (feedback_loop && feedback_loop.modules_involved.length >= 2) {
      for (let i = 0; i < feedback_loop.modules_involved.length - 1; i++) {
        const fromModule = framework.modules.findIndex(
          (m) => m.name === feedback_loop.modules_involved[i]
        )
        const toModule = framework.modules.findIndex(
          (m) => m.name === feedback_loop.modules_involved[i + 1]
        )
        if (fromModule !== -1 && toModule !== -1) {
          const fromLevel = Math.floor(framework.modules[fromModule].key_actions.length / 2)
          const toLevel = Math.floor(framework.modules[toModule].key_actions.length / 2)
          connections.push({
            from: `${fromModule}-${fromLevel}`,
            to: `${toModule}-${toLevel}`,
            type: 'feedback',
            color: '#ec4899',
            label: i === 0 ? feedback_loop.effect_name : undefined,
          })
        }
      }
    }
  }
  
  return {
    nodes,
    connections,
    metadata: {
      systemName: framework.system_name || 'System',
      centerPosition: [0, 3, 0],
    },
  }
}

/**
 * 将个性化框架转换为3D场景数据（增强版）
 */
export function mapPersonalizedFrameworkTo3D(
  framework: PersonalizedFramework
): Scene3DData {
  // 先获取基础3D数据
  const baseData = mapUniversalFrameworkTo3D(framework)
  
  // 增强节点（添加状态标记）
  if (framework.action_map && framework.action_map.length > 0) {
    baseData.nodes = baseData.nodes.map(node => {
      const actionInfo = framework.action_map.find(
        (a) => {
          // 尝试匹配action label
          const normalizedLabel = node.label.toLowerCase().trim()
          const normalizedAction = a.action.toLowerCase().trim()
          return normalizedLabel.includes(normalizedAction) || 
                 normalizedAction.includes(normalizedLabel)
        }
      )
      
      if (actionInfo) {
        return {
          ...node,
          status: actionInfo.status,
          // 根据状态改变颜色/大小
          color: getStatusColor(actionInfo.status, node.color),
          scale: actionInfo.status === 'opportunity' ? 1.3 : 1.0,
          recommendations: actionInfo.next_moves,
        }
      }
      
      return node
    })
  }
  
  return baseData
}

function getStatusColor(
  status: 'strength' | 'opportunity' | 'maintenance',
  baseColor: string
): string {
  switch (status) {
    case 'strength':
      return '#10b981' // 绿色
    case 'opportunity':
      return '#f97316' // 橙色
    case 'maintenance':
      return baseColor // 保持原色
    default:
      return baseColor
  }
}
