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
      x: number
      y: number
      radius: number
      opacity: number
      twinkleSpeed: number
      twinklePhase: number
    }

    // 生成星星（更多、更动态）
    const stars: Star[] = []
    const starCount = Math.floor((canvas.width * canvas.height) / 5000) // 增加星星数量
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.3, // 0.3-2.3px，更多样化
        opacity: Math.random() * 0.6 + 0.2, // 0.2-0.8
        twinkleSpeed: Math.random() * 0.03 + 0.008, // 更快的闪烁
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // 动画循环
    let animationFrameId: number
    let frame = 0

    const animate = () => {
      // 清空画布，使用深色背景
      ctx.fillStyle = 'rgb(7, 7, 18)' // 深邃的深蓝黑色
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制星星（更动态的效果）
      stars.forEach((star) => {
        // 计算闪烁效果
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinklePhase)
        const currentOpacity = star.opacity + twinkle * 0.4

        // 绘制星星本体
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, currentOpacity))})`
        ctx.fill()

        // 所有星星添加微光晕（不只大星星）
        if (star.radius > 0.8) {
          const glowSize = star.radius > 1.5 ? 4 : 2.5
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * glowSize
          )
          gradient.addColorStop(0, `rgba(200, 220, 255, ${currentOpacity * 0.3})`)
          gradient.addColorStop(0.5, `rgba(150, 180, 255, ${currentOpacity * 0.15})`)
          gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * glowSize, 0, Math.PI * 2)
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

