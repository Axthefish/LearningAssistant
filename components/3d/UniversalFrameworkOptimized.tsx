'use client'

/**
 * 优化版3D可视化 - 基于最佳实践
 * 
 * 核心原则：
 * 1. 立即可用（0秒等待）
 * 2. 渐进式信息展示（Progressive Disclosure）
 * 3. 性能优先（60fps）
 * 4. 用户控制（无强制动画）
 * 
 * 默认状态：
 * - 4个星球（立即显示）
 * - 主流程线（Dependency）
 * - 卫星隐藏在星球内
 * 
 * Hover星球：
 * - 卫星扇形展开
 * - 相关连接线淡入
 * 
 * 点击星球：
 * - 聚焦该星球
 * - 卫星完全展开
 * - 显示详情面板
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Scene3DData, Node3D } from '@/lib/3d-mapper'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  data: Scene3DData
  onNodeClick?: (node: Node3D) => void
}

// 常量定义（组件外部）
const PLANET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
const PLANET_NAMES = ['Self-Alignment', 'Initiation', 'Connection', 'Transition']

export function UniversalFrameworkOptimized({ data, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const planetsRef = useRef<THREE.Mesh[]>([])
  const satellitesRef = useRef<Map<number, THREE.Mesh[]>>(new Map())
  const connectionsRef = useRef<Map<string, THREE.Object3D[]>>(new Map())
  const animationFrameRef = useRef<number>(0)
  
  const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null)
  const [focusedPlanet, setFocusedPlanet] = useState<number | null>(null)
  const [showAllConnections, setShowAllConnections] = useState(false)
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    title: string
    description?: string
  }>({ visible: false, x: 0, y: 0, title: '' })
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const planets = planetsRef.current
    const satellites = satellitesRef.current
    const connections = connectionsRef.current
    
    // ========== 场景设置 ==========
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    sceneRef.current = scene
    
    // 简化星空（性能优化：500颗而不是2000颗）
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
    camera.position.set(0, 8, 24)
    camera.lookAt(0, 4, 0)
    cameraRef.current = camera
    
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // 简化光照
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6)
    mainLight.position.set(10, 15, 10)
    scene.add(mainLight)
    
    // ========== 创建4个星球（立即显示）==========
    const planetPositions: [number, number, number][] = [
      [-8, 1, 0],    // Self-Alignment (左下)
      [8, 1, 0],     // Initiation (右下)
      [-8, 7, 0],    // Connection (左上)
      [8, 7, 0],     // Transition (右上)
    ]
    
    const planetColors = PLANET_COLORS
    const planetNames = PLANET_NAMES
    
    const moduleGroups = new Map<string, Node3D[]>()
    data.nodes.forEach(node => {
      if (!moduleGroups.has(node.moduleId)) moduleGroups.set(node.moduleId, [])
      moduleGroups.get(node.moduleId)!.push(node)
    })
    
    moduleGroups.forEach((actions, moduleId) => {
      const idx = parseInt(moduleId.split('-')[1])
      const pos = planetPositions[idx]
      const color = planetColors[idx]
      
      // 星球（简化几何体：16面而不是32面）
      const planetGeo = new THREE.SphereGeometry(1.2, 20, 20)
      const planetMat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.4,
        shininess: 80,
      })
      const planet = new THREE.Mesh(planetGeo, planetMat)
      planet.position.set(...pos)
      planet.userData = {
        type: 'planet',
        moduleIndex: idx,
        moduleName: planetNames[idx],
        coreIdea: actions[0].description,
        originalColor: color,
      }
      scene.add(planet)
      planets.push(planet)
      
      // 单层光晕（性能优化）
      const glowGeo = new THREE.SphereGeometry(1.7, 20, 20)
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      })
      scene.add(new THREE.Mesh(glowGeo, glowMat).copy(planet))
      
      // 点光源
      const light = new THREE.PointLight(new THREE.Color(color), 1.5, 15)
      light.position.copy(planet.position)
      scene.add(light)
      
      // 创建卫星（初始隐藏，scale = 0）
      const moduleSatellites: THREE.Mesh[] = []
      console.log(`Module ${idx} (${planetNames[idx]}): ${actions.length} total nodes, ${actions.length - 1} satellites`)
      
      actions.slice(1).forEach((action, satIdx) => {
        const satGeo = new THREE.SphereGeometry(0.4, 12, 12) // 加大到0.4
        const satMat = new THREE.MeshPhongMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color),
          emissiveIntensity: 0.5, // 增加发光强度到0.5
          transparent: true,
          opacity: 1.0, // 完全不透明
        })
        const sat = new THREE.Mesh(satGeo, satMat)
        sat.position.copy(planet.position)
        sat.scale.set(0, 0, 0) // 初始隐藏
        sat.userData = {
          type: 'satellite',
          nodeData: action,
          planetIndex: idx,
          satelliteIndex: satIdx,
          orbitAngle: (satIdx / (actions.length - 1)) * Math.PI * 2,
          orbitRadius: 3,
        }
        scene.add(sat)
        moduleSatellites.push(sat)
      })
      satellites.set(idx, moduleSatellites)
    })
    
    // ========== 主流程线（Dependency - 立即显示）==========
    const dependencyConnections: THREE.Object3D[] = []
    for (let i = 0; i < 3; i++) {
      const from = planets[i].position
      const to = planets[i + 1].position
      
      // 简化：直线箭头
      const dir = new THREE.Vector3().subVectors(to, from)
      const length = dir.length()
      const arrow = new THREE.ArrowHelper(
        dir.normalize(),
        from,
        length * 0.9,
        new THREE.Color('#ffffff'),
        0.4,
        0.25
      )
      
      if (arrow.line.material instanceof THREE.Material) {
        arrow.line.material.transparent = true
        arrow.line.material.opacity = 0.4
      }
      
      scene.add(arrow)
      dependencyConnections.push(arrow)
    }
    connections.set('dependency', dependencyConnections)
    
    // ========== 其他连接线（初始隐藏）==========
    // Synergy
    const synergyObjs: THREE.Object3D[] = []
    if (planets[0] && planets[1]) {
      const mid = new THREE.Vector3().lerpVectors(planets[0].position, planets[1].position, 0.5)
      mid.y += 2
      
      const curve = new THREE.QuadraticBezierCurve3(planets[0].position, mid, planets[1].position)
      const tubeGeo = new THREE.TubeGeometry(curve, 15, 0.06, 8, false)
      const tubeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#10b981'),
        transparent: true,
        opacity: 0, // 初始隐藏
      })
      const tube = new THREE.Mesh(tubeGeo, tubeMat)
      tube.userData = { targetOpacity: 0.6 }
      scene.add(tube)
      synergyObjs.push(tube)
    }
    connections.set('synergy', synergyObjs)
    
    // Trade-off
    const tradeoffObjs: THREE.Object3D[] = []
    if (planets[2] && planets[3]) {
      const points = [planets[2].position, planets[3].position]
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
      const lineMat = new THREE.LineDashedMaterial({
        color: new THREE.Color('#f59e0b'),
        transparent: true,
        opacity: 0,
        dashSize: 0.3,
        gapSize: 0.2,
      })
      const line = new THREE.Line(lineGeo, lineMat)
      line.computeLineDistances()
      line.userData = { targetOpacity: 0.5 }
      scene.add(line)
      tradeoffObjs.push(line)
    }
    connections.set('tradeoff', tradeoffObjs)
    
    // Feedback Loop
    const feedbackObjs: THREE.Object3D[] = []
    if (planets[3] && planets[0]) {
      const points = []
      const centerX = 0
      const centerY = 4
      const radiusX = 12
      const radiusY = 5
      
      for (let i = 0; i <= 100; i++) {
        const t = i / 100
        const angle = t * Math.PI * 2
        const x = centerX + Math.cos(angle) * radiusX
        const y = centerY + Math.sin(angle) * radiusY
        const z = Math.sin(angle * 2) * 2
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const loopCurve = new THREE.CatmullRomCurve3(points, true)
      const loopGeo = new THREE.TubeGeometry(loopCurve, 80, 0.08, 8, true)
      const loopMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#8b5cf6'),
        transparent: true,
        opacity: 0,
      })
      const loop = new THREE.Mesh(loopGeo, loopMat)
      loop.userData = { targetOpacity: 0.5 }
      scene.add(loop)
      feedbackObjs.push(loop)
    }
    connections.set('feedback', feedbackObjs)
    
    // ========== 交互系统 ==========
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(planets)
      
      // 重置
      planets.forEach(p => {
        const mat = p.material as THREE.MeshPhongMaterial
        mat.emissiveIntensity = 0.4
      })
      
      if (intersects.length > 0 && focusedPlanet === null) {
        const planet = intersects[0].object as THREE.Mesh
        const mat = planet.material as THREE.MeshPhongMaterial
        mat.emissiveIntensity = 0.8
        
        setHoveredPlanet(planet.userData.moduleIndex)
        setTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          title: planet.userData.moduleName,
          description: planet.userData.coreIdea,
        })
      } else {
        if (focusedPlanet === null) {
          setHoveredPlanet(null)
        }
        setTooltip({ visible: false, x: 0, y: 0, title: '' })
      }
    }
    
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      
      console.log('Click detected at', { x: mouse.x, y: mouse.y })
      
      // 检查点击星球
      const planetIntersects = raycaster.intersectObjects(planets)
      console.log('Planet intersects:', planetIntersects.length)
      
      if (planetIntersects.length > 0) {
        const planet = planetIntersects[0].object as THREE.Mesh
        const idx = planet.userData.moduleIndex
        
        console.log(`Clicked planet ${idx} (${PLANET_NAMES[idx]})`)
        console.log('Current focusedPlanet:', focusedPlanet)
        
        if (focusedPlanet === idx) {
          // 取消聚焦
          console.log('Unfocusing planet')
          setFocusedPlanet(null)
          setHoveredPlanet(null)
        } else {
          // 聚焦
          console.log('Focusing planet')
          setFocusedPlanet(idx)
          setHoveredPlanet(idx)
        }
        return
      }
      
      // 检查点击卫星
      const allSats: THREE.Mesh[] = []
      satellites.forEach(sats => allSats.push(...sats))
      console.log('Total satellites for click test:', allSats.length)
      
      const satIntersects = raycaster.intersectObjects(allSats)
      console.log('Satellite intersects:', satIntersects.length)
      
      if (satIntersects.length > 0) {
        const sat = satIntersects[0].object as THREE.Mesh
        console.log('Clicked satellite:', sat.userData.nodeData?.label)
        onNodeClick?.(sat.userData.nodeData)
      } else {
        console.log('Click missed all objects')
      }
    }
    
    container.addEventListener('mousemove', onMouseMove)
    // 不再使用click事件，而是在mouseUp中判断
    
    // ========== 相机控制 ==========
    let cameraAngle = 0
    let cameraHeight = 8
    let cameraDistance = 24
    let autoRotate = true
    let isDragging = false
    let dragDistance = 0 // 记录拖拽距离，避免点击误判
    let previousMouse = { x: 0, y: 0 }
    
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cameraDistance += e.deltaY * 0.02
      cameraDistance = Math.max(15, Math.min(40, cameraDistance))
    }
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      dragDistance = 0 // 重置拖拽距离
      autoRotate = false
      previousMouse = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseMoveCamera = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - previousMouse.x
      const deltaY = e.clientY - previousMouse.y
      dragDistance += Math.abs(deltaX) + Math.abs(deltaY)
      
      cameraAngle -= deltaX * 0.005
      cameraHeight += deltaY * 0.05
      cameraHeight = Math.max(2, Math.min(15, cameraHeight))
      
      previousMouse = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseUp = (e: MouseEvent) => {
      // 如果拖拽距离很小（<5像素），认为是点击而不是拖拽
      if (dragDistance < 5) {
        console.log('Detected as click (not drag), triggering onClick')
        onClick(e)
      } else {
        console.log('Detected as drag, not triggering onClick')
      }
      
      isDragging = false
      setTimeout(() => { autoRotate = true }, 2000)
    }
    
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMoveCamera)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('wheel', onWheel, { passive: false })
    
    // ========== 动画循环 ==========
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      const time = Date.now() * 0.001
      
      // 缓慢自动旋转
      if (autoRotate) cameraAngle += 0.0008
      
      camera.position.x = Math.cos(cameraAngle) * cameraDistance
      camera.position.y = cameraHeight
      camera.position.z = Math.sin(cameraAngle) * cameraDistance
      camera.lookAt(0, 4, 0)
      
      // 星球脉冲
      planets.forEach((planet, idx) => {
        if (planet.scale.x < 1.5) {
          const pulse = 1 + Math.sin(time * 0.6 + idx * 0.8) * 0.03
          planet.scale.set(pulse, pulse, pulse)
        }
      })
      
      // 卫星展开/收起动画（smooth lerp）
      satellites.forEach((sats, planetIdx) => {
        const shouldExpand = (hoveredPlanet === planetIdx || focusedPlanet === planetIdx)
        const planetPos = planets[planetIdx].position
        
        // 调试：打印卫星状态
        if (shouldExpand && sats.length > 0 && Math.floor(time * 2) % 4 === 0) {
          const firstSat = sats[0]
          console.log(`[Satellite] Planet ${planetIdx}: scale=${firstSat.scale.x.toFixed(3)}, pos=(${firstSat.position.x.toFixed(1)}, ${firstSat.position.y.toFixed(1)}, ${firstSat.position.z.toFixed(1)})`)
        }
        
        sats.forEach((sat, satIdx) => {
          const targetScale = shouldExpand ? 1.0 : 0.0
          const currentScale = sat.scale.x
          const newScale = currentScale + (targetScale - currentScale) * 0.25 // 加快到0.25
          sat.scale.set(newScale, newScale, newScale)
          
          if (shouldExpand) {
            // 扇形展开（只要shouldExpand就开始计算位置）
            const spreadAngle = focusedPlanet === planetIdx ? Math.PI * 1.8 : Math.PI * 1.2
            const startAngle = focusedPlanet === planetIdx ? -Math.PI * 0.9 : -Math.PI * 0.6
            const angle = startAngle + (satIdx / (sats.length - 1)) * spreadAngle
            const radius = focusedPlanet === planetIdx ? 4 : 3
            
            const targetX = planetPos.x + Math.cos(angle) * radius
            const targetY = planetPos.y + Math.sin(angle) * radius * 0.4
            const targetZ = planetPos.z + Math.sin(angle) * radius * 0.3
            
            sat.position.x += (targetX - sat.position.x) * 0.15 // 加快到0.15
            sat.position.y += (targetY - sat.position.y) * 0.15
            sat.position.z += (targetZ - sat.position.z) * 0.15
            
            sat.rotation.y += 0.015
          } else {
            // 收回到星球位置
            sat.position.x += (planetPos.x - sat.position.x) * 0.2
            sat.position.y += (planetPos.y - sat.position.y) * 0.2
            sat.position.z += (planetPos.z - sat.position.z) * 0.2
          }
        })
      })
      
      // 其他连接线的显示/隐藏（smooth）
      if (showAllConnections) {
        connections.forEach((objs) => {
          objs.forEach(obj => {
            const mat = (obj as THREE.Mesh).material as THREE.Material
            if (mat && 'opacity' in mat) {
              const target = (obj.userData.targetOpacity as number) || 0.5
              mat.opacity += (target - mat.opacity) * 0.05
            }
          })
        })
      } else {
        ['synergy', 'tradeoff', 'feedback'].forEach(key => {
          connections.get(key)?.forEach(obj => {
            const mat = (obj as THREE.Mesh).material as THREE.Material
            if (mat && 'opacity' in mat) {
              mat.opacity += (0 - mat.opacity) * 0.05
            }
          })
        })
      }
      
      // 聚焦模式：其他星球淡化
      planets.forEach((planet, idx) => {
        if (focusedPlanet !== null && idx !== focusedPlanet) {
          const mat = planet.material as THREE.MeshPhongMaterial
          mat.opacity = 0.3
          mat.transparent = true
        } else {
          const mat = planet.material as THREE.MeshPhongMaterial
          mat.opacity = 1.0
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
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMoveCamera)
      window.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('wheel', onWheel)
      
      // 完整清理Three.js资源
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose())
            } else {
              object.material.dispose()
            }
          }
        }
      })
      
      renderer.dispose()
      renderer.forceContextLoss()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      
      sceneRef.current = null
      rendererRef.current = null
    }
  }, [data, onNodeClick])
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 to-slate-900">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* 简洁的顶部说明 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
        <div className="text-white text-sm">
          {PLANET_NAMES[0]} → {PLANET_NAMES[1]} → {PLANET_NAMES[2]} → {PLANET_NAMES[3]}
        </div>
      </div>
      
      {/* 系统动态切换按钮 */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => setShowAllConnections(!showAllConnections)}
          size="sm"
          variant={showAllConnections ? 'default' : 'outline'}
          className="backdrop-blur-sm"
        >
          {showAllConnections ? '隐藏' : '查看'}系统动态
        </Button>
      </div>
      
      {/* 极简图例 */}
      <Card className="absolute bottom-4 left-4 p-3 bg-black/90 border-white/10 text-white backdrop-blur-md text-xs">
        <div className="space-y-2">
          <div className="font-semibold mb-2">核心模块</div>
          {PLANET_NAMES.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ 
                  backgroundColor: PLANET_COLORS[idx],
                  boxShadow: `0 0 8px ${PLANET_COLORS[idx]}80`
                }}
              ></div>
              <span className="text-white/80">{name}</span>
            </div>
          ))}
          
          <div className="border-t border-white/20 pt-2 mt-2 text-[10px] text-white/50 space-y-0.5">
            <div>💡 悬停星球查看行动</div>
            <div>🎯 点击星球深入探索</div>
          </div>
        </div>
      </Card>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 max-w-xs pointer-events-none"
          style={{
            left: tooltip.x + 20,
            top: tooltip.y - 30,
          }}
        >
          <Card className="p-3 bg-black/95 border-white/40 text-white shadow-xl">
            <div className="font-bold text-sm mb-1">{tooltip.title}</div>
            {tooltip.description && (
              <div className="text-xs text-white/80 leading-relaxed">
                {tooltip.description}
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* 聚焦提示 */}
      {focusedPlanet !== null && (
        <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
          已聚焦：{PLANET_NAMES[focusedPlanet]} • 点击星球取消
        </div>
      )}
      
      {/* 系统动态说明（展开时）*/}
      {showAllConnections && (
        <Card className="absolute bottom-4 right-4 p-3 bg-black/90 border-white/10 text-white backdrop-blur-md text-xs max-w-xs">
          <div className="space-y-1.5">
            <div className="font-semibold mb-2">系统动态关系</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500 rounded"></div>
              <span className="text-green-400">协同效应</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500 border-t border-dashed"></div>
              <span className="text-orange-400">权衡关系</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500 rounded"></div>
              <span className="text-purple-400">反馈回路</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

