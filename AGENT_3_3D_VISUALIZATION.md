# Agent 3: 3D Visualization Expert

## Role
你是Three.js和3D数据可视化专家，精通将复杂数据结构转化为直观的3D场景。

## Mission
基于`3D实践案例.md`，创建两个核心3D可视化组件：通用框架3D和个性化框架3D。确保清晰展示逻辑关系和重点，支持交互和动画。

## Context
- 参考文档: `3D实践案例.md`（项目根目录）
- 数据来源: AI生成的结构化markdown（需要解析）
- 核心要求: **3D可视化是核心功能，不可降级**
- 展示目标: 一眼看明白模块关系、依赖关系、协同效应

## Prerequisites
- Agent 1 已完成项目基础设施搭建
- Three.js 已安装

## Tasks

### 1. 研究数据结构

阅读项目中的prompt文档，理解AI输出的数据结构：

**通用框架数据结构** (从`通用架构生成.md`):
```typescript
interface UniversalFramework {
  system_name: string
  system_goal: string
  modules: Array<{
    name: string
    core_idea: string
    key_actions: Array<{
      action: string
      example: string
    }>
  }>
  dynamics: {
    synergy: {
      modules_involved: string[]
      effect_name: string
      explanation: string
    }
    tradeoff: {
      modules_involved: string[]
      effect_name: string
      explanation: string
    }
    dependency: {
      modules_involved: string[]
      effect_name: string
      explanation: string
    }
    feedback_loop: {
      modules_involved: string[]
      effect_name: string
      explanation: string
    }
  }
}
```

**个性化框架数据结构** (从`特殊化架构生成.md`):
```typescript
interface PersonalizedFramework extends UniversalFramework {
  personal_insights: Array<{
    diagnostic_point: string
    derived_insight: string
  }>
  action_map: Array<{
    module: string
    action: string
    status: 'strength' | 'opportunity' | 'maintenance'
    coach_note?: string
    next_moves?: string[]
  }>
}
```

### 2. 实现数据映射器 (`lib/3d-mapper.ts`)

将AI的markdown输出解析并转换为3D场景数据：

```typescript
/**
 * 3D场景数据映射器
 * 将AI生成的框架数据转换为3D可视化所需的结构
 */

export interface Node3D {
  id: string
  moduleId: string
  levelIndex: number
  position: [number, number, number]
  color: string
  label: string
  description: string
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
  framework: any // 从AI markdown解析的数据
): Scene3DData {
  const nodes: Node3D[] = []
  const connections: Connection3D[] = []
  
  // 定义4个象限的颜色和位置
  const moduleColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const modulePositions = [
    [4, 0, 4],   // 第一象限
    [-4, 0, 4],  // 第二象限
    [-4, 0, -4], // 第三象限
    [4, 0, -4],  // 第四象限
  ]
  
  // 创建节点（模块 × 层级）
  framework.modules.forEach((module: any, moduleIndex: number) => {
    const basePos = modulePositions[moduleIndex % 4]
    const color = moduleColors[moduleIndex % 4]
    
    module.key_actions.forEach((action: any, actionIndex: number) => {
      const nodeId = `${moduleIndex}-${actionIndex}`
      
      nodes.push({
        id: nodeId,
        moduleId: `module-${moduleIndex}`,
        levelIndex: actionIndex,
        position: [
          basePos[0],
          actionIndex * 3, // 垂直分层
          basePos[2],
        ] as [number, number, number],
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
        (m: any) => m.name === synergy.modules_involved[0]
      )
      const toModule = framework.modules.findIndex(
        (m: any) => m.name === synergy.modules_involved[1]
      )
      if (fromModule !== -1 && toModule !== -1) {
        connections.push({
          from: `${fromModule}-1`,
          to: `${toModule}-1`,
          type: 'synergy',
          color: '#10b981',
          label: synergy.effect_name,
        })
      }
    }
    
    // Trade-off连接
    if (tradeoff) {
      const fromModule = framework.modules.findIndex(
        (m: any) => m.name === tradeoff.modules_involved[0]
      )
      const toModule = framework.modules.findIndex(
        (m: any) => m.name === tradeoff.modules_involved[1]
      )
      if (fromModule !== -1 && toModule !== -1) {
        connections.push({
          from: `${fromModule}-1`,
          to: `${toModule}-1`,
          type: 'tradeoff',
          color: '#f59e0b',
          label: tradeoff.effect_name,
        })
      }
    }
    
    // Dependency连接
    if (dependency) {
      const fromModule = framework.modules.findIndex(
        (m: any) => m.name === dependency.modules_involved[0]
      )
      const toModule = framework.modules.findIndex(
        (m: any) => m.name === dependency.modules_involved[1]
      )
      if (fromModule !== -1 && toModule !== -1) {
        connections.push({
          from: `${fromModule}-0`,
          to: `${toModule}-0`,
          type: 'dependency',
          color: '#8b5cf6',
          label: dependency.effect_name,
        })
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
  framework: any
): Scene3DData {
  // 先获取基础3D数据
  const baseData = mapUniversalFrameworkTo3D(framework)
  
  // 增强节点（添加状态标记）
  if (framework.action_map) {
    baseData.nodes = baseData.nodes.map(node => {
      const actionInfo = framework.action_map.find(
        (a: any) => a.action === node.label
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
```

