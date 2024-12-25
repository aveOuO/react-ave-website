import { useEffect, useRef } from 'react'
import './index.scss'

export const MerryChristmas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawOrnament = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const colors = ['#ff0000', '#ffff00', '#ffd700', '#ff69b4', '#4169e1']
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
    ctx.fill()
  }

  const drawTreeSection = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    bottomY: number,
    width: number,
    height: number,
    isTop = false
  ) => {
    ctx.beginPath()
    ctx.moveTo(centerX - width / 2, bottomY)
    ctx.lineTo(centerX + width / 2, bottomY)

    if (isTop) {
      // 计算与梯形一致的斜边角度
      // 梯形的斜边角度约为 width/3 : height
      // 要保持相同角度，三角形顶点的x偏移量应为 0，高度应为 (width/2)/(width/3)*height
      const heightRatio = width / 2 / (width / 3)
      ctx.lineTo(centerX, bottomY - height * heightRatio)
    } else {
      ctx.lineTo(centerX + width / 3, bottomY - height)
      ctx.lineTo(centerX - width / 3, bottomY - height)
    }

    ctx.closePath()
    ctx.fillStyle = '#0a5c0a'
    ctx.fill()

    // 如果是顶部三角形，减少装饰数量
    const ornamentCount = isTop ? Math.floor(width / 30) : Math.floor(width / 20)
    for (let i = 0; i < ornamentCount; i++) {
      const ornamentX = centerX - width / 2 + (width / ornamentCount) * i
      const randomY = bottomY - Math.random() * (height - 10)
      drawOrnament(ctx, ornamentX, randomY)
    }
  }

  const drawBackgroundStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
    ctx.save()
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const longRadius = size
      const shortRadius = size / 2

      if (i === 0) {
        ctx.moveTo(x + longRadius * Math.cos(angle), y + longRadius * Math.sin(angle))
      } else {
        ctx.lineTo(x + longRadius * Math.cos(angle), y + longRadius * Math.sin(angle))
      }

      const shortAngle = angle + (2 * Math.PI) / 10
      ctx.lineTo(x + shortRadius * Math.cos(shortAngle), y + shortRadius * Math.sin(shortAngle))
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const drawTree = (ctx: CanvasRenderingContext2D, centerX: number, bottomY: number) => {
    const canvas = ctx.canvas

    // 绘制背景
    ctx.fillStyle = '#001529'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 添加背景星星
    const starCount = 100 // 星星数量
    const maxStarSize = 3 // 最大星星尺寸

    // 只在画布上半部分添加星星
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * (canvas.height * 0.6) // 限制在上部60%的区域
      const size = Math.random() * maxStarSize + 1
      const opacity = Math.random() * 0.5 + 0.3 // 随机透明度 0.3-0.8

      // 随机选择是画小五角星还是简单的圆点
      if (Math.random() > 0.7) {
        drawBackgroundStar(ctx, x, y, size, opacity)
      } else {
        ctx.beginPath()
        ctx.arc(x, y, size / 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }

      // 随机添加星星光芒
      if (Math.random() > 0.8) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(x - size * 2, y)
        ctx.lineTo(x + size * 2, y)
        ctx.moveTo(x, y - size * 2)
        ctx.lineTo(x, y + size * 2)
        ctx.stroke()
      }
    }

    // 绘制树干
    ctx.fillStyle = '#4A2F1B'
    ctx.fillRect(centerX - 15, bottomY - 40, 30, 70)

    // 绘制树层（从下到上，逐渐变小）
    const sections = 4 // 保持基础层数
    let currentWidth = 300
    let currentHeight = 80
    let currentY = bottomY - 40

    // 存储每层梯形的上边长度，用于计算宽度变化
    const layerTopWidths: number[] = []

    // 绘制基础梯形层
    for (let i = 0; i < sections; i++) {
      drawTreeSection(ctx, centerX, currentY, currentWidth, currentHeight)

      // 计算并存储当前层的上边长度
      const topWidth = currentWidth - (currentWidth / 3) * 2
      layerTopWidths.push(topWidth)

      currentWidth *= 0.8
      currentHeight *= 0.9
      currentY -= currentHeight
    }

    // 增加一层过渡梯形
    const transitionWidth = currentWidth * 0.8
    const transitionHeight = currentHeight * 0.9
    drawTreeSection(ctx, centerX, currentY, transitionWidth, transitionHeight)
    currentY -= transitionHeight

    // 计算最上层梯形的上边长度
    const lastLayerTopWidth = transitionWidth - (transitionWidth / 3) * 2
    layerTopWidths.push(lastLayerTopWidth)

    // 计算相邻层之间的宽度变化
    const avgWidthChange =
      layerTopWidths.reduce((acc, curr, idx, arr) => {
        if (idx === 0) return acc
        return acc + (arr[idx - 1] - curr)
      }, 0) /
      (layerTopWidths.length - 1)

    // 计算三角形底边长度，保持与前面层级的宽度变化一致
    const topTriangleWidth = lastLayerTopWidth + avgWidthChange
    const topTriangleHeight = transitionHeight * 0.9

    // 计算三角形的实际高度
    const triangleHeight = topTriangleHeight * ((topTriangleWidth/2)/(topTriangleWidth/3))
    const triangleTopY = currentY - triangleHeight

    // 绘制顶部三角形
    drawTreeSection(ctx, centerX, currentY, topTriangleWidth, topTriangleHeight, true)

    // 绘制五角星，确保中心点在三角形顶点
    const starSize = 20
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const longRadius = starSize
      const shortRadius = starSize / 2
      
      if (i === 0) {
        ctx.moveTo(
          centerX + longRadius * Math.cos(angle),
          triangleTopY + longRadius * Math.sin(angle)
        )
      } else {
        ctx.lineTo(
          centerX + longRadius * Math.cos(angle),
          triangleTopY + longRadius * Math.sin(angle)
        )
      }
      
      const shortAngle = angle + (2 * Math.PI) / 10
      ctx.lineTo(
        centerX + shortRadius * Math.cos(shortAngle),
        triangleTopY + shortRadius * Math.sin(shortAngle)
      )
    }
    
    ctx.closePath()
    ctx.fillStyle = '#ffd700'
    ctx.fill()

    // 绘制艺术字
    const text = 'Merry Christmas!'
    ctx.textAlign = 'center'
    
    // 添加文字阴影
    ctx.shadowColor = 'rgba(255, 0, 0, 0.3)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // 确保字体已加载
    const font = new FontFace(
      'Great Vibes',
      `url(${new URL('@/assets/fonts/GreatVibes-Regular.ttf', import.meta.url)})`
    );

    font.load().then(() => {
      // 添加字体到文档
      document.fonts.add(font);
      
      // 绘制文字
      ctx.font = 'bold 48px "Great Vibes"'
      const gradient = ctx.createLinearGradient(
        centerX - 100,
        50,
        centerX + 100,
        80
      )
      gradient.addColorStop(0, '#ff0000')    // 红色
      gradient.addColorStop(0.5, '#ffffff')   // 白色
      gradient.addColorStop(1, '#ff0000')    // 红色
      
      ctx.fillStyle = gradient
      ctx.fillText(text, centerX, 80)
    });

    // 清除阴影效果，避免影响其他绘制
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景
    ctx.fillStyle = '#001529'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制圣诞树
    drawTree(ctx, canvas.width / 2, canvas.height - 80)

    // 添加文字
    ctx.font = '30px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    // ctx.fillText('Merry Christmas!', canvas.width / 2, 80)
  }, [])

  return (
    <div className='merry-christmas'>
      <canvas ref={canvasRef} width={800} height={700} />
    </div>
  )
}
