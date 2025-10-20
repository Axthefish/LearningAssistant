'use client'

/**
 * V5 星系系统 - 最终优化版
 * 
 * 反馈修复：
 * 1. 移除Trade-off中间的多余小球
 * 2. 卫星围绕星球旋转（动态轨道）
 * 3. 点击星球展开/收起卫星
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Scene3DData, Node3D } from '@/lib/3d-mapper'
import { Card } from '@/components/ui/card'

interface UniversalFramework3DV5Props {
  data: Scene3DData
  onNodeClick?: (node: Node3D) => void
}

export function UniversalFramework3DV5({
  data,
  onNodeClick,
}: UniversalFramework3DV5Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const nodeMapRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const satellitesRef = useRef<THREE.Mesh[]>([])
  const energyParticlesRef = useRef<THREE.Mesh[]>([])
  const animationFrameRef = useRef<number>(0)
  
  const [expandedPlanet, setExpandedPlanet] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: string
    description?: string
    type?: string
  }>({ visible: false, x: 0, y: 0, content: '' })
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const nodeMap = nodeMapRef.current
    const satellites = satellitesRef.current
    const energyParticles = energyParticlesRef.current
    
    // ============ 场景设置 ============
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000510)
    sceneRef.current = scene
    
    // 星空背景
    const starsGeometry = new THREE.BufferGeometry()
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    })
    
    const starsVertices = []
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100
      const y = (Math.random() - 0.5) * 100
      const z = (Math.random() - 0.5) * 100
      starsVertices.push(x, y, z)
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)
    
    // 相机
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 8, 25)
    camera.lookAt(0, 4, 0)
    cameraRef.current = camera
    
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambientLight)
    
    // ============ 创建星球系统 ============
    const moduleGroups = new Map<string, Node3D[]>()
    data.nodes.forEach(node => {
      if (!moduleGroups.has(node.moduleId)) {
        moduleGroups.set(node.moduleId, [])
      }
      moduleGroups.get(node.moduleId)!.push(node)
    })
    
    // Z字形布局
    const planetPositions: [number, number, number][] = [
      [-7, 0, 0],    // Self-Alignment (左下)
      [7, 0, 0],     // Initiation (右下)
      [-7, 8, 0],    // Connection (左上)
      [7, 8, 0],     // Transition (右上)
    ]
    
    const planetColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    const planetNames = ['Self-Alignment', 'Initiation', 'Connection', 'Transition']
    
    const planets: THREE.Mesh[] = []
    
    moduleGroups.forEach((nodes, moduleId) => {
      const moduleIdx = parseInt(moduleId.split('-')[1])
      const planetPos = planetPositions[moduleIdx]
      const color = planetColors[moduleIdx]
      
      // 创建星球
      const planetSize = 1.2
      const planetGeo = new THREE.SphereGeometry(planetSize, 32, 32)
      const planetMat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.5,
        shininess: 100,
      })
      
      const planet = new THREE.Mesh(planetGeo, planetMat)
      planet.position.set(...planetPos)
      planet.userData = {
        nodeData: nodes[0],
        isPlanet: true,
        moduleIndex: moduleIdx,
        moduleName: planetNames[moduleIdx],
        satellites: [],
      }
      scene.add(planet)
      nodeMap.set(nodes[0].id, planet)
      planets.push(planet)
      
      // 星球光晕
      const glowGeo = new THREE.SphereGeometry(planetSize * 1.5, 32, 32)
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2,
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      glow.position.copy(planet.position)
      scene.add(glow)
      
      // 星球光环
      const ringGeo = new THREE.TorusGeometry(planetSize * 1.8, 0.05, 16, 100)
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.4,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.copy(planet.position)
      ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3
      ring.userData = { orbitSpeed: 0.001 }
      scene.add(ring)
      
      // 星球点光源
      const planetLight = new THREE.PointLight(new THREE.Color(color), 2, 15)
      planetLight.position.copy(planet.position)
      scene.add(planetLight)
      
      // 创建卫星（初始隐藏或很小）
      nodes.slice(1).forEach((nodeData, index) => {
        const satelliteSize = 0.35
        const orbitRadius = 2.5
        const angleOffset = (index / (nodes.length - 1)) * Math.PI * 2
        
        // 卫星初始位置
        const satX = planetPos[0] + Math.cos(angleOffset) * orbitRadius
        const satY = planetPos[1] + Math.sin(angleOffset) * orbitRadius * 0.5
        const satZ = planetPos[2] + Math.sin(angleOffset) * orbitRadius
        
        const satelliteGeo = new THREE.SphereGeometry(satelliteSize, 20, 20)
        const satelliteMat = new THREE.MeshPhongMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color),
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.85,
        })
        
        const satellite = new THREE.Mesh(satelliteGeo, satelliteMat)
        satellite.position.set(satX, satY, satZ)
        satellite.userData = {
          nodeData,
          isSatellite: true,
          planetPosition: planet.position.clone(),
          orbitRadius,
          orbitAngle: angleOffset,
          orbitSpeed: 0.0008 + Math.random() * 0.0004, // 轨道速度
          orbitTiltX: Math.PI / 2,
          orbitTiltZ: (Math.random() - 0.5) * 0.5,
        }
        scene.add(satellite)
        nodeMap.set(nodeData.id, satellite)
        satellites.push(satellite)
        planet.userData.satellites.push(satellite)
        
        // 卫星轨道线
        const orbitGeo = new THREE.TorusGeometry(orbitRadius, 0.01, 16, 100)
        const orbitMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.15,
        })
        const orbit = new THREE.Mesh(orbitGeo, orbitMat)
        orbit.position.copy(planet.position)
        orbit.rotation.x = Math.PI / 2
        orbit.rotation.z = (Math.random() - 0.5) * 0.3
        scene.add(orbit)
      })
    })
    
    // ============ 生理学：动态关系 ============
    
    // Synergy: Self-Alignment + Initiation
    if (planets[0] && planets[1]) {
      const curve = createSmoothCurve(planets[0].position, planets[1].position, 2)
      createEnergyTube(scene, curve, '#10b981', 0.6, energyParticles, 4)
    }
    
    // Dependency: Initiation → Connection
    if (planets[1] && planets[2]) {
      const curve = createSmoothCurve(planets[1].position, planets[2].position, 3)
      createEnergyTube(scene, curve, '#3b82f6', 0.7, energyParticles, 3)
      createArrowAtEnd(scene, curve, '#3b82f6')
    }
    
    // Trade-off: Connection ⇌ Transition (修复：移除中间小球)
    if (planets[2] && planets[3]) {
      const curve = createSmoothCurve(planets[2].position, planets[3].position, -2)
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.06, 8, false)
      const tubeMat = new THREE.LineDashedMaterial({
        color: new THREE.Color('#f59e0b'),
        transparent: true,
        opacity: 0.5,
        dashSize: 0.3,
        gapSize: 0.2,
      })
      // 使用Line而不是Mesh，避免多余小球
      const points = curve.getPoints(30)
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(lineGeo, tubeMat)
      line.computeLineDistances()
      scene.add(line)
    }
    
    // Feedback Loop: 大循环
    if (planets[3] && planets[0]) {
      createFeedbackLoop(scene, planets[3].position, planets[0].position, '#8b5cf6', energyParticles)
    }
    
    // ============ 辅助函数 ============
    function createSmoothCurve(from: THREE.Vector3, to: THREE.Vector3, yOffset: number) {
      const midPoint = new THREE.Vector3().lerpVectors(from, to, 0.5)
      midPoint.y += yOffset
      return new THREE.QuadraticBezierCurve3(from, midPoint, to)
    }
    
    function createEnergyTube(
      scene: THREE.Scene,
      curve: THREE.QuadraticBezierCurve3,
      color: string,
      opacity: number,
      particles: THREE.Mesh[],
      particleCount: number
    ) {
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false)
      const tubeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: opacity * 0.6,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.5,
      })
      const tube = new THREE.Mesh(tubeGeo, tubeMat)
      scene.add(tube)
      
      // 流动粒子
      for (let i = 0; i < particleCount; i++) {
        const particleGeo = new THREE.SphereGeometry(0.12, 16, 16)
        const particleMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 1.0,
        })
        
        const particle = new THREE.Mesh(particleGeo, particleMat)
        particle.userData = {
          curve,
          progress: i / particleCount,
          speed: 0.005,
        }
        scene.add(particle)
        particles.push(particle)
      }
    }
    
    function createArrowAtEnd(scene: THREE.Scene, curve: THREE.QuadraticBezierCurve3, color: string) {
      const endPoint = curve.getPoint(1)
      const preEndPoint = curve.getPoint(0.95)
      const direction = new THREE.Vector3().subVectors(endPoint, preEndPoint).normalize()
      
      const arrowGeo = new THREE.ConeGeometry(0.25, 0.5, 8)
      const arrowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
      const arrow = new THREE.Mesh(arrowGeo, arrowMat)
      arrow.position.copy(endPoint)
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
      scene.add(arrow)
    }
    
    function createFeedbackLoop(
      scene: THREE.Scene,
      from: THREE.Vector3,
      to: THREE.Vector3,
      color: string,
      particles: THREE.Mesh[]
    ) {
      const points = []
      const centerX = (from.x + to.x) / 2
      const centerY = (from.y + to.y) / 2 + 3
      const centerZ = (from.z + to.z) / 2
      const radiusX = Math.abs(from.x - to.x) / 2 + 3
      const radiusY = 6
      
      for (let i = 0; i <= 100; i++) {
        const t = i / 100
        const angle = t * Math.PI * 2
        const x = centerX + Math.cos(angle) * radiusX
        const y = centerY + Math.sin(angle) * radiusY
        const z = centerZ + Math.sin(angle * 2) * 2
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const loopCurve = new THREE.CatmullRomCurve3(points, true)
      const loopGeo = new THREE.TubeGeometry(loopCurve, 100, 0.1, 8, true)
      const loopMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.6,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.6,
      })
      const loop = new THREE.Mesh(loopGeo, loopMat)
      scene.add(loop)
      
      // 循环粒子（渐亮效果）
      for (let i = 0; i < 6; i++) {
        const particleGeo = new THREE.SphereGeometry(0.12, 16, 16)
        const particleMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.7 + i * 0.05,
        })
        
        const particle = new THREE.Mesh(particleGeo, particleMat)
        particle.userData = {
          curve: loopCurve,
          progress: i / 6,
          speed: 0.002,
          baseOpacity: 0.7 + i * 0.05,
        }
        scene.add(particle)
        particles.push(particle)
      }
    }
    
    // ============ 交互系统 ============
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(Array.from(nodeMap.values()))
      
      // 重置
      nodeMap.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshPhongMaterial
        if (mesh.scale.x < 1.3) {
          mat.emissiveIntensity = mesh.userData.isPlanet ? 0.5 : 0.3
        }
      })
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        const mat = mesh.material as THREE.MeshPhongMaterial
        mat.emissiveIntensity = 1.0
        
        const nodeData = mesh.userData.nodeData
        if (nodeData) {
          setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            content: mesh.userData.moduleName || nodeData.label,
            description: nodeData.description,
            type: mesh.userData.isPlanet ? 'planet' : 'satellite'
          })
        }
      } else {
        setTooltip({ visible: false, x: 0, y: 0, content: '' })
      }
    }
    
    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(Array.from(nodeMap.values()))
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        
        // 如果点击的是星球，展开/收起卫星
        if (mesh.userData.isPlanet) {
          const moduleIdx = mesh.userData.moduleIndex
          
          if (expandedPlanet === moduleIdx) {
            // 收起
            setExpandedPlanet(null)
          } else {
            // 展开
            setExpandedPlanet(moduleIdx)
          }
        } else {
          // 点击卫星，触发onNodeClick
          onNodeClick?.(mesh.userData.nodeData)
        }
      }
    }
    
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('click', onClick)
    
    // ============ 相机控制 ============
    let cameraAngle = 0
    let cameraHeight = 8
    let cameraDistance = 25
    let autoRotate = true
    
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cameraDistance += e.deltaY * 0.02
      cameraDistance = Math.max(15, Math.min(40, cameraDistance))
    }
    
    let isDragging = false
    let previousMouse = { x: 0, y: 0 }
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      autoRotate = false
      previousMouse = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseMoveCamera = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - previousMouse.x
      const deltaY = e.clientY - previousMouse.y
      
      cameraAngle -= deltaX * 0.005
      cameraHeight += deltaY * 0.05
      cameraHeight = Math.max(2, Math.min(20, cameraHeight))
      
      previousMouse = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseUp = () => {
      isDragging = false
      setTimeout(() => { autoRotate = true }, 3000)
    }
    
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMoveCamera)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('wheel', onWheel, { passive: false })
    
    // ============ 动画循环 ============
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      const time = Date.now() * 0.0005
      
      // 缓慢自动旋转
      if (autoRotate) {
        cameraAngle += 0.0008
      }
      
      // 更新相机
      camera.position.x = Math.cos(cameraAngle) * cameraDistance
      camera.position.y = cameraHeight
      camera.position.z = Math.sin(cameraAngle) * cameraDistance
      camera.lookAt(0, 4, 0)
      
      // 星球脉冲
      planets.forEach((planet, index) => {
        if (planet.scale.x < 1.3) {
          const pulse = 1 + Math.sin(time + index * 0.5) * 0.04
          planet.scale.set(pulse, pulse, pulse)
        }
      })
      
      // 卫星轨道运动
      satellites.forEach((satellite) => {
        if (satellite.userData.isSatellite) {
          // 更新轨道角度
          satellite.userData.orbitAngle += satellite.userData.orbitSpeed
          
          const angle = satellite.userData.orbitAngle
          const planetPos = satellite.userData.planetPosition
          const radius = satellite.userData.orbitRadius
          const tiltX = satellite.userData.orbitTiltX
          const tiltZ = satellite.userData.orbitTiltZ
          
          // 3D轨道计算（考虑倾斜）
          satellite.position.x = planetPos.x + Math.cos(angle) * radius
          satellite.position.y = planetPos.y + Math.sin(angle) * radius * Math.sin(tiltX)
          satellite.position.z = planetPos.z + Math.sin(angle) * radius * Math.cos(tiltX) + Math.cos(angle) * tiltZ
          
          // 卫星自转
          satellite.rotation.y += 0.01
        }
      })
      
      // 能量粒子运动
      energyParticles.forEach((particle) => {
        if (particle.userData.curve) {
          particle.userData.progress += particle.userData.speed
          if (particle.userData.progress > 1) {
            particle.userData.progress = 0
          }
          
          const point = particle.userData.curve.getPoint(particle.userData.progress)
          particle.position.copy(point)
          
          // Feedback粒子渐亮
          if (particle.userData.baseOpacity) {
            const pulseBrightness = Math.sin(particle.userData.progress * Math.PI) * 0.2
            const mat = particle.material as THREE.MeshBasicMaterial
            mat.opacity = particle.userData.baseOpacity + pulseBrightness
          }
        }
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
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('click', onClick)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMoveCamera)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('wheel', onWheel)
      
      nodeMap.forEach(mesh => {
        mesh.geometry.dispose()
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose()
        }
      })
      
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [data, onNodeClick, expandedPlanet])
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* 顶部说明 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <div className="bg-black/85 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="text-white/50 text-xs mb-1.5 text-center">Connection Architect System</div>
          <div className="text-white text-sm font-medium text-center">
            解剖学（星球-卫星） + 生理学（能量流动）
          </div>
          <div className="text-white/40 text-xs mt-2 text-center">
            点击星球查看详细内容 • 卫星自动环绕旋转
          </div>
        </div>
      </div>
      
      {/* 图例 */}
      <Card className="absolute bottom-6 left-6 p-4 bg-black/90 border-white/10 text-white backdrop-blur-md max-w-xs">
        <div className="space-y-4">
          <div>
            <div className="font-bold text-sm mb-2">解剖学 - 静态结构</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                <span>🏗️ 地基（左下）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                <span>🚪 大门（右下）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                <span>🏢 大厅（左上）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                <span>🏛️ 封顶（右上）</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <span className="text-white/60">卫星：关键行动</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-3">
            <div className="font-bold text-sm mb-2">生理学 - 动态关系</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500 rounded"></div>
                <span className="text-green-400">协同光束</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
                <span className="text-blue-400">依赖管道→</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-orange-500 border-t border-dashed"></div>
                <span className="text-orange-400">权衡张力⇌</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500 rounded"></div>
                <span className="text-purple-400">反馈回路↻</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-2 text-[10px] text-white/40">
            拖拽旋转 • 滚轮缩放 • 点击星球展开
          </div>
        </div>
      </Card>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 max-w-sm pointer-events-none"
          style={{
            left: tooltip.x + 20,
            top: tooltip.y - 30,
          }}
        >
          <Card className={`p-4 border-2 text-white shadow-2xl ${
            tooltip.type === 'planet' 
              ? 'bg-gradient-to-br from-black/95 to-blue-900/50 border-blue-400/50'
              : 'bg-black/95 border-white/30'
          }`}>
            <div className="font-bold text-lg mb-2">
              {tooltip.type === 'planet' && '🪐 '}
              {tooltip.content}
            </div>
            {tooltip.description && (
              <div className="text-sm text-white/80 leading-relaxed">
                {tooltip.description}
              </div>
            )}
            {tooltip.type === 'planet' && (
              <div className="text-xs text-white/50 mt-2 italic">
                点击查看详细内容
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* V5标识 */}
      <div className="absolute top-6 left-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-purple-500/50">
        V5 星系系统
      </div>
    </div>
  )
}