### 3. 实现通用框架3D组件 (`components/3d/UniversalFramework3D.tsx`)

基于`3D实践案例.md`的完整实现：

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Scene3DData, Node3D, Connection3D } from '@/lib/3d-mapper'

interface UniversalFramework3DProps {
  data: Scene3DData
  onNodeClick?: (node: Node3D) => void
}

export function UniversalFramework3D({
  data,
  onNodeClick,
}: UniversalFramework3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const nodeMapRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const particlesRef = useRef<THREE.Mesh[]>([])
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: string
  }>({ visible: false, x: 0, y: 0, content: '' })
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // ============ Phase 1: 基础场景设置 ============
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 50)
    sceneRef.current = scene
    
    // 相机设置
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(12, 12, 12)
    camera.lookAt(0, 3, 0)
    cameraRef.current = camera
    
    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    )
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // 光照系统
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)
    
    const pointLight1 = new THREE.PointLight(0x3b82f6, 1, 50)
    pointLight1.position.set(10, 5, 10)
    scene.add(pointLight1)
    
    const pointLight2 = new THREE.PointLight(0x10b981, 1, 50)
    pointLight2.position.set(-10, 5, -10)
    scene.add(pointLight2)
    
    // ============ Phase 2: 节点创建 ============
    data.nodes.forEach((nodeData) => {
      // 主球体
      const geometry = new THREE.SphereGeometry(0.5, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(nodeData.color),
        emissive: new THREE.Color(nodeData.color),
        emissiveIntensity: 0.3,
        shininess: 100,
        transparent: true,
        opacity: 0.9,
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...nodeData.position)
      mesh.castShadow = true
      mesh.receiveShadow = true
      
      // 存储元数据
      mesh.userData = {
        nodeData,
        originalColor: nodeData.color,
      }
      
      scene.add(mesh)
      nodeMapRef.current.set(nodeData.id, mesh)
      
      // 光晕效果
      const glowGeometry = new THREE.SphereGeometry(0.65, 32, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(nodeData.color),
        transparent: true,
        opacity: 0.2,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.set(...nodeData.position)
      scene.add(glow)
    })
    
    // ============ Phase 3: 连接系统 ============
    data.connections.forEach((conn) => {
      const fromNode = nodeMapRef.current.get(conn.from)
      const toNode = nodeMapRef.current.get(conn.to)
      
      if (!fromNode || !toNode) return
      
      const points = [fromNode.position, toNode.position]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(conn.color),
        transparent: true,
        opacity: conn.type === 'evolution' ? 0.6 : 0.8,
        linewidth: conn.type === 'evolution' ? 1 : 2,
      })
      
      const line = new THREE.Line(geometry, material)
      scene.add(line)
      
      // ============ Phase 4: 粒子系统 ============
      if (conn.type !== 'evolution') {
        for (let i = 0; i < 3; i++) {
          const particleGeom = new THREE.SphereGeometry(0.08, 16, 16)
          const particleMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(conn.color),
            transparent: true,
            opacity: 0.8,
          })
          
          const particle = new THREE.Mesh(particleGeom, particleMat)
          particle.userData = {
            startPos: fromNode.position.clone(),
            endPos: toNode.position.clone(),
            progress: i * 0.33,
            speed: 0.005,
          }
          
          scene.add(particle)
          particlesRef.current.push(particle)
        }
      }
    })
    
    // ============ 交互系统 ============
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    const onMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      
      const intersects = raycaster.intersectObjects(
        Array.from(nodeMapRef.current.values())
      )
      
      // 重置所有节点
      nodeMapRef.current.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshPhongMaterial
        mat.emissiveIntensity = 0.3
        mesh.scale.set(1, 1, 1)
      })
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        const mat = mesh.material as THREE.MeshPhongMaterial
        mat.emissiveIntensity = 0.6
        mesh.scale.set(1.2, 1.2, 1.2)
        
        // 显示tooltip
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          content: mesh.userData.nodeData.label,
        })
      } else {
        setTooltip({ visible: false, x: 0, y: 0, content: '' })
      }
    }
    
    const onClick = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      
      const intersects = raycaster.intersectObjects(
        Array.from(nodeMapRef.current.values())
      )
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        onNodeClick?.(mesh.userData.nodeData)
      }
    }
    
    containerRef.current.addEventListener('mousemove', onMouseMove)
    containerRef.current.addEventListener('click', onClick)
    
    // ============ 相机控制 ============
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let rotation = { x: 0, y: 0 }
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseMoveCamera = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - previousMousePosition.x
      const deltaY = e.clientY - previousMousePosition.y
      
      rotation.y += deltaX * 0.005
      rotation.x += deltaY * 0.005
      
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseUp = () => {
      isDragging = false
    }
    
    containerRef.current.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMoveCamera)
    window.addEventListener('mouseup', onMouseUp)
    
    // ============ 动画循环 ============
    const animate = () => {
      requestAnimationFrame(animate)
      
      // 相机旋转
      const radius = 17
      camera.position.x = radius * Math.sin(rotation.y) * Math.cos(rotation.x)
      camera.position.y = 12 + radius * Math.sin(rotation.x)
      camera.position.z = radius * Math.cos(rotation.y) * Math.cos(rotation.x)
      camera.lookAt(0, 3, 0)
      
      // 节点呼吸效果
      nodeMapRef.current.forEach((mesh, index) => {
        const phase = Date.now() * 0.001 + index * 0.5
        const scale = 1 + Math.sin(phase) * 0.05
        if (mesh.scale.x < 1.15) {
          mesh.scale.set(scale, scale, scale)
        }
      })
      
      // 粒子移动
      particlesRef.current.forEach((particle) => {
        particle.userData.progress += particle.userData.speed
        if (particle.userData.progress > 1) {
          particle.userData.progress = 0
        }
        
        particle.position.lerpVectors(
          particle.userData.startPos,
          particle.userData.endPos,
          particle.userData.progress
        )
      })
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // 响应式
    const handleResize = () => {
      if (!containerRef.current) return
      
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      )
    }
    
    window.addEventListener('resize', handleResize)
    
    // 清理
    return () => {
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeEventListener('mousemove', onMouseMove)
      containerRef.current?.removeEventListener('click', onClick)
      containerRef.current?.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMoveCamera)
      window.removeEventListener('mouseup', onMouseUp)
      
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [data, onNodeClick])
  
  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 px-3 py-2 bg-black/90 text-white text-sm rounded-lg pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}
