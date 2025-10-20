'use client'

/**
 * 通用框架3D可视化 - 最终版本
 * 
 * 基于技术需求文档v4.1实现：
 * - 解剖学：星球（模块）+ 卫星（行动）+ 3D文本标签
 * - 生理学：协同光束、权衡碰撞、依赖流、反馈回路
 * - 交互：轨道相机、Hover高亮、点击聚焦/展开
 * - 数据驱动：完全程序化生成
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import type { Scene3DData, Node3D } from '@/lib/3d-mapper'
import { Card } from '@/components/ui/card'

interface Props {
  data: Scene3DData
  onNodeClick?: (node: Node3D) => void
}

export function UniversalFramework3DFinal({ data, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const nodesRef = useRef<Map<string, THREE.Group>>(new Map())
  const satellitesRef = useRef<THREE.Mesh[]>([])
  const particlesRef = useRef<THREE.Mesh[]>([])
  const animationFrameRef = useRef<number>(0)
  
  const [focusedPlanet, setFocusedPlanet] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    title: string
    description?: string
    type: 'planet' | 'satellite' | null
  }>({ visible: false, x: 0, y: 0, title: '', type: null })
  
  // 数据处理：按模块分组
  const moduleData = useMemo(() => {
    const groups = new Map<string, Node3D[]>()
    data.nodes.forEach(node => {
      if (!groups.has(node.moduleId)) groups.set(node.moduleId, [])
      groups.get(node.moduleId)!.push(node)
    })
    return groups
  }, [data])
  
  // 星球名称（从data中提取）
  const planetNames = useMemo(() => {
    return Array.from(moduleData.values()).map(nodes => nodes[0]?.moduleName || 'Module')
  }, [moduleData])
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const nodes = nodesRef.current
    const satellites = satellitesRef.current
    const particles = particlesRef.current
    
    // ========== SCENE SETUP ==========
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000510)
    scene.fog = new THREE.FogExp2(0x000510, 0.015)
    sceneRef.current = scene
    
    // 星空背景
    const starsGeo = new THREE.BufferGeometry()
    const starVertices = []
    for (let i = 0; i < 2000; i++) {
      starVertices.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      )
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.7 })
    scene.add(new THREE.Points(starsGeo, starsMat))
    
    // 相机
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 10, 28)
    camera.lookAt(0, 4, 0)
    cameraRef.current = camera
    
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // 光照
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(15, 20, 15)
    scene.add(mainLight)
    
    // ========== 解剖学：创建星球系统 ==========
    const planetPositions: [number, number, number][] = [
      [-8, 0, 0],    // Self-Alignment
      [8, 0, 0],     // Initiation
      [-8, 8, 0],    // Connection
      [8, 8, 0],     // Transition
    ]
    
    const planetColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
    const planetEmojis = ['🏗️', '🚪', '🏢', '🏛️']
    const planets: THREE.Group[] = []
    
    moduleData.forEach((actions, moduleId) => {
      const idx = parseInt(moduleId.split('-')[1])
      const pos = planetPositions[idx]
      const color = planetColors[idx]
      
      // 创建星球组（包含球体+文字+光晕）
      const planetGroup = new THREE.Group()
      planetGroup.position.set(...pos)
      
      // 主球体 - 使用标准材质避免兼容性问题
      const planetGeo = new THREE.SphereGeometry(1.3, 32, 32)
      const planetMat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.4,
        shininess: 100,
      })
      const planet = new THREE.Mesh(planetGeo, planetMat)
      planet.castShadow = true
      planet.userData = { 
        type: 'planet',
        moduleIndex: idx,
        moduleName: actions[0].moduleName,
        coreIdea: actions[0].description
      }
      planetGroup.add(planet)
      
      // 星球光晕（多层）
      for (let i = 1; i <= 3; i++) {
        const glowGeo = new THREE.SphereGeometry(1.3 + i * 0.3, 32, 32)
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.1 / i,
          side: THREE.BackSide
        })
        planetGroup.add(new THREE.Mesh(glowGeo, glowMat))
      }
      
      // 星球光环
      const ringGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 100)
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.5,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.userData = { rotationSpeed: 0.0008 }
      planetGroup.add(ring)
      
      // 点光源
      const light = new THREE.PointLight(new THREE.Color(color), 3, 20)
      planetGroup.add(light)
      
      // 3D文本标签（使用HTML overlay更简单）
      // 留给HTML层处理
      
      scene.add(planetGroup)
      nodes.set(actions[0].id, planetGroup)
      planets.push(planetGroup)
      
      // 创建卫星
      actions.slice(1).forEach((action, satIdx) => {
        const satGeo = new THREE.SphereGeometry(0.35, 20, 20)
        const satMat = new THREE.MeshPhongMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color),
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.9,
        })
        const satellite = new THREE.Mesh(satGeo, satMat)
        
        // 轨道参数
        const orbitRadius = 3.5
        const angle = (satIdx / (actions.length - 1)) * Math.PI * 2
        
        satellite.userData = {
          type: 'satellite',
          nodeData: action,
          planetPos: pos,
          orbitRadius,
          orbitAngle: angle,
          orbitSpeed: 0.0006 + Math.random() * 0.0003,
          orbitTiltX: Math.PI / 2,
          orbitTiltY: (Math.random() - 0.5) * 0.4,
        }
        
        scene.add(satellite)
        satellites.push(satellite)
        
        // 轨道线
        const orbitGeo = new THREE.TorusGeometry(orbitRadius, 0.015, 16, 100)
        const orbitMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.2,
        })
        const orbit = new THREE.Mesh(orbitGeo, orbitMat)
        orbit.position.set(...pos)
        orbit.rotation.x = Math.PI / 2
        scene.add(orbit)
      })
    })
    
    // ========== 生理学：系统动力学 ==========
    
    // 1. Synergy: 协同光束（两条汇合成一条）
    if (planets[0] && planets[1]) {
      createSynergyBeams(scene, planets[0].position, planets[1].position, '#10b981', particles)
    }
    
    // 2. Dependency: 依赖管道（单向脉冲流）
    if (planets[1] && planets[2]) {
      createDependencyPipeline(scene, planets[1].position, planets[2].position, '#3b82f6', particles)
    }
    
    // 3. Trade-off: 权衡碰撞（两条线对抗）
    if (planets[2] && planets[3]) {
      createTradeoffTension(scene, planets[2].position, planets[3].position, '#f59e0b', '#ef4444')
    }
    
    // 4. Feedback Loop: 反馈回路（充能动画）
    if (planets[3] && planets[0]) {
      createFeedbackLoop(scene, 
        [planets[3].position, planets[2].position, planets[1].position, planets[0].position],
        '#8b5cf6',
        particles,
        planets[0] // 充能目标
      )
    }
    
    // ========== 辅助函数 ==========
    function createSynergyBeams(
      scene: THREE.Scene,
      from: THREE.Vector3,
      to: THREE.Vector3,
      color: string,
      particles: THREE.Mesh[]
    ) {
      // 中间汇合点
      const meetPoint = new THREE.Vector3().lerpVectors(from, to, 0.5)
      meetPoint.y += 2
      
      // 两条光束汇合
      const curve1 = new THREE.QuadraticBezierCurve3(from, new THREE.Vector3().lerpVectors(from, meetPoint, 0.7), meetPoint)
      const curve2 = new THREE.QuadraticBezierCurve3(to, new THREE.Vector3().lerpVectors(to, meetPoint, 0.7), meetPoint)
      
      createTube(scene, curve1, color, 0.06, 0.7)
      createTube(scene, curve2, color, 0.06, 0.7)
      
      // 汇合后更粗的光束（向上）
      const upPoint = meetPoint.clone()
      upPoint.y += 2
      const upCurve = new THREE.LineCurve3(meetPoint, upPoint)
      createTube(scene, upCurve, color, 0.12, 0.9) // 更粗
      
      // 汇合点特效球
      const convergenceGeo = new THREE.SphereGeometry(0.25, 16, 16)
      const convergenceMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.8,
      })
      const convergence = new THREE.Mesh(convergenceGeo, convergenceMat)
      convergence.position.copy(meetPoint)
      convergence.userData = { type: 'convergence', pulsate: true }
      scene.add(convergence)
      satellites.push(convergence)
      
      // 粒子流动
      addFlowingParticles(scene, curve1, color, 3, particles)
      addFlowingParticles(scene, curve2, color, 3, particles)
    }
    
    function createDependencyPipeline(
      scene: THREE.Scene,
      from: THREE.Vector3,
      to: THREE.Vector3,
      color: string,
      particles: THREE.Mesh[]
    ) {
      const mid = new THREE.Vector3().lerpVectors(from, to, 0.5)
      mid.y += 3
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to)
      
      createTube(scene, curve, color, 0.08, 0.8)
      
      // 箭头
      const arrowGeo = new THREE.ConeGeometry(0.3, 0.6, 8)
      const arrowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
      const arrow = new THREE.Mesh(arrowGeo, arrowMat)
      const endPoint = curve.getPoint(1)
      const preEnd = curve.getPoint(0.95)
      arrow.position.copy(endPoint)
      arrow.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3().subVectors(endPoint, preEnd).normalize()
      )
      scene.add(arrow)
      
      // 脉冲粒子
      addFlowingParticles(scene, curve, color, 4, particles, 0.006)
    }
    
    function createTradeoffTension(
      scene: THREE.Scene,
      pos1: THREE.Vector3,
      pos2: THREE.Vector3,
      color1: string,
      color2: string
    ) {
      const mid = new THREE.Vector3().lerpVectors(pos1, pos2, 0.5)
      
      // 两条对抗的线
      const curve1 = new THREE.QuadraticBezierCurve3(pos1, mid.clone().add(new THREE.Vector3(0, 1, 1)), mid)
      const curve2 = new THREE.QuadraticBezierCurve3(pos2, mid.clone().add(new THREE.Vector3(0, 1, -1)), mid)
      
      createDashedTube(scene, curve1, color1, 0.05, 0.6)
      createDashedTube(scene, curve2, color2, 0.05, 0.6)
      
      // 碰撞点火花效果
      const sparkGeo = new THREE.SphereGeometry(0.15, 16, 16)
      const sparkMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color1),
        transparent: true,
        opacity: 0.8,
      })
      const spark = new THREE.Mesh(sparkGeo, sparkMat)
      spark.position.copy(mid)
      spark.userData = { type: 'spark', oscillate: true }
      scene.add(spark)
      satellites.push(spark)
    }
    
    function createFeedbackLoop(
      scene: THREE.Scene,
      waypoints: THREE.Vector3[],
      color: string,
      particles: THREE.Mesh[],
      chargePlanet: THREE.Group
    ) {
      const points = []
      const segmentCount = 100
      
      for (let i = 0; i <= segmentCount; i++) {
        const t = i / segmentCount
        const segmentIndex = Math.floor(t * (waypoints.length - 1))
        const segmentT = (t * (waypoints.length - 1)) % 1
        
        if (segmentIndex < waypoints.length - 1) {
          const from = waypoints[segmentIndex]
          const to = waypoints[segmentIndex + 1]
          const mid = new THREE.Vector3().lerpVectors(from, to, 0.5)
          mid.y += 3 + Math.sin(t * Math.PI) * 2
          mid.z += Math.sin(t * Math.PI * 2) * 2
          
          const point = new THREE.Vector3()
          point.lerpVectors(from, mid, segmentT * 2)
          if (segmentT > 0.5) {
            point.lerpVectors(mid, to, (segmentT - 0.5) * 2)
          }
          points.push(point)
        }
      }
      
      const loopCurve = new THREE.CatmullRomCurve3(points, true)
      createTube(scene, loopCurve, color, 0.1, 0.7)
      
      // 循环粒子（越来越亮，表达"增强"）
      for (let i = 0; i < 8; i++) {
        const particleGeo = new THREE.SphereGeometry(0.15, 16, 16)
        const particleMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.6 + i * 0.05,
        })
        
        const particle = new THREE.Mesh(particleGeo, particleMat)
        particle.userData = {
          curve: loopCurve,
          progress: i / 8,
          speed: 0.002,
          baseOpacity: 0.6 + i * 0.05,
          chargePlanet,
        }
        scene.add(particle)
        particles.push(particle)
      }
    }
    
    function createTube(scene: THREE.Scene, curve: THREE.Curve<THREE.Vector3>, color: string, radius: number, opacity: number) {
      const geo = new THREE.TubeGeometry(curve, 30, radius, 8, false)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.6,
      })
      scene.add(new THREE.Mesh(geo, mat))
    }
    
    function createDashedTube(scene: THREE.Scene, curve: THREE.Curve<THREE.Vector3>, color: string, radius: number, opacity: number) {
      const points = curve.getPoints(30)
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineDashedMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        dashSize: 0.3,
        gapSize: 0.2,
      })
      const line = new THREE.Line(geo, mat)
      line.computeLineDistances()
      scene.add(line)
    }
    
    function addFlowingParticles(
      scene: THREE.Scene,
      curve: THREE.Curve<THREE.Vector3>,
      color: string,
      count: number,
      particles: THREE.Mesh[],
      speed: number = 0.005
    ) {
      for (let i = 0; i < count; i++) {
        const particleGeo = new THREE.SphereGeometry(0.12, 16, 16)
        const particleMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.95,
        })
        
        const particle = new THREE.Mesh(particleGeo, particleMat)
        particle.userData = {
          curve,
          progress: i / count,
          speed,
        }
        scene.add(particle)
        particles.push(particle)
      }
    }
    
    // ========== 交互系统 ==========
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      
      const allMeshes: THREE.Mesh[] = []
      nodes.forEach(group => {
        group.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.userData.type === 'planet') {
            allMeshes.push(child)
          }
        })
      })
      allMeshes.push(...satellites)
      
      const intersects = raycaster.intersectObjects(allMeshes)
      
      // 重置
      allMeshes.forEach(mesh => {
        const mat = mesh.material as THREE.MeshPhongMaterial | THREE.MeshBasicMaterial
        if (mesh.scale.x < 1.4) {
          if (mat instanceof THREE.MeshPhongMaterial || mat instanceof THREE.MeshBasicMaterial) {
            if ('emissiveIntensity' in mat) {
              mat.emissiveIntensity = mesh.userData.type === 'planet' ? 0.4 : 0.3
            }
          }
        }
      })
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        const mat = mesh.material as THREE.MeshPhongMaterial | THREE.MeshBasicMaterial
        
        if (mat instanceof THREE.MeshPhongMaterial || mat instanceof THREE.MeshBasicMaterial) {
          if ('emissiveIntensity' in mat) {
            mat.emissiveIntensity = 1.2
          }
        }
        
        if (mesh.userData.type === 'planet') {
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            title: mesh.userData.moduleName || '模块',
            description: mesh.userData.coreIdea,
            type: 'planet'
          })
        } else if (mesh.userData.type === 'satellite') {
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            title: mesh.userData.nodeData?.label || '',
            description: mesh.userData.nodeData?.description,
            type: 'satellite'
          })
        } else {
          setTooltip({ visible: false, x: 0, y: 0, title: '', type: null })
        }
      } else {
        setTooltip({ visible: false, x: 0, y: 0, title: '', type: null })
      }
    }
    
    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      
      const allMeshes: THREE.Mesh[] = []
      nodes.forEach(group => {
        group.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.userData.type === 'planet') {
            allMeshes.push(child)
          }
        })
      })
      allMeshes.push(...satellites.filter(s => s.userData.type === 'satellite'))
      
      const intersects = raycaster.intersectObjects(allMeshes)
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        
        if (mesh.userData.type === 'planet') {
          // 点击星球：聚焦或取消聚焦
          const moduleIdx = mesh.userData.moduleIndex
          setFocusedPlanet(prev => prev === moduleIdx ? null : moduleIdx)
        } else if (mesh.userData.type === 'satellite') {
          // 点击卫星：触发详情
          onNodeClick?.(mesh.userData.nodeData)
        }
      }
    }
    
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('click', onClick)
    
    // ========== 相机控制 ==========
    let cameraAngle = 0
    let cameraHeight = 10
    let cameraDistance = 28
    let autoRotate = true
    let isDragging = false
    let previousMouse = { x: 0, y: 0 }
    
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cameraDistance += e.deltaY * 0.02
      cameraDistance = Math.max(15, Math.min(45, cameraDistance))
    }
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      autoRotate = false
      previousMouse = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseMoveCamera = (e: MouseEvent) => {
      if (!isDragging) return
      
      cameraAngle -= (e.clientX - previousMouse.x) * 0.005
      cameraHeight += (e.clientY - previousMouse.y) * 0.05
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
    
    // ========== 动画循环 ==========
    let chargeIntensity = 0
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      const time = Date.now() * 0.001
      
      // 自动旋转
      if (autoRotate) cameraAngle += 0.001
      
      // 更新相机
      camera.position.x = Math.cos(cameraAngle) * cameraDistance
      camera.position.y = cameraHeight
      camera.position.z = Math.sin(cameraAngle) * cameraDistance
      camera.lookAt(0, 4, 0)
      
      // 星球脉冲
      planets.forEach((group, idx) => {
        group.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.userData.type === 'planet') {
            if (child.scale.x < 1.4) {
              const pulse = 1 + Math.sin(time * 0.8 + idx) * 0.04
              child.scale.set(pulse, pulse, pulse)
            }
          } else if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
            child.rotation.z += child.userData.rotationSpeed || 0
          }
        })
      })
      
      // 卫星轨道运动
      satellites.forEach(sat => {
        if (sat.userData.type === 'satellite') {
          sat.userData.orbitAngle += sat.userData.orbitSpeed
          
          const angle = sat.userData.orbitAngle
          const pos = sat.userData.planetPos
          const r = sat.userData.orbitRadius
          const tiltX = sat.userData.orbitTiltX
          const tiltY = sat.userData.orbitTiltY
          
          sat.position.x = pos[0] + Math.cos(angle) * r
          sat.position.y = pos[1] + Math.sin(angle) * r * Math.sin(tiltX) + Math.cos(angle * 2) * tiltY
          sat.position.z = pos[2] + Math.sin(angle) * r * Math.cos(tiltX)
          
          sat.rotation.y += 0.015
        } else if (sat.userData.pulsate) {
          // 汇合点脉动
          const pulse = 1 + Math.sin(time * 3) * 0.2
          sat.scale.set(pulse, pulse, pulse)
        } else if (sat.userData.oscillate) {
          // 碰撞点摆动
          sat.position.y = sat.userData.originalY || sat.position.y
          sat.position.y += Math.sin(time * 2) * 0.3
        }
      })
      
      // 粒子运动
      particles.forEach(p => {
        if (p.userData.curve) {
          p.userData.progress += p.userData.speed
          if (p.userData.progress > 1) {
            p.userData.progress = 0
            
            // Feedback粒子回到起点时触发充能效果
            if (p.userData.chargePlanet && p.userData.progress < 0.05) {
              chargeIntensity = 2.0 // 充能！
            }
          }
          
          const point = p.userData.curve.getPoint(p.userData.progress)
          p.position.copy(point)
          
          // Feedback粒子渐亮
          if (p.userData.baseOpacity) {
            const brightness = p.userData.baseOpacity + Math.sin(p.userData.progress * Math.PI) * 0.3
            const mat = p.material as THREE.MeshBasicMaterial
            mat.opacity = brightness
          }
        }
      })
      
      // 充能效果衰减
      if (chargeIntensity > 0) {
        chargeIntensity *= 0.95
        const chargePlanet = planets[0].children.find(c => c instanceof THREE.Mesh && c.userData.type === 'planet') as THREE.Mesh
        if (chargePlanet && chargePlanet.material instanceof THREE.MeshPhongMaterial) {
          chargePlanet.material.emissiveIntensity = 0.4 + chargeIntensity
        }
      }
      
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
      
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [data, onNodeClick, focusedPlanet, moduleData])
  
  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* 标题 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <div className="bg-black/90 px-6 py-3 rounded-2xl backdrop-blur-md border border-purple-500/30">
          <div className="text-white/60 text-xs mb-1">Connection Architect System</div>
          <div className="text-white text-sm font-semibold">
            解剖学（星球-卫星）+ 生理学（能量连接）
          </div>
        </div>
      </div>
      
      {/* 图例 */}
      <Card className="absolute bottom-6 left-6 p-5 bg-black/95 border-purple-500/20 text-white backdrop-blur-md max-w-xs">
        <div className="space-y-4">
          <div>
            <div className="font-bold text-sm mb-3 text-purple-300">解剖学 - 结构</div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                <span className="font-medium">🏗️ Self-Alignment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                <span className="font-medium">🚪 Initiation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                <span className="font-medium">🏢 Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                <span className="font-medium">🏛️ Transition</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                <span className="text-white/70">卫星：环绕旋转</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-3">
            <div className="font-bold text-sm mb-3 text-green-300">生理学 - 动态</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-1 bg-green-500 rounded shadow-sm shadow-green-500/50"></div>
                <span className="text-green-400">协同（汇合↗）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-1 bg-blue-500 rounded shadow-sm shadow-blue-500/50"></div>
                <span className="text-blue-400">依赖（单向→）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-1 bg-orange-500 border-t border-dashed"></div>
                <span className="text-orange-400">权衡（碰撞⇌）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-1 bg-purple-500 rounded shadow-sm shadow-purple-500/50"></div>
                <span className="text-purple-400">反馈（循环↻）</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-3 text-[10px] text-white/50">
            <div>💡 拖拽旋转 • 滚轮缩放</div>
            <div>🎯 点击星球聚焦 • 点击卫星详情</div>
          </div>
        </div>
      </Card>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 max-w-md pointer-events-none transition-all duration-200"
          style={{
            left: tooltip.x + 25,
            top: tooltip.y - 40,
          }}
        >
          <Card className={`p-4 shadow-2xl border-2 ${
            tooltip.type === 'planet'
              ? 'bg-gradient-to-br from-black/98 to-blue-900/60 border-blue-400/60'
              : 'bg-black/98 border-white/40'
          }`}>
            <div className="text-white">
              <div className="font-bold text-base mb-2">
                {tooltip.type === 'planet' && '🪐 '}
                {tooltip.title}
              </div>
              {tooltip.description && (
                <div className="text-sm text-white/85 leading-relaxed">
                  {tooltip.description}
                </div>
              )}
              {tooltip.type === 'planet' && (
                <div className="text-xs text-blue-300 mt-2 italic">
                  💡 点击查看该模块的关键行动
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
      
      {/* 版本标识 */}
      <div className="absolute top-6 left-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-purple-500/50">
        ⭐ 最终版本
      </div>
      
      {/* 聚焦状态提示 */}
      {focusedPlanet !== null && (
        <div className="absolute top-6 right-6 bg-blue-500/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
          已聚焦：{planetNames[focusedPlanet]} • 点击星球取消聚焦
        </div>
      )}
    </div>
  )
}

