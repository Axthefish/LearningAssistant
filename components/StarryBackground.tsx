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

    // 星星数据结构（第一人称视角 - 用户身处星空中）
    interface Star {
      angle: number // 在球面上的角度（水平方向）
      verticalAngle: number // 垂直角度（上下）
      depth: number // 深度层级（0-1，越小越近）
      radius: number
      baseOpacity: number
      twinkleSpeed: number
      twinklePhase: number
    }

    // 生成星星（密集分布，模拟3D球面星空）
    const stars: Star[] = []
    const starCount = Math.floor((canvas.width * canvas.height) / 1800) // 更高密度
    
    for (let i = 0; i < starCount; i++) {
      const depth = Math.random() // 0=最近 1=最远
      stars.push({
        angle: Math.random() * Math.PI * 2, // 0-360度水平分布
        verticalAngle: (Math.random() - 0.5) * Math.PI * 0.8, // 上下约±72度
        depth: depth,
        // 近处的星星更大更亮
        radius: (1 - depth * 0.7) * (Math.random() * 1.8 + 0.3), // 0.3-2.1px
        baseOpacity: (1 - depth * 0.5) * (Math.random() * 0.5 + 0.3), // 近亮远暗
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // 动画循环 - 第一人称视角旋转
    let animationFrameId: number
    let frame = 0
    let globalRotation = 0 // 全局视角旋转角度

    const animate = () => {
      // 清空画布，使用深色背景
      ctx.fillStyle = 'rgb(7, 7, 18)' // 深邃的深蓝黑色
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 用户视角缓慢旋转（模拟身处星空中环视四周）
      globalRotation += 0.0003 // 极缓慢的旋转速度

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const scale = Math.min(canvas.width, canvas.height) * 0.6 // 投影缩放

      // 绘制所有星星
      stars.forEach((star) => {
        // 当前星星的实际角度 = 初始角度 + 全局旋转 × 视差系数
        // 近处的星星（depth小）移动快，远处的星星移动慢，产生视差效果
        const parallaxFactor = 1 - star.depth * 0.6 // 0.4-1.0
        const currentAngle = star.angle + globalRotation * parallaxFactor
        
        // 球面坐标投影到2D屏幕（简化的透视投影）
        const x = centerX + Math.cos(currentAngle) * Math.cos(star.verticalAngle) * scale * (1 - star.depth * 0.3)
        const y = centerY + Math.sin(star.verticalAngle) * scale * (1 - star.depth * 0.3)
        
        // 计算闪烁效果
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinklePhase)
        const currentOpacity = star.baseOpacity + twinkle * 0.3
        
        // 根据深度调整透明度（远处更朦胧）
        const depthOpacity = 1 - star.depth * 0.4
        const finalOpacity = currentOpacity * depthOpacity

        // 绘制星星本体
        ctx.beginPath()
        ctx.arc(x, y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, finalOpacity))})`
        ctx.fill()

        // 较大或较近的星星添加光晕
        if (star.radius > 0.8 || star.depth < 0.3) {
          const glowSize = star.radius > 1.3 ? 4 : 2.5
          const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, star.radius * glowSize
          )
          gradient.addColorStop(0, `rgba(200, 220, 255, ${finalOpacity * 0.4})`)
          gradient.addColorStop(0.5, `rgba(150, 180, 255, ${finalOpacity * 0.2})`)
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