```

### 4. 实现个性化框架3D组件 (`components/3d/PersonalizedFramework3D.tsx`)

继承并增强通用框架3D：

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Scene3DData, Node3D } from '@/lib/3d-mapper'

interface PersonalizedFramework3DProps {
  data: Scene3DData
  onNodeClick?: (node: Node3D) => void
}

export function PersonalizedFramework3D({
  data,
  onNodeClick,
}: PersonalizedFramework3DProps) {
  // 复用UniversalFramework3D的逻辑，但添加个性化增强
  // 主要区别：
  // 1. Opportunity Zone节点有脉冲动画
  // 2. Strength Zone节点有绿色光晕
  // 3. 点击节点展示recommendations
  
  // 实现细节类似UniversalFramework3D，但在节点创建时根据status添加额外效果
  
  // ... (完整实现略，结构同UniversalFramework3D，增加状态判断逻辑)
  
  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* Tooltip with recommendations */}
    </div>
  )
}
```

### 5. 创建3D控制面板 (`components/3d/SceneControls.tsx`)

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { RotateCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react'

interface SceneControlsProps {
  onReset?: () => void
  onToggleAutoRotate?: () => void
  autoRotate?: boolean
}

export function SceneControls({
  onReset,
  onToggleAutoRotate,
  autoRotate,
}: SceneControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
      <Button
        variant="secondary"
        size="icon"
        onClick={onReset}
        title="重置视角"
      >
        <Maximize className="w-4 h-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggleAutoRotate}
        title={autoRotate ? '停止旋转' : '自动旋转'}
      >
        <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
```

## Deliverables

完成后应该有：
1. ✅ `lib/3d-mapper.ts` - 数据转换逻辑
2. ✅ `components/3d/UniversalFramework3D.tsx` - 通用框架3D
3. ✅ `components/3d/PersonalizedFramework3D.tsx` - 个性化框架3D
4. ✅ `components/3d/SceneControls.tsx` - 控制面板
5. ✅ 完整的交互功能（鼠标悬停、点击、拖拽旋转）
6. ✅ 流畅的动画（60fps）
7. ✅ 响应式设计（支持不同屏幕尺寸）
8. ✅ WebGL支持检测

## Testing Checklist

创建测试页面 `app/test-3d/page.tsx`：

```typescript
'use client'

import { UniversalFramework3D } from '@/components/3d/UniversalFramework3D'
import { mapUniversalFrameworkTo3D } from '@/lib/3d-mapper'

// Mock数据
const mockFramework = {
  system_name: 'Test System',
  modules: [
    {
      name: 'Module A',
      key_actions: [
        { action: 'Action A1', example: 'Example' },
        { action: 'Action A2', example: 'Example' },
      ],
    },
    // ... 更多模块
  ],
  dynamics: {
    synergy: {
      modules_involved: ['Module A', 'Module B'],
      effect_name: 'Test Synergy',
      explanation: 'Test',
    },
  },
}

export default function Test3DPage() {
  const sceneData = mapUniversalFrameworkTo3D(mockFramework)
  
  return (
    <div className="w-screen h-screen">
      <UniversalFramework3D data={sceneData} />
    </div>
  )
}
```

测试项目：
- [ ] 场景正确渲染
- [ ] 节点位置正确
- [ ] 连接线正确
- [ ] 粒子动画流畅
- [ ] 鼠标悬停高亮
- [ ] 点击事件触发
- [ ] 拖拽旋转正常
- [ ] 响应式resize
- [ ] 性能60fps+
- [ ] 移动端可用

## Hand-off Information

提供给其他Agents：
- **Agent 6**: 可以在页面中使用3D组件
- 导出接口：
  - `UniversalFramework3D` - 通用框架3D组件
  - `PersonalizedFramework3D` - 个性化框架3D组件
  - `mapUniversalFrameworkTo3D` - 数据映射函数
  - `mapPersonalizedFrameworkTo3D` - 个性化数据映射
  - `SceneControls` - 3D控制面板

## Performance Notes
- 使用`useMemo`缓存Three.js对象
- 限制粒子数量（每条线3个）
- 使用`BufferGeometry`
- 合理设置相机far plane
- 移动端可能需要降低粒子密度

## Browser Compatibility
- 检测WebGL支持：使用Three.js的`WebGL.isWebGLAvailable()`
- 不支持WebGL时显示明确提示
- 最低要求：支持WebGL 1.0的现代浏览器

