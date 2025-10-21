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

interface InfoCard {
  id: string
  label: string
  description: string
  x: number
  y: number
  visible: boolean
  // 个性化字段
  status?: 'strength' | 'opportunity' | 'maintenance'
  coachNote?: string
  nextMoves?: string[]
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
  const [infoCards, setInfoCards] = useState<InfoCard[]>([])
  
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
    
    // ============ 星空系统（圆形星星）============
    
    // 创建圆形星星纹理
    const starCanvas = document.createElement('canvas')
    starCanvas.width = 32
    starCanvas.height = 32
    const starCtx = starCanvas.getContext('2d')!
    
    // 绘制圆形渐变（中心亮，边缘淡）
    const gradient = starCtx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    starCtx.fillStyle = gradient
    starCtx.fillRect(0, 0, 32, 32)
    
    const starTexture = new THREE.CanvasTexture(starCanvas)
    
    // 第一层：远处的小星星（密集背景）
    const farStarsGeo = new THREE.BufferGeometry()
    const farStarsPos = []
    for (let i = 0; i < 3000; i++) {
      farStarsPos.push(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150
      )
    }
    farStarsGeo.setAttribute('position', new THREE.Float32BufferAttribute(farStarsPos, 3))
    const farStars = new THREE.Points(farStarsGeo, new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      map: starTexture,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    scene.add(farStars)
    
    // 第二层：中距离的星星（白色，较大）
    const midStarsGeo = new THREE.BufferGeometry()
    const midStarsPos = []
    for (let i = 0; i < 800; i++) {
      midStarsPos.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      )
    }
    midStarsGeo.setAttribute('position', new THREE.Float32BufferAttribute(midStarsPos, 3))
    const midStars = new THREE.Points(midStarsGeo, new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      map: starTexture,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    scene.add(midStars)
    
    // 第三层：近处的明亮星星（白色，大而亮）
    const nearStarsGeo = new THREE.BufferGeometry()
    const nearStarsPos = []
    for (let i = 0; i < 300; i++) {
      nearStarsPos.push(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80
      )
    }
    nearStarsGeo.setAttribute('position', new THREE.Float32BufferAttribute(nearStarsPos, 3))
    const nearStars = new THREE.Points(nearStarsGeo, new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.4,
      map: starTexture,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    scene.add(nearStars)
    
    // 保存星空图层用于动画
    const starLayers = { far: farStars, mid: midStars, near: nearStars }
    
    console.log('✅ Round stars created: far(3000) + mid(800) + near(300) = 4100 stars')
    
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
        // 根据status决定颜色
        let sphereColor = 0xffffff // 默认白色
        let sphereScale = 1.0
        
        if (particleData.status === 'strength') {
          sphereColor = 0x10b981 // 绿色
        } else if (particleData.status === 'opportunity') {
          sphereColor = 0xf97316 // 橙色
          sphereScale = 1.2 // 机会区域更大
        }
        
        // 发光小球（根据状态着色）
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius * sphereScale, 32, 32)
        const sphereMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(sphereColor),
          transparent: false,
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
      
      // 星空缓慢旋转（增加深度感和动态）
      if (starLayers.far) {
        starLayers.far.rotation.y = time * 0.015
        starLayers.far.rotation.x = time * 0.008
      }
      if (starLayers.mid) {
        starLayers.mid.rotation.y = time * 0.025
        starLayers.mid.rotation.x = -time * 0.012
      }
      if (starLayers.near) {
        starLayers.near.rotation.y = time * 0.035
        starLayers.near.rotation.z = time * 0.005
      }
      
      // 星星闪烁效果（通过调整材质opacity）
      const farMat = starLayers.far.material as THREE.PointsMaterial
      const midMat = starLayers.mid.material as THREE.PointsMaterial
      const nearMat = starLayers.near.material as THREE.PointsMaterial
      
      // 不同层用不同频率闪烁
      farMat.opacity = 0.4 + Math.sin(time * 0.5) * 0.15
      midMat.opacity = 0.6 + Math.sin(time * 0.7 + 1) * 0.2
      nearMat.opacity = 0.8 + Math.sin(time * 0.9 + 2) * 0.2
      
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
        mat.opacity = isRelated ? 0.7 : 0.05 // 相关的高亮，无关的几乎隐藏
        trail.speed = isRelated ? 0.015 : 0.002 // 相关的明显加速
      } else {
        mat.opacity = 0.2 // 默认淡但可见
        trail.speed = 0.004
      }
    })
  }, [hoveredPillar, focusedPillar])
  
  // ============ Focus展开效果：3D信息卡片 ============
  useEffect(() => {
    if (!focusedPillar || !cameraRef.current || !containerRef.current) {
      setInfoCards([])
      return
    }
    
    const camera = cameraRef.current
    const container = containerRef.current
    const pillarGroup = pillarsRef.current.get(focusedPillar)
    const pillarSpheres = spheresRef.current.get(focusedPillar)
    
    if (!pillarGroup || !pillarSpheres) {
      setInfoCards([])
      return
    }
    
    // 计算每个小球的3D位置并投影到2D屏幕坐标
    const cards: InfoCard[] = []
    const cardHeight = 80 // 估算的卡片高度
    const minGap = 20 // 最小间距
    
    pillarSpheres.forEach((sphere) => {
      // 获取小球的世界坐标
      const worldPos = new THREE.Vector3()
      sphere.getWorldPosition(worldPos)
      
      // 投影到屏幕坐标
      const screenPos = worldPos.clone()
      screenPos.project(camera)
      
      const rect = container.getBoundingClientRect()
      const x = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left
      let y = (-screenPos.y * 0.5 + 0.5) * rect.height + rect.top
      
      cards.push({
        id: sphere.userData.particleData.id,
        label: sphere.userData.particleData.label,
        description: sphere.userData.particleData.description,
        x: x + 40,
        y: y - 30,
        visible: true,
        status: sphere.userData.particleData.status,
        coachNote: sphere.userData.particleData.coachNote,
        nextMoves: sphere.userData.particleData.nextMoves,
      })
    })
    
    // ============ 碰撞检测与自适应调整（只往上推）============
    // 从下往上检查，如果卡片重叠则向上推
    for (let i = cards.length - 2; i >= 0; i--) {
      const currentCard = cards[i]
      const nextCard = cards[i + 1]
      
      const overlap = (currentCard.y + cardHeight + minGap) - nextCard.y
      
      if (overlap > 0) {
        // 向上推当前卡片
        currentCard.y = nextCard.y - cardHeight - minGap
      }
    }
    
    setInfoCards(cards)
    
    // 动画循环更新卡片位置
    const updateCardPositions = () => {
      if (!focusedPillar || !cameraRef.current || !containerRef.current) return
      
      const updatedCards: InfoCard[] = []
      const cardHeight = 80
      const minGap = 20
      
      pillarSpheres.forEach((sphere) => {
        const worldPos = new THREE.Vector3()
        sphere.getWorldPosition(worldPos)
        
        const screenPos = worldPos.clone()
        screenPos.project(cameraRef.current!)
        
        const rect = containerRef.current!.getBoundingClientRect()
        const x = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left
        let y = (-screenPos.y * 0.5 + 0.5) * rect.height + rect.top
        
        updatedCards.push({
          id: sphere.userData.particleData.id,
          label: sphere.userData.particleData.label,
          description: sphere.userData.particleData.description,
          x: x + 40,
          y: y - 30,
          visible: true,
          status: sphere.userData.particleData.status,
          coachNote: sphere.userData.particleData.coachNote,
          nextMoves: sphere.userData.particleData.nextMoves,
        })
      })
      
      // 碰撞检测与自适应调整（只往上推）
      for (let i = updatedCards.length - 2; i >= 0; i--) {
        const currentCard = updatedCards[i]
        const nextCard = updatedCards[i + 1]
        
        const overlap = (currentCard.y + cardHeight + minGap) - nextCard.y
        
        if (overlap > 0) {
          currentCard.y = nextCard.y - cardHeight - minGap
        }
      }
      
      setInfoCards(updatedCards)
    }
    
    // 每帧更新位置
    const intervalId = setInterval(updateCardPositions, 50)
    
    return () => {
      clearInterval(intervalId)
    }
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
      
      {/* 3D信息卡片 */}
      {infoCards.map((card, index) => (
        <div
          key={card.id}
          className="fixed pointer-events-none z-40 transition-all duration-300"
          style={{
            left: card.x,
            top: card.y,
            opacity: card.visible ? 1 : 0,
            transform: `scale(${card.visible ? 1 : 0.8})`,
            transitionDelay: `${index * 50}ms`, // 错开动画
          }}
        >
          <div className="backdrop-blur-xl bg-black/60 border border-white/20 rounded-lg px-4 py-3 shadow-2xl max-w-sm">
            {/* 箭头指向小球 */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-transparent border-r-white/20" />
            
            <div className="text-white space-y-2">
              {/* 标题和状态徽章 */}
              <div className="flex items-start gap-2">
                <div className="font-semibold text-sm leading-tight flex-1">
                  {card.label}
                </div>
                {card.status && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    card.status === 'strength' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
                    card.status === 'opportunity' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/40'
                  }`}>
                    {card.status === 'strength' && '优势'}
                    {card.status === 'opportunity' && '机会'}
                    {card.status === 'maintenance' && '维持'}
                  </span>
                )}
              </div>
              
              {/* 基础描述 */}
              <div className="text-xs text-gray-300 leading-snug line-clamp-2">
                {card.description}
              </div>
              
              {/* 个性化教练建议 */}
              {card.coachNote && (
                <div className="text-xs text-blue-200 leading-snug bg-blue-500/10 rounded px-2 py-1 border-l-2 border-blue-400">
                  💡 {card.coachNote}
                </div>
              )}
              
              {/* 下一步行动 */}
              {card.nextMoves && card.nextMoves.length > 0 && (
                <div className="text-xs space-y-1">
                  <div className="text-gray-400 font-medium">下一步:</div>
                  {card.nextMoves.slice(0, 2).map((move, i) => (
                    <div key={i} className="text-gray-300 leading-snug pl-2 border-l border-gray-600">
                      • {move}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
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
    size: 0.15, // 增大粒子
    transparent: true,
    opacity: 0.2, // 默认更明显
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

