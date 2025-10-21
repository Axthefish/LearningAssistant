'use client'

/**
 * 能量柱系统 - 3D可视化核心组件
 * 
 * 设计理念：
 * - 4根发光能量柱 = 4个核心支柱模块
 * - 信息即时可读：一眼看到结构
 * - 渐进式交互：默认简洁 → Hover详情 → Click深入
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import type { EnergyPillarData, EnergyPillar } from '@/lib/3d-mapper'

interface EnergyPillarSystemProps {
  data: EnergyPillarData
  onPillarClick?: (pillar: EnergyPillar) => void
  showConnections?: boolean
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  title: string
  subtitle: string
}

export function EnergyPillarSystem({ data, onPillarClick, showConnections = false }: EnergyPillarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const pillarsRef = useRef<Map<string, THREE.Group>>(new Map())
  const particlesRef = useRef<Map<string, THREE.Mesh[]>>(new Map())
  const connectionsRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number>(0)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null)
  const [focusedPillar, setFocusedPillar] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    subtitle: '',
  })
  
  // ============ 初始化3D场景 ============
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const pillars = pillarsRef.current
    const particles = particlesRef.current
    
    // 场景设置
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    sceneRef.current = scene
    
    // 星空背景
    const starsGeo = new THREE.BufferGeometry()
    const starVertices = []
    for (let i = 0; i < 500; i++) {
      starVertices.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      )
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    })
    scene.add(new THREE.Points(starsGeo, starsMat))
    
    // 相机设置
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 6, 16)
    camera.lookAt(0, 2, 0)
    cameraRef.current = camera
    
    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // 光照系统
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)
    
    // ============ 创建能量柱 ============
    data.pillars.forEach((pillarData) => {
      const pillarGroup = new THREE.Group()
      pillarGroup.userData = { pillarData }
      
      // 主柱体（半透明玻璃质感）
      const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, pillarData.height, 32)
      const pillarMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(pillarData.color),
        emissive: new THREE.Color(pillarData.color),
        emissiveIntensity: 0.3,
        transmission: 0.9,
        thickness: 0.5,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.6,
      })
      const pillarMesh = new THREE.Mesh(pillarGeometry, pillarMaterial)
      pillarMesh.position.y = pillarData.height / 2
      pillarMesh.userData = { isPillar: true, pillarId: pillarData.id }
      pillarGroup.add(pillarMesh)
      
      // 外层光晕
      const glowGeometry = new THREE.CylinderGeometry(0.4, 0.4, pillarData.height, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(pillarData.color),
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
      })
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
      glowMesh.position.y = pillarData.height / 2
      pillarGroup.add(glowMesh)
      
      // 底座
      const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.1, 32)
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(pillarData.color),
        emissive: new THREE.Color(pillarData.color),
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
      })
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial)
      baseMesh.position.y = 0.05
      pillarGroup.add(baseMesh)
      
      pillarGroup.position.set(...pillarData.position)
      scene.add(pillarGroup)
      pillarsRef.current.set(pillarData.id, pillarGroup)
      
      // ============ 创建粒子系统 ============
      const pillarParticles: THREE.Mesh[] = []
      const particleCount = pillarData.particles.length
      
      pillarData.particles.forEach((particleData, index) => {
        const particleGeometry = new THREE.SphereGeometry(0.08, 16, 16)
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(pillarData.color),
          transparent: true,
          opacity: 0.9,
        })
        const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial)
        
        // 初始位置：在柱子内部，分布在不同高度
        const initialY = (index / particleCount) * pillarData.height
        particleMesh.position.set(0, initialY, 0)
        
        // 存储粒子元数据
        particleMesh.userData = {
          particleData,
          pillarId: pillarData.id,
          initialY,
          progress: index / particleCount, // 用于动画相位偏移
          expanded: false,
        }
        
        pillarGroup.add(particleMesh)
        pillarParticles.push(particleMesh)
      })
      
      particlesRef.current.set(pillarData.id, pillarParticles)
    })
    
    // ============ 创建连接线系统 ============
    const connectionsGroup = new THREE.Group()
    connectionsGroup.visible = true // 默认显示（但很淡）
    connectionsRef.current = connectionsGroup
    scene.add(connectionsGroup)
    
    console.log('📊 Connections data:', data.connections)
    console.log('📊 Pillars:', data.pillars.map(p => ({ id: p.id, pos: p.position })))
    
    data.connections.forEach((conn) => {
      const fromPillar = data.pillars.find(p => p.id === conn.from)
      const toPillar = data.pillars.find(p => p.id === conn.to)
      
      console.log(`🔗 Creating ${conn.type} connection:`, {
        from: conn.from,
        to: conn.to,
        fromFound: !!fromPillar,
        toFound: !!toPillar
      })
      
      if (!fromPillar || !toPillar) {
        console.warn('⚠️ Missing pillar for connection:', conn)
        return
      }
      
      // 连接线起点和终点（分层显示：不同类型在不同高度）
      const heightOffsets: Record<string, number> = {
        synergy: 0.7,      // 高层
        tradeoff: 0.5,     // 中高层
        dependency: 0.3,   // 中低层
        feedback: 0.1,     // 低层
      }
      
      const yOffset = heightOffsets[conn.type] || 0.5
      
      const fromPos = new THREE.Vector3(
        fromPillar.position[0],
        fromPillar.height * yOffset,
        fromPillar.position[2]
      )
      const toPos = new THREE.Vector3(
        toPillar.position[0],
        toPillar.height * yOffset,
        toPillar.position[2]
      )
      
      // 根据类型创建不同的连接线
      let connectionMesh: THREE.Object3D | null = null
      
      switch (conn.type) {
        case 'synergy':
          connectionMesh = createSynergyConnection(fromPos, toPos, conn.color, connectionsGroup)
          break
        case 'tradeoff':
          connectionMesh = createTradeoffConnection(fromPos, toPos, conn.color, connectionsGroup)
          break
        case 'dependency':
          connectionMesh = createDependencyConnection(fromPos, toPos, conn.color, connectionsGroup)
          break
        case 'feedback':
          connectionMesh = createFeedbackConnection(fromPos, toPos, conn.color, connectionsGroup)
          break
      }
      
      // 存储连接关系元数据
      if (connectionMesh) {
        connectionMesh.userData = {
          fromPillarId: conn.from,
          toPillarId: conn.to,
          connectionType: conn.type,
        }
      }
    })
    
    // ============ 相机控制 ============
    let isDragging = false
    let previousMouse = { x: 0, y: 0 }
    let cameraRotation = { theta: 0, phi: Math.PI / 6 } // 球坐标
    const cameraDistance = 16
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      previousMouse = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseMoveCamera = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - previousMouse.x
      const deltaY = e.clientY - previousMouse.y
      
      cameraRotation.theta -= deltaX * 0.005
      cameraRotation.phi += deltaY * 0.005
      
      // 限制垂直角度
      cameraRotation.phi = Math.max(0.1, Math.min(Math.PI / 2, cameraRotation.phi))
      
      previousMouse = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseUp = () => {
      isDragging = false
    }
    
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMoveCamera)
    window.addEventListener('mouseup', onMouseUp)
    
    // ============ 动画循环 ============
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      const time = Date.now() * 0.001
      
      // 更新相机位置（球坐标转换）
      camera.position.x = cameraDistance * Math.sin(cameraRotation.phi) * Math.cos(cameraRotation.theta)
      camera.position.y = cameraDistance * Math.cos(cameraRotation.phi) + 2
      camera.position.z = cameraDistance * Math.sin(cameraRotation.phi) * Math.sin(cameraRotation.theta)
      camera.lookAt(0, 2, 0)
      
      // 更新粒子动画
      particlesRef.current.forEach((pillarParticles, pillarId) => {
        const pillarGroup = pillarsRef.current.get(pillarId)
        if (!pillarGroup) return
        
        const pillarData = pillarGroup.userData.pillarData as EnergyPillar
        
        pillarParticles.forEach((particle) => {
          if (!particle.userData.expanded) {
            // 粒子上升动画
            particle.userData.progress += 0.002
            if (particle.userData.progress > 1) {
              particle.userData.progress = 0
            }
            
            particle.position.y = particle.userData.progress * pillarData.height
            
            // 轻微的水平摆动
            const swayX = Math.sin(time * 2 + particle.userData.initialY) * 0.05
            const swayZ = Math.cos(time * 2 + particle.userData.initialY) * 0.05
            particle.position.x = swayX
            particle.position.z = swayZ
          }
        })
      })
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // 响应式处理
    const handleResize = () => {
      if (!container) return
      
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    // 清理
    return () => {
      cancelAnimationFrame(animationFrameRef.current)
      window.removeEventListener('resize', handleResize)
      container?.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMoveCamera)
      window.removeEventListener('mouseup', onMouseUp)
      
      // 清理Three.js资源
      pillars.forEach((group) => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose()
            if (obj.material instanceof THREE.Material) {
              obj.material.dispose()
            }
          }
        })
      })
      
      renderer.dispose()
      if (container?.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [data])
  
  // ============ 交互处理 ============
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current) return
    
    const container = containerRef.current
    const camera = cameraRef.current
    const raycaster = raycasterRef.current
    const mouse = mouseRef.current
    
    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      
      // 检测柱子碰撞
      const pillarMeshes: THREE.Mesh[] = []
      pillarsRef.current.forEach((group) => {
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.userData.isPillar) {
            pillarMeshes.push(child)
          }
        })
      })
      
      const intersects = raycaster.intersectObjects(pillarMeshes)
      
      if (intersects.length > 0) {
        const pillarId = intersects[0].object.userData.pillarId
        setHoveredPillar(pillarId)
        
        const pillarGroup = pillarsRef.current.get(pillarId)
        if (pillarGroup) {
          const pillarData = pillarGroup.userData.pillarData as EnergyPillar
          setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            title: pillarData.moduleName,
            subtitle: pillarData.coreIdea,
          })
        }
      } else {
        setHoveredPillar(null)
        setTooltip(prev => ({ ...prev, visible: false }))
      }
    }
    
    const onClick = () => {
      if (hoveredPillar) {
        if (focusedPillar === hoveredPillar) {
          // 取消聚焦
          setFocusedPillar(null)
        } else {
          // 聚焦新柱子
          setFocusedPillar(hoveredPillar)
          
          const pillarGroup = pillarsRef.current.get(hoveredPillar)
          if (pillarGroup && onPillarClick) {
            onPillarClick(pillarGroup.userData.pillarData)
          }
        }
      }
    }
    
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('click', onClick)
    
    return () => {
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('click', onClick)
    }
  }, [hoveredPillar, focusedPillar, onPillarClick])
  
  // ============ Hover效果 ============
  useEffect(() => {
    // 更新柱子状态
    pillarsRef.current.forEach((group, pillarId) => {
      const isHovered = pillarId === hoveredPillar
      const isFocused = pillarId === focusedPillar
      
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshPhysicalMaterial | THREE.MeshBasicMaterial
          
          if (child.userData.isPillar) {
            // 柱子材质
            if ('emissiveIntensity' in mat) {
              mat.emissiveIntensity = isHovered || isFocused ? 0.6 : 0.3
            }
            mat.opacity = isHovered || isFocused ? 0.8 : (hoveredPillar || focusedPillar) ? 0.3 : 0.6
          }
        }
      })
    })
    
    // 更新连接线状态（按需高亮）
    if (connectionsRef.current && showConnections) {
      connectionsRef.current.children.forEach((connection) => {
        const fromId = connection.userData.fromPillarId
        const toId = connection.userData.toPillarId
        
        // 检查连接线是否与当前hover/focus的柱子相关
        const isRelated = 
          hoveredPillar === fromId || 
          hoveredPillar === toId || 
          focusedPillar === fromId || 
          focusedPillar === toId
        
        // 根据是否相关设置不同的可见度
        if (connection instanceof THREE.Mesh) {
          const mat = connection.material as THREE.MeshStandardMaterial
          if (hoveredPillar || focusedPillar) {
            // 有柱子被hover/focus时
            mat.opacity = isRelated ? 0.7 : 0.05 // 相关的高亮，其他的几乎隐藏
            mat.emissiveIntensity = isRelated ? 0.6 : 0.1
          } else {
            // 没有柱子被hover/focus时，恢复默认淡显示
            mat.opacity = 0.15
            mat.emissiveIntensity = 0.2
          }
        } else if (connection instanceof THREE.ArrowHelper) {
          // 处理箭头类型的连接（dependency）
          const lineMat = connection.line.material as THREE.LineBasicMaterial
          const coneMat = connection.cone.material as THREE.MeshBasicMaterial
          
          if (hoveredPillar || focusedPillar) {
            lineMat.opacity = isRelated ? 0.7 : 0.05
            coneMat.opacity = isRelated ? 0.7 : 0.05
          } else {
            lineMat.opacity = 0.15
            coneMat.opacity = 0.15
          }
        }
      })
    }
  }, [hoveredPillar, focusedPillar, showConnections])
  
  // ============ Focus效果：粒子展开 ============
  useEffect(() => {
    particlesRef.current.forEach((pillarParticles, pillarId) => {
      const isFocused = pillarId === focusedPillar
      
      pillarParticles.forEach((particle, index) => {
        particle.userData.expanded = isFocused
        
        if (isFocused) {
          // 展开：粒子飞出形成圆环
          const angle = (index / pillarParticles.length) * Math.PI * 2
          const radius = 1.5
          particle.position.x = Math.cos(angle) * radius
          particle.position.z = Math.sin(angle) * radius
          particle.position.y = particle.userData.initialY
        } else {
          // 归位：重置到柱子内部
          // （动画循环会自动处理）
        }
      })
    })
  }, [focusedPillar])
  
  // ============ 连接线显示控制 ============
  useEffect(() => {
    if (connectionsRef.current) {
      connectionsRef.current.visible = showConnections
    }
  }, [showConnections])
  
  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 px-4 py-3 bg-black/90 text-white rounded-lg pointer-events-none max-w-sm"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          <div className="font-semibold text-lg">{tooltip.title}</div>
          <div className="text-sm text-gray-300 mt-1">{tooltip.subtitle}</div>
        </div>
      )}
      
      {/* 控制提示 */}
      <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
        <p className="font-medium mb-1">💡 控制提示</p>
        <ul className="space-y-1 text-xs">
          <li>• 拖拽旋转视角</li>
          <li>• 悬停查看模块信息</li>
          <li>• 点击聚焦/展开详情</li>
        </ul>
      </div>
    </div>
  )
}

