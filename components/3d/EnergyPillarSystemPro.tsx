'use client'

/**
 * 能量柱系统 - 专业级3D可视化
 * 
 * 设计哲学：真实物理感 + 克制优雅 + 信息清晰 = 高级感
 * 
 * 核心特性：
 * - 玻璃质感小球，自然堆叠
 * - 流动粒子连接线，优雅不廉价
 * - 丝滑展开动画，信息清晰不扎眼
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { EnergyPillarData, EnergyPillar } from '@/lib/3d-mapper'

interface Props {
  data: EnergyPillarData
  onPillarClick?: (pillar: EnergyPillar) => void
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  title: string
  subtitle: string
}

// 粒子流系统
interface ParticleTrail {
  particles: THREE.Points
  positions: Float32Array
  opacities: Float32Array
  curve: THREE.Curve<THREE.Vector3>
  progress: number[]
  speed: number
}

export function EnergyPillarSystemPro({ data, onPillarClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const pillarsRef = useRef<Map<string, THREE.Group>>(new Map())
  const spheresRef = useRef<Map<string, THREE.Mesh[]>>(new Map())
  const particleTrailsRef = useRef<Map<string, ParticleTrail>>(new Map())
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
  
  // ============ 主场景初始化 ============
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const pillars = pillarsRef.current
    const spheres = spheresRef.current
    const particleTrails = particleTrailsRef.current
    
    // 场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    sceneRef.current = scene
    
    // 星空
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
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.05, 
      transparent: true, 
      opacity: 0.6 
    })))
    
    // 相机
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 6, 16)
    camera.lookAt(0, 2, 0)
    cameraRef.current = camera
    
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)
    
    // ============ 创建能量柱和玻璃小球 ============
    data.pillars.forEach((pillarData) => {
      const pillarGroup = new THREE.Group()
      pillarGroup.userData = { pillarData }
      
      // 主柱体（半透明）
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
      pillarMesh.castShadow = true
      pillarGroup.add(pillarMesh)
      
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
      
      // ============ 玻璃小球系统（重新设计）============
      const pillarSpheres: THREE.Mesh[] = []
      const sphereRadius = 0.22 // 直径0.44，柱子直径0.6
      const sphereGap = 0.48 // 堆叠间隙
      
      pillarData.particles.forEach((particleData, index) => {
        // 玻璃材质小球
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32)
        const sphereMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(pillarData.color),
          transmission: 0.95, // 高透明度
          thickness: 0.5,
          roughness: 0.05, // 很光滑
          metalness: 0,
          transparent: true,
          opacity: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        })
        
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
        
        // 从底部堆叠（物理感）
        const stackY = 0.15 + sphereRadius + index * sphereGap
        sphereMesh.position.set(0, stackY, 0)
        
        // 存储元数据
        sphereMesh.userData = {
          particleData,
          pillarId: pillarData.id,
          originalY: stackY,
          stackIndex: index,
          expanded: false,
        }
        
        sphereMesh.castShadow = true
        sphereMesh.receiveShadow = true
        
        pillarGroup.add(sphereMesh)
        pillarSpheres.push(sphereMesh)
      })
      
      spheresRef.current.set(pillarData.id, pillarSpheres)
    })
    
    // ============ 创建粒子流连接线系统 ============
    data.connections.forEach((conn) => {
      const fromPillar = data.pillars.find(p => p.id === conn.from)
      const toPillar = data.pillars.find(p => p.id === conn.to)
      
      if (!fromPillar || !toPillar) return
      
      // 分层高度
      const heightOffsets: Record<string, number> = {
        synergy: 0.7,
        tradeoff: 0.5,
        dependency: 0.3,
        feedback: 0.1,
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
      
      // 创建曲线路径
      let curve: THREE.Curve<THREE.Vector3>
      
      if (conn.type === 'synergy') {
        // 协同：弧线
        curve = new THREE.QuadraticBezierCurve3(
          fromPos,
          new THREE.Vector3(
            (fromPos.x + toPos.x) / 2,
            Math.max(fromPos.y, toPos.y) + 1,
            (fromPos.z + toPos.z) / 2
          ),
          toPos
        )
      } else if (conn.type === 'tradeoff') {
        // 权衡：波浪线
        const points: THREE.Vector3[] = []
        for (let i = 0; i <= 20; i++) {
          const t = i / 20
          const x = THREE.MathUtils.lerp(fromPos.x, toPos.x, t)
          const y = THREE.MathUtils.lerp(fromPos.y, toPos.y, t) + Math.sin(t * Math.PI * 4) * 0.3
          const z = THREE.MathUtils.lerp(fromPos.z, toPos.z, t)
          points.push(new THREE.Vector3(x, y, z))
        }
        curve = new THREE.CatmullRomCurve3(points)
      } else {
        // 依赖和反馈：直线或螺旋
        curve = new THREE.LineCurve3(fromPos, toPos)
      }
      
      // 创建粒子流
      const particleTrail = createParticleTrail(curve, conn.color, scene)
      particleTrails.set(`${conn.from}-${conn.to}-${conn.type}`, particleTrail)
      
      // 存储连接元数据
      particleTrail.particles.userData = {
        fromPillarId: conn.from,
        toPillarId: conn.to,
        connectionType: conn.type,
      }
    })
    
    // ============ 相机控制 ============
    let isDragging = false
    let previousMouse = { x: 0, y: 0 }
    let cameraRotation = { theta: 0, phi: Math.PI / 6 }
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
      
      // 更新相机位置
      camera.position.x = cameraDistance * Math.sin(cameraRotation.phi) * Math.cos(cameraRotation.theta)
      camera.position.y = cameraDistance * Math.cos(cameraRotation.phi) + 2
      camera.position.z = cameraDistance * Math.sin(cameraRotation.phi) * Math.sin(cameraRotation.theta)
      camera.lookAt(0, 2, 0)
      
      // 小球呼吸动画
      spheresRef.current.forEach((pillarSpheres) => {
        pillarSpheres.forEach((sphere) => {
          if (!sphere.userData.expanded) {
            // 轻微浮动
            const phase = time * 0.5 + sphere.userData.stackIndex * 0.3
            const float = Math.sin(phase) * 0.02
            sphere.position.y = sphere.userData.originalY + float
          }
        })
      })
      
      // 更新粒子流动画
      particleTrails.forEach((trail) => {
        updateParticleTrail(trail)
      })
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // 响应式
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
      
      particleTrails.forEach((trail) => {
        trail.particles.geometry.dispose()
        if (trail.particles.material instanceof THREE.Material) {
          trail.particles.material.dispose()
        }
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
          setFocusedPillar(null)
        } else {
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
  
  // ============ Hover/Focus效果 ============
  useEffect(() => {
    // 更新柱子状态
    pillarsRef.current.forEach((group, pillarId) => {
      const isHovered = pillarId === hoveredPillar
      const isFocused = pillarId === focusedPillar
      
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData.isPillar) {
          const mat = child.material as THREE.MeshPhysicalMaterial
          mat.emissiveIntensity = isHovered || isFocused ? 0.6 : 0.3
          mat.opacity = isHovered || isFocused ? 0.8 : (hoveredPillar || focusedPillar) ? 0.3 : 0.6
        }
      })
    })
    
    // 更新粒子流亮度
    particleTrailsRef.current.forEach((trail, key) => {
      const fromId = trail.particles.userData.fromPillarId
      const toId = trail.particles.userData.toPillarId
      
      const isRelated = 
        hoveredPillar === fromId || 
        hoveredPillar === toId || 
        focusedPillar === fromId || 
        focusedPillar === toId
      
      const mat = trail.particles.material as THREE.PointsMaterial
      
      if (hoveredPillar || focusedPillar) {
        mat.opacity = isRelated ? 0.6 : 0.02
        trail.speed = isRelated ? 0.01 : 0.002 // 相关的加速
      } else {
        mat.opacity = 0.08 // 默认很淡
        trail.speed = 0.003
      }
    })
  }, [hoveredPillar, focusedPillar])
  
  // ============ Focus展开效果 ============
  useEffect(() => {
    spheresRef.current.forEach((pillarSpheres, pillarId) => {
      const isFocused = pillarId === focusedPillar
      
      pillarSpheres.forEach((sphere, index) => {
        sphere.userData.expanded = isFocused
        
        if (isFocused) {
          // 展开：小球飞出到右侧垂直排列
          const targetX = 2
          const targetY = 0.5 + index * 0.8
          const targetZ = 0
          
          // 使用简单过渡（未来可用GSAP优化）
          sphere.position.x = targetX
          sphere.position.y = targetY
          sphere.position.z = targetZ
        } else {
          // 归位
          sphere.position.x = 0
          sphere.position.y = sphere.userData.originalY
          sphere.position.z = 0
        }
      })
    })
  }, [focusedPillar])
  
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
        <p className="font-medium mb-1">💡 交互提示</p>
        <ul className="space-y-1 text-xs">
          <li>• 拖拽旋转视角</li>
          <li>• 悬停查看模块</li>
          <li>• 点击展开详情</li>
        </ul>
      </div>
    </div>
  )
}

// ============ 辅助函数：创建粒子流 ============
function createParticleTrail(
  curve: THREE.Curve<THREE.Vector3>,
  color: string,
  scene: THREE.Scene
): ParticleTrail {
  const particleCount = 25
  const positions = new Float32Array(particleCount * 3)
  const opacities = new Float32Array(particleCount)
  const progress: number[] = []
  
  // 初始化粒子位置
  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount
    const point = curve.getPoint(t)
    positions[i * 3] = point.x
    positions[i * 3 + 1] = point.y
    positions[i * 3 + 2] = point.z
    opacities[i] = 1.0 - (i / particleCount) * 0.7 // 渐变透明度
    progress.push(t)
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1))
  
  const material = new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size: 0.08,
    transparent: true,
    opacity: 0.08, // 默认很淡
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  
  const particles = new THREE.Points(geometry, material)
  scene.add(particles)
  
  return {
    particles,
    positions,
    opacities,
    curve,
    progress,
    speed: 0.003,
  }
}

// 更新粒子流动画
function updateParticleTrail(trail: ParticleTrail) {
  for (let i = 0; i < trail.progress.length; i++) {
    trail.progress[i] += trail.speed
    if (trail.progress[i] > 1) {
      trail.progress[i] = 0
    }
    
    const point = trail.curve.getPoint(trail.progress[i])
    trail.positions[i * 3] = point.x
    trail.positions[i * 3 + 1] = point.y
    trail.positions[i * 3 + 2] = point.z
  }
  
  trail.particles.geometry.attributes.position.needsUpdate = true
}

