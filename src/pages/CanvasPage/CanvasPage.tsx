import { Button, message } from 'antd'
import { useEffect, useRef } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'
class Position {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

class Snake {
  private position: Position
  private tails: Position[]
  private headColor = 'blue'
  private tailColor = 'green'
  private size = 40
  private direction: Direction = 'up'
  constructor(props: { position: Position }) {
    const { position } = props
    this.position = position
    this.tails = [new Position(position.x, position.y + 1 * this.size)]
  }

  setHeadColor(color: string) {
    this.headColor = color
  }
  setTailColor(color: string) {
    this.tailColor = color
  }

  move(gameArea: { width: number; height: number }, direction: Direction) {
    const forBidMove = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    }
    if (forBidMove[this.direction] === direction) {
      return message.error('不能反向移动')
    }
    this.direction = direction
    const { width, height } = gameArea
    this.tails.pop()
    this.tails.unshift(new Position(this.position.x, this.position.y))
    if (this.direction === 'up') {
      this.position.y -= this.size
      if (this.position.y < 0) {
        this.position.y = height - this.size
      }
      return
    }
    if (this.direction === 'down') {
      this.position.y += this.size
      if (this.position.y >= height) {
        this.position.y = 0
      }
      return
    }
    if (this.direction === 'left') {
      this.position.x -= this.size
      if (this.position.x < 0) {
        this.position.x = width - this.size
      }
      return
    }
    if (this.direction === 'right') {
      this.position.x += this.size
      if (this.position.x >= width) {
        this.position.y = 0
      }
      return
    }
  }

  drawHead(ctx: CanvasRenderingContext2D) {
    const angleMap = {
      up: 0,
      down: 180,
      left: 270,
      right: 90
    }
    const { x, y } = this.position
    ctx.save()
    // 移动旋转中心
    ctx.translate(x + this.size / 2, y + this.size / 2)
    // 旋转画布
    ctx.rotate((angleMap[this.direction] * Math.PI) / 180)
    ctx.translate(-this.size / 2, -this.size / 2)

    // 头部的下半部分方形
    ctx.fillStyle = this.headColor
    ctx.fillRect(0, this.size / 2, this.size, this.size / 2)
    // 头部上半部分半圆
    ctx.beginPath()
    ctx.arc(this.size / 2, this.size / 2, this.size / 2, Math.PI, Math.PI * 2)
    ctx.fillStyle = this.headColor
    ctx.fill()
    // 左眼
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.arc(this.size / 4, this.size / 4, this.size / 15, 0, Math.PI * 2)
    // 右眼
    ctx.arc((3 * this.size) / 4, this.size / 4, this.size / 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }

  drawTail(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.fillStyle = this.tailColor
    this.tails.forEach((tail) => {
      ctx.fillRect(tail.x, tail.y, this.size, this.size)
    })
    ctx.restore()
  }
}

class Food {
  private position: Position
  private color: string
  constructor(x: number, y: number, color: string) {
    this.position = new Position(x, y)
    this.color = color
  }
}

class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private snake: Snake
  private food?: Food
  constructor(props: { canvas: HTMLCanvasElement }) {
    const { canvas } = props
    this.canvas = canvas
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.snake = new Snake({ position: new Position(this.canvas.width / 2, this.canvas.height / 2) })
    this.init()
  }

  init() {
    this.drawSnake()
  }

  genFood() {}

  drawSnake() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.snake.drawHead(this.ctx)
    this.snake.drawTail(this.ctx)
  }

  snakeMove(direction: Direction) {
    this.snake.move({ width: this.canvas.width, height: this.canvas.height }, direction)
    this.drawSnake()
  }
}

const CanvasPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useRef<Game>()

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement

    game.current = new Game({ canvas })
  }, [])

  const move = (direction: Direction) => {
    game.current?.snakeMove(direction)
  }

  return (
    <div className='canvas-page'>
      <div style={{ width: 'max-content', height: 'max-content', border: '1px solid black', margin: '0 auto' }}>
        <canvas ref={canvasRef} id='myCanvas' width='1200' height='800'></canvas>
      </div>
      <Button onClick={() => move('up')}>上移动</Button>
      <Button onClick={() => move('left')}>左移动</Button>
      <Button onClick={() => move('right')}>右移动</Button>
      <Button onClick={() => move('down')}>下移动</Button>
    </div>
  )
}

export default CanvasPage