// ============ 辅助函数：创建不同类型的连接线 ============

function createSynergyConnection(
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: string,
  parent: THREE.Group
): THREE.Mesh {
  // 协同：平滑弧线（使用管道几何体）
  const curve = new THREE.QuadraticBezierCurve3(
    from,
    new THREE.Vector3(
      (from.x + to.x) / 2,
      Math.max(from.y, to.y) + 1,
      (from.z + to.z) / 2
    ),
    to
  )
  
  const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.08, 8, false)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.2, // 默认低发光
    transparent: true,
    opacity: 0.15, // 默认很淡
  })
  
  const tube = new THREE.Mesh(tubeGeometry, material)
  parent.add(tube)
  
  console.log('✅ Created synergy connection tube')
  return tube
}

function createTradeoffConnection(
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: string,
  parent: THREE.Group
): THREE.Mesh {
  // 权衡：震荡的正弦波（使用管道）
  const points: THREE.Vector3[] = []
  const steps = 50
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = THREE.MathUtils.lerp(from.x, to.x, t)
    const y = THREE.MathUtils.lerp(from.y, to.y, t) + Math.sin(t * Math.PI * 4) * 0.3
    const z = THREE.MathUtils.lerp(from.z, to.z, t)
    points.push(new THREE.Vector3(x, y, z))
  }
  
  const curve = new THREE.CatmullRomCurve3(points)
  const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.08, 8, false)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.2, // 默认低发光
    transparent: true,
    opacity: 0.15, // 默认很淡
  })
  
  const tube = new THREE.Mesh(tubeGeometry, material)
  parent.add(tube)
  
  console.log('✅ Created tradeoff connection tube')
  return tube
}

