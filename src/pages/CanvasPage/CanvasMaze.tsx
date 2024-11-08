import Konva from 'konva'
import { useEffect, useRef } from 'react'
import './maze.scss'
import { Button } from 'antd'

export const CanvasMaze = () => {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = new Konva.Stage({
      container: 'canvas-maze',
      width: container.current?.clientWidth || 0,
      height: container.current?.clientHeight || 0
    })

    const layer = new Konva.Layer()

    const circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4
    })

    layer.add(circle)

    stage.add(layer)
  })

  return (
    <>
      <Button type='primary' style={{ margin: '20px 0', alignSelf: 'center' }}>
        生成
      </Button>
      <div ref={container} id='canvas-maze' className='canvas-maze'></div>
    </>
  )
}
