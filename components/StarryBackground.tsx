'use client'

import { useEffect, useRef } from 'react'

/**
 * 星空背景组件 - 使用Canvas绘制动态星空
 * 优化性能，适配深色UI主题
 */
export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置Canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 星星数据结构
    interface Star {
      angle: number // 围绕中心的角度
      distance: number // 距离中心的距离
      radius: number
      opacity: number
      twinkleSpeed: number
      twinklePhase: number
      rotationSpeed: number // 旋转速度
    }

    // 生成星星（更多、更密集、围绕中心旋转）
    const stars: Star[] = []
    const starCount = Math.floor((canvas.width * canvas.height) / 2000) // 大幅增加密度
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        angle: Math.random() * Math.PI * 2, // 随机初始角度
        distance: Math.random() * Math.max(canvas.width, canvas.height), // 距离中心的距离
        radius: Math.random() * 2 + 0.2, // 0.2-2.2px，更多样化
        opacity: Math.random() * 0.7 + 0.2, // 0.2-0.9
        twinkleSpeed: Math.random() * 0.03 + 0.008, // 更快的闪烁
        twinklePhase: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.0008, // 缓慢旋转，有些顺时针有些逆时针
      })
    }

    // 动画循环
    let animationFrameId: number
    let frame = 0

    const animate = () => {
      // 清空画布，使用深色背景
      ctx.fillStyle = 'rgb(7, 7, 18)' // 深邃的深蓝黑色
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 计算中心点
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // 绘制并旋转星星
      stars.forEach((star) => {
        // 更新星星角度（围绕中心旋转）
        star.angle += star.rotationSpeed
        
        // 将极坐标转换为笛卡尔坐标
        const x = centerX + Math.cos(star.angle) * star.distance
        const y = centerY + Math.sin(star.angle) * star.distance
        
        // 计算闪烁效果
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinklePhase)
        const currentOpacity = star.opacity + twinkle * 0.4

        // 绘制星星本体
        ctx.beginPath()
        ctx.arc(x, y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, currentOpacity))})`
        ctx.fill()

        // 较大的星星添加光晕
        if (star.radius > 0.8) {
          const glowSize = star.radius > 1.5 ? 4 : 2.5
          const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, star.radius * glowSize
          )
          gradient.addColorStop(0, `rgba(200, 220, 255, ${currentOpacity * 0.3})`)
          gradient.addColorStop(0.5, `rgba(150, 180, 255, ${currentOpacity * 0.15})`)
          gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, star.radius * glowSize, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      frame++
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ background: 'rgb(7, 7, 18)' }}
    />
  )
}