function createDependencyConnection(
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: string,
  parent: THREE.Group
): THREE.ArrowHelper {
  // 依赖：直线箭头
  const direction = new THREE.Vector3().subVectors(to, from)
  const length = direction.length()
  
  const arrowHelper = new THREE.ArrowHelper(
    direction.normalize(),
    from,
    length,
    new THREE.Color(color),
    0.3,
    0.2
  )
  
  // 设置材质属性 - 默认很淡
  const lineMaterial = arrowHelper.line.material as THREE.LineBasicMaterial
  lineMaterial.transparent = true
  lineMaterial.opacity = 0.15
  
  const coneMaterial = arrowHelper.cone.material as THREE.MeshBasicMaterial
  coneMaterial.transparent = true
  coneMaterial.opacity = 0.15
  
  parent.add(arrowHelper)
  return arrowHelper
}

function createFeedbackConnection(
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: string,
  parent: THREE.Group
): THREE.Mesh {
  // 反馈：螺旋线（使用管道）
  const points: THREE.Vector3[] = []
  const steps = 50
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = THREE.MathUtils.lerp(from.x, to.x, t)
    const y = THREE.MathUtils.lerp(from.y, to.y, t)
    const z = THREE.MathUtils.lerp(from.z, to.z, t)
    
    // 添加螺旋效果
    const spiral = Math.sin(t * Math.PI * 6) * 0.2
    const cosAngle = Math.cos(t * Math.PI * 2)
    const sinAngle = Math.sin(t * Math.PI * 2)
    
    points.push(new THREE.Vector3(
      x + spiral * cosAngle,
      y,
      z + spiral * sinAngle
    ))
  }
  
  const curve = new THREE.CatmullRomCurve3(points)
  const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.08, 8, false)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.2, // 默认低发光
    transparent: true,
    opacity: 0.15, // 默认很淡
  })
  
  const tube = new THREE.Mesh(tubeGeometry, material)
  parent.add(tube)
  
  console.log('✅ Created feedback connection tube')
  return tube
}

