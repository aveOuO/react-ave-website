import React, { useEffect, useRef, useState } from 'react'
import { Button, Select, InputNumber, Space } from 'antd'
import './maze.scss'

interface Cell {
  visited: boolean
  walls: boolean[] // [top, right, bottom, left]
}

interface Position {
  row: number
  col: number
}

export const CanvasMaze: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gridSize, setGridSize] = useState(50)
  const [speed, setSpeed] = useState(1)
  const [cellSize, setCellSize] = useState(15)
  const [isExploring, setIsExploring] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [mazeData, setMazeData] = useState<Cell[][]>([])
  const padding = 20 // 添加内边距用于显示箭头

  const generateMaze = () => {
    const maze: Cell[][] = Array(gridSize)
      .fill(null)
      .map(() =>
        Array(gridSize)
          .fill(null)
          .map(() => ({
            visited: false,
            walls: [true, true, true, true] // [top, right, bottom, left]
          }))
      )

    const startCell: [number, number] = [0, 0]

    const dfs = (row: number, col: number) => {
      maze[row][col].visited = true

      // 如果是出口格子（右下角），确保只有一个方向开放
      if (row === gridSize - 1 && col === gridSize - 1) {
        // 优先尝试从上方进入
        if (row > 0 && maze[row - 1][col].visited) {
          maze[row][col].walls[0] = false // 打开上墙
          maze[row - 1][col].walls[2] = false // 打开上一格的下墙
          // 确保其他墙壁都是封闭的
          maze[row][col].walls[1] = true // 右
          maze[row][col].walls[2] = true // 下
          maze[row][col].walls[3] = true // 左
          return
        }
        // 如果上方不行，则从左方进入
        if (col > 0 && maze[row][col - 1].visited) {
          maze[row][col].walls[3] = false // 打开左墙
          maze[row][col - 1].walls[1] = false // 打开左边格子的右墙
          // 确保其他墙壁都是封闭的
          maze[row][col].walls[0] = true // 上
          maze[row][col].walls[1] = true // 右
          maze[row][col].walls[2] = true // 下
          return
        }
        return
      }

      const directions = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1]
      ]

      const shuffledDirections = directions
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

      for (const [dy, dx] of shuffledDirections) {
        const newRow = row + dy
        const newCol = col + dx

        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && !maze[newRow][newCol].visited) {
          if (dy === -1) {
            maze[row][col].walls[0] = false
            maze[newRow][newCol].walls[2] = false
          } else if (dx === 1) {
            maze[row][col].walls[1] = false
            maze[newRow][newCol].walls[3] = false
          } else if (dy === 1) {
            maze[row][col].walls[2] = false
            maze[newRow][newCol].walls[0] = false
          } else if (dx === -1) {
            maze[row][col].walls[3] = false
            maze[newRow][newCol].walls[1] = false
          }

          dfs(newRow, newCol)
        }
      }
    }

    dfs(startCell[0], startCell[1])
    return maze
  }

  const drawMaze = (context: CanvasRenderingContext2D, maze: Cell[][]) => {
    context.clearRect(0, 0, gridSize * cellSize + padding * 2, gridSize * cellSize + padding * 2)

    // 移动整个迷宫的起始位置，为箭头留出空间
    context.translate(padding, padding)

    // 绘制迷宫主体
    context.strokeStyle = '#d0d0d0'
    context.lineWidth = 1

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = maze[row][col]
        const x = col * cellSize
        const y = row * cellSize

        // 绘制墙壁
        context.beginPath()
        if (cell.walls[0]) {
          context.moveTo(x, y)
          context.lineTo(x + cellSize, y)
        }
        if (cell.walls[1]) {
          context.moveTo(x + cellSize, y)
          context.lineTo(x + cellSize, y + cellSize)
        }
        if (cell.walls[2]) {
          context.moveTo(x, y + cellSize)
          context.lineTo(x + cellSize, y + cellSize)
        }
        if (cell.walls[3]) {
          context.moveTo(x, y)
          context.lineTo(x, y + cellSize)
        }
        context.stroke()
      }
    }

    // 确定入口方向
    const entryCell = maze[0][0]
    let entryDirection = ''
    if (!entryCell.walls[2]) entryDirection = 'down'
    else if (!entryCell.walls[1]) entryDirection = 'right'

    // 确定出口方向
    const exitCell = maze[gridSize - 1][gridSize - 1]
    let exitDirection = ''
    if (!exitCell.walls[0]) exitDirection = 'up'
    else if (!exitCell.walls[3]) exitDirection = 'left'

    // 绘制入口箭头
    context.beginPath()
    context.strokeStyle = '#2E7D32'
    context.lineWidth = 2

    const entryArrowSize = cellSize * 0.8
    if (entryDirection === 'down') {
      // 向下的箭头
      context.moveTo(cellSize / 2, -entryArrowSize / 2)
      context.lineTo(cellSize / 2, cellSize / 2)
      // 箭头两翼
      context.moveTo(cellSize / 2, cellSize / 2)
      context.lineTo(cellSize / 4, cellSize / 4)
      context.moveTo(cellSize / 2, cellSize / 2)
      context.lineTo((cellSize * 3) / 4, cellSize / 4)
    } else {
      // 向右的箭头
      context.moveTo(-entryArrowSize / 2, cellSize / 2)
      context.lineTo(cellSize / 2, cellSize / 2)
      // 箭头两翼
      context.moveTo(cellSize / 2, cellSize / 2)
      context.lineTo(cellSize / 4, cellSize / 4)
      context.moveTo(cellSize / 2, cellSize / 2)
      context.lineTo(cellSize / 4, (cellSize * 3) / 4)
    }
    context.stroke()

    // 绘制出口箭头
    context.beginPath()
    context.strokeStyle = '#C62828'
    context.lineWidth = 2

    const exitX = (gridSize - 1) * cellSize
    const exitY = (gridSize - 1) * cellSize

    if (exitDirection === 'up') {
      // 向上的箭头
      context.moveTo(exitX + cellSize / 2, exitY + cellSize / 2)
      context.lineTo(exitX + cellSize / 2, exitY + cellSize + entryArrowSize / 2)
      // 箭头两翼
      context.moveTo(exitX + cellSize / 2, exitY + cellSize + entryArrowSize / 2)
      context.lineTo(exitX + cellSize / 4, exitY + cellSize + entryArrowSize / 4)
      context.moveTo(exitX + cellSize / 2, exitY + cellSize + entryArrowSize / 2)
      context.lineTo(exitX + (cellSize * 3) / 4, exitY + cellSize + entryArrowSize / 4)
    } else {
      // 向左的箭头
      context.moveTo(exitX + cellSize / 2, exitY + cellSize / 2)
      context.lineTo(exitX + cellSize + entryArrowSize / 2, exitY + cellSize / 2)
      // 箭头两翼
      context.moveTo(exitX + cellSize + entryArrowSize / 2, exitY + cellSize / 2)
      context.lineTo(exitX + cellSize + entryArrowSize / 4, exitY + cellSize / 4)
      context.moveTo(exitX + cellSize + entryArrowSize / 2, exitY + cellSize / 2)
      context.lineTo(exitX + cellSize + entryArrowSize / 4, exitY + (cellSize * 3) / 4)
    }
    context.stroke()

    // 重置变换以避免影响后续绘制
    context.setTransform(1, 0, 0, 1, 0, 0)
  }

  const exploreMaze = async (context: CanvasRenderingContext2D, maze: Cell[][]) => {
    const playerRadius = cellSize * 0.3
    const stack: Position[] = []
    const visited = new Set<string>()
    const currentPos: Position = { row: 0, col: 0 }

    const posToString = (pos: Position) => `${pos.row},${pos.col}`

    // 修改 sleep 函数以更好地响应速度变化
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, Math.max(1, ms / speed)))

    // 修改动画函数以使用速度控制
    const animateMovement = async (from: Position, to: Position, pathColor: string = '#ff4444') => {
      // 根据速度调整步数，速度越快步数越少
      const baseSteps = 8
      const steps = Math.max(5, Math.floor(baseSteps / speed))
      const deltaX = ((to.col - from.col) * cellSize) / steps
      const deltaY = ((to.row - from.row) * cellSize) / steps

      for (let i = 0; i <= steps; i++) {
        // 清除整个画布上的玩家
        context.save()
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        context.restore()

        // 重绘迷宫和已探索的路径
        drawMaze(context, maze)
        drawExploredPaths()

        // 绘制当前移动中的路径
        context.beginPath()
        context.strokeStyle = pathColor
        context.lineWidth = 2
        context.moveTo(padding + from.col * cellSize + cellSize / 2, padding + from.row * cellSize + cellSize / 2)
        context.lineTo(
          padding + from.col * cellSize + cellSize / 2 + deltaX * i,
          padding + from.row * cellSize + cellSize / 2 + deltaY * i
        )
        context.stroke()

        // 绘制当前位置的玩家
        context.beginPath()
        context.fillStyle = '#4CAF50'
        context.arc(
          padding + from.col * cellSize + cellSize / 2 + deltaX * i,
          padding + from.row * cellSize + cellSize / 2 + deltaY * i,
          playerRadius,
          0,
          Math.PI * 2
        )
        context.fill()

        // 根据速度调整每帧延迟
        await sleep(5)
      }
    }

    // 存储已探索的路径
    const exploredPaths: { from: Position; to: Position; color: string }[] = []

    // 绘制所有已探索的路径
    const drawExploredPaths = () => {
      exploredPaths.forEach((path) => {
        context.beginPath()
        context.strokeStyle = path.color
        context.lineWidth = 2
        context.moveTo(
          padding + path.from.col * cellSize + cellSize / 2,
          padding + path.from.row * cellSize + cellSize / 2
        )
        context.lineTo(padding + path.to.col * cellSize + cellSize / 2, padding + path.to.row * cellSize + cellSize / 2)
        context.stroke()
      })
    }

    const drawPath = (from: Position, to: Position, color: string) => {
      exploredPaths.push({ from, to, color })
      drawExploredPaths()
    }

    // 修正获取有效移动方向的函数
    const getValidMoves = (pos: Position): Position[] => {
      const moves: Position[] = []
      const cell = maze[pos.row][pos.col]

      // 检查四个方向的墙壁
      // 上：如果当前格子的上墙是开放的
      if (!cell.walls[0] && pos.row > 0) {
        moves.push({ row: pos.row - 1, col: pos.col })
      }
      // 右：如果当前格子的右墙是开放的
      if (!cell.walls[1] && pos.col < gridSize - 1) {
        moves.push({ row: pos.row, col: pos.col + 1 })
      }
      // 下：如果当前格子的下墙是开放的
      if (!cell.walls[2] && pos.row < gridSize - 1) {
        moves.push({ row: pos.row + 1, col: pos.col })
      }
      // 左：如果当前格子的左墙是开放的
      if (!cell.walls[3] && pos.col > 0) {
        moves.push({ row: pos.row, col: pos.col - 1 })
      }

      // 过滤掉已访问的格子
      return moves.filter((move) => !visited.has(posToString(move)))
    }

    // DFS探索
    const explore = async (pos: Position) => {
      visited.add(posToString(pos))
      stack.push(pos)

      if (pos.row === gridSize - 1 && pos.col === gridSize - 1) {
        return true
      }

      const validMoves = getValidMoves(pos)

      for (const nextPos of validMoves) {
        // 前进时使用红色路径
        await animateMovement(pos, nextPos, '#ff4444')
        drawPath(pos, nextPos, '#ff4444')

        const found = await explore(nextPos)
        if (found) return true

        // 返回时使用蓝色路径
        await animateMovement(nextPos, pos, '#4444ff')
        // 只有在完成返回动画后才绘制最终的蓝色路径
        drawPath(pos, nextPos, '#4444ff')
      }

      stack.pop()
      return false
    }

    await explore(currentPos)
  }

  // 处理格子数量变化
  const handleGridSizeChange = (value: number) => {
    setGridSize(value)
    setCellSize(Math.floor(750 / value))
    setIsFinished(false)
    setMazeData([])
  }

  // 生成新迷宫
  const handleGenerateMaze = () => {
    const maze = generateMaze()
    setMazeData(maze)
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    drawMaze(context, maze)
  }

  // 开始探索
  const handleStartExplore = async () => {
    setIsExploring(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    await exploreMaze(context, mazeData)
    setIsFinished(true)
    setIsExploring(false)
  }

  // 重新开始
  const handleRestart = () => {
    setIsExploring(false)
    setIsFinished(false)
    setMazeData([])
  }

  // 修改原有的 useEffect，只在组件挂载时执行一次
  useEffect(() => {
    handleGenerateMaze()
  }, [])

  return (
    <div className='canvas-maze-container'>
      <Space direction='horizontal' size='middle' style={{ marginBottom: 20 }}>
        <Space>
            <span>迷宫大小：</span>
            <Select
            value={gridSize}
            onChange={handleGridSizeChange}
            disabled={isExploring}
            options={[
              { value: 25, label: '25 x 25' },
              { value: 50, label: '50 x 50' },
              { value: 75, label: '75 x 75' }
            ]}
            style={{ width: 120 }}
          />
          <Button type='primary' onClick={handleGenerateMaze} disabled={isExploring}>
            生成迷宫
          </Button>
        </Space>

        {mazeData.length > 0 && !isFinished && (
          <Space>
            <span>速度：</span>
            <InputNumber
              min={1}
              max={10}
              value={speed}
              onChange={(value) => setSpeed(value || 1)}
              disabled={isExploring}
              style={{ width: 100 }}
              placeholder='速度'
            />
            <Button type='primary' onClick={handleStartExplore} disabled={isExploring}>
              开始
            </Button>
          </Space>
        )}

        {isFinished && (
          <Button type='primary' onClick={handleRestart}>
            重新开始游戏
          </Button>
        )}
      </Space>

      <canvas ref={canvasRef} width={gridSize * cellSize + padding * 2} height={gridSize * cellSize + padding * 2} />
    </div>
  )
}
