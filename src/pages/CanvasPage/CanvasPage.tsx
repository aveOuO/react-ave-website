import { useEffect, useRef } from 'react'

const CanvasPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    ctx.fillStyle = 'blue'
    ctx.fillRect(canvas.width / 2 - 25, canvas.height / 2 - 25, 50, 50)

    // 监听鼠标事件
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (
        x >= canvas.width / 2 - 25 &&
        x <= canvas.width / 2 + 25 &&
        y >= canvas.height / 2 - 25 &&
        y <= canvas.height / 2 + 25
      ) {
        ctx.fillStyle = 'red'
        ctx.fillRect(canvas.width / 2 - 25, canvas.height / 2 - 25, 50, 50)
      }
    })

    canvas.addEventListener('mouseup', function (e) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (
        x >= canvas.width / 2 - 25 &&
        x <= canvas.width / 2 + 25 &&
        y >= canvas.height / 2 - 25 &&
        y <= canvas.height / 2 + 25
      ) {
        ctx.fillStyle = 'blue'
        ctx.fillRect(canvas.width / 2 - 25, canvas.height / 2 - 25, 50, 50)
      }
    })
  }, [])

  return (
    <div className='canvas-page'>
      <div style={{ width: 'max-content', height: 'max-content', border: '1px solid black', margin: '0 auto' }}>
        <canvas ref={canvasRef} id='myCanvas' width='800' height='600'></canvas>
      </div>
    </div>
  )
}

export default CanvasPage
