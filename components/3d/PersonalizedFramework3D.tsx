'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Scene3DData, Node3D } from '@/lib/3d-mapper'

interface PersonalizedFramework3DProps {
  data: Scene3DData
  onNodeClick?: (node: Node3D) => void
  autoRotate?: boolean
}

export function PersonalizedFramework3D({
  data,
  onNodeClick,
  autoRotate = false,
}: PersonalizedFramework3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const nodeMapRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const particlesRef = useRef<THREE.Mesh[]>([])
  const animationFrameRef = useRef<number>(0)
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    content: string
    description?: string
    status?: string
    recommendations?: string[]
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
    
    // 增强光照系统（个性化版本更明亮）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)
    
    const pointLight1 = new THREE.PointLight(0x3b82f6, 1.2, 50)
    pointLight1.position.set(10, 5, 10)
    scene.add(pointLight1)
    
    const pointLight2 = new THREE.PointLight(0x10b981, 1.2, 50)
    pointLight2.position.set(-10, 5, -10)
    scene.add(pointLight2)
    
    // ============ Phase 2: 节点创建（增强版） ============
    data.nodes.forEach((nodeData) => {
      const nodeScale = nodeData.scale || 1.0
      
      // 主球体
      const geometry = new THREE.SphereGeometry(0.5 * nodeScale, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(nodeData.color),
        emissive: new THREE.Color(nodeData.color),
        emissiveIntensity: nodeData.status === 'opportunity' ? 0.5 : 0.3,
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
        originalScale: nodeScale,
      }
      
      scene.add(mesh)
      nodeMapRef.current.set(nodeData.id, mesh)
      
      // 基础光晕
      const glowGeometry = new THREE.SphereGeometry(0.65 * nodeScale, 32, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(nodeData.color),
        transparent: true,
        opacity: 0.2,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.set(...nodeData.position)
      scene.add(glow)
      
      // Strength节点：额外绿色光晕
      if (nodeData.status === 'strength') {
        const strengthGlow = new THREE.Mesh(
          new THREE.SphereGeometry(0.8 * nodeScale, 32, 32),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('#10b981'),
            transparent: true,
            opacity: 0.25,
          })
        )
        strengthGlow.position.set(...nodeData.position)
        scene.add(strengthGlow)
      }
      
      // Opportunity节点：强烈橙色脉冲光晕
      if (nodeData.status === 'opportunity') {
        const opportunityGlow = new THREE.Mesh(
          new THREE.SphereGeometry(0.9 * nodeScale, 32, 32),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('#f97316'),
            transparent: true,
            opacity: 0.3,
          })
        )
        opportunityGlow.position.set(...nodeData.position)
        scene.add(opportunityGlow)
        
        // 保存到userData以便后续动画
        mesh.userData.opportunityGlow = opportunityGlow
      }
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
        mat.emissiveIntensity = mesh.userData.nodeData.status === 'opportunity' ? 0.5 : 0.3
        const originalScale = mesh.userData.originalScale || 1.0
        mesh.scale.set(originalScale, originalScale, originalScale)
      })
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        const mat = mesh.material as THREE.MeshPhongMaterial
        mat.emissiveIntensity = 0.8
        const originalScale = mesh.userData.originalScale || 1.0
        mesh.scale.set(originalScale * 1.2, originalScale * 1.2, originalScale * 1.2)
        
        // 显示增强tooltip
        const nodeData = mesh.userData.nodeData
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          content: nodeData.label,
          description: nodeData.description,
          status: nodeData.status,
          recommendations: nodeData.recommendations,
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
      
      rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.x))
      
      previousMousePosition = { x: e.clientX, y: e.clientY }
    }
    
    const onMouseUp = () => {
      isDragging = false
    }
    
    containerRef.current.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMoveCamera)
    window.addEventListener('mouseup', onMouseUp)
    
    // ============ 动画循环（增强版） ============
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      
      if (autoRotate) {
        rotation.y += 0.005
      }
      
      // 相机旋转
      const radius = 17
      camera.position.x = radius * Math.sin(rotation.y) * Math.cos(rotation.x)
      camera.position.y = 12 + radius * Math.sin(rotation.x)
      camera.position.z = radius * Math.cos(rotation.y) * Math.cos(rotation.x)
      camera.lookAt(0, 3, 0)
      
      // 节点呼吸效果（增强版）
      let nodeIndex = 0
      nodeMapRef.current.forEach((mesh) => {
        const phase = Date.now() * 0.001 + nodeIndex * 0.5
        const originalScale = mesh.userData.originalScale || 1.0
        nodeIndex++
        
        if (mesh.scale.x < originalScale * 1.15) {
          if (mesh.userData.nodeData.status === 'opportunity') {
            // Opportunity节点：强烈脉冲
            const pulseScale = 1 + Math.sin(phase * 3) * 0.15
            const scale = originalScale * pulseScale
            mesh.scale.set(scale, scale, scale)
            
            // 同步光晕脉冲
            if (mesh.userData.opportunityGlow) {
              const glowScale = 1 + Math.sin(phase * 3) * 0.1
              mesh.userData.opportunityGlow.scale.set(glowScale, glowScale, glowScale)
            }
          } else if (mesh.userData.nodeData.status === 'strength') {
            // Strength节点：稳定呼吸
            const breathScale = 1 + Math.sin(phase) * 0.03
            const scale = originalScale * breathScale
            mesh.scale.set(scale, scale, scale)
          } else {
            // Maintenance节点：轻微呼吸
            const breathScale = 1 + Math.sin(phase) * 0.05
            const scale = originalScale * breathScale
            mesh.scale.set(scale, scale, scale)
          }
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
      cancelAnimationFrame(animationFrameRef.current)
      window.removeEventListener('resize', handleResize)
      const container = containerRef.current
      container?.removeEventListener('mousemove', onMouseMove)
      container?.removeEventListener('click', onClick)
      container?.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMoveCamera)
      window.removeEventListener('mouseup', onMouseUp)
      
      // 清理Three.js资源
      const nodes = nodeMapRef.current
      nodes.forEach((mesh) => {
        mesh.geometry.dispose()
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose()
        }
      })
      const particles = particlesRef.current
      particles.forEach((particle) => {
        particle.geometry.dispose()
        if (particle.material instanceof THREE.Material) {
          particle.material.dispose()
        }
      })
      
      renderer.dispose()
      if (container?.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [data, onNodeClick, autoRotate])
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'strength':
        return <span className="text-green-400">🟢 Strength Zone</span>
      case 'opportunity':
        return <span className="text-orange-400">🟠 Opportunity Zone</span>
      case 'maintenance':
        return <span className="text-yellow-400">🟡 Maintenance Zone</span>
      default:
        return null
    }
  }
  
  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Enhanced Tooltip with Recommendations */}
      {tooltip.visible && (
        <div
          className="absolute z-50 px-4 py-3 bg-black/95 text-white text-sm rounded-lg pointer-events-none max-w-md border border-white/20"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          <div className="font-semibold text-base mb-1">{tooltip.content}</div>
          
          {tooltip.status && (
            <div className="mb-2">{getStatusBadge(tooltip.status)}</div>
          )}
          
          {tooltip.description && (
            <div className="text-xs text-gray-300 mb-2">{tooltip.description}</div>
          )}
          
          {tooltip.recommendations && tooltip.recommendations.length > 0 && (
            <div className="mt-3 pt-2 border-t border-white/20">
              <div className="text-xs font-semibold text-orange-400 mb-1">
                🎯 Next Moves:
              </div>
              <ul className="text-xs text-gray-200 space-y-1">
                {tooltip.recommendations.map((rec, i) => (
                  <li key={i} className="pl-2">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

