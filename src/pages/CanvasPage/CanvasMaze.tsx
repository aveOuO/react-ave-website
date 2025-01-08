import React, { useEffect, useRef, useState } from 'react'
import { Button, Select, InputNumber, Space } from 'antd'
import './maze.scss'
import { useDevMode } from '@/hooks/useDevMode'
import lodashEs from '@/utils/lodash-es'

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
  const isDevMode = useDevMode()

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
    const stack: [number, number][] = [startCell]
    maze[startCell[0]][startCell[1]].visited = true

    while (stack.length > 0) {
      const [row, col] = stack[stack.length - 1]

      // 如果是出口格子（右下角）
      if (row === gridSize - 1 && col === gridSize - 1) {
        // 优先尝试从上方进入
        if (row > 0 && maze[row - 1][col].visited) {
          maze[row][col].walls[0] = false // 打开上墙
          maze[row - 1][col].walls[2] = false // 打开上一格的下墙
          // 确保其他墙壁都是封闭的
          maze[row][col].walls[1] = true // 右
          maze[row][col].walls[2] = true // 下
          maze[row][col].walls[3] = true // 左
          stack.pop()
          continue
        }
        // 如果上方不行，则从左方进入
        if (col > 0 && maze[row][col - 1].visited) {
          maze[row][col].walls[3] = false // 打开左墙
          maze[row][col - 1].walls[1] = false // 打开左边格子的右墙
          // 确保其他墙壁都是封闭的
          maze[row][col].walls[0] = true // 上
          maze[row][col].walls[1] = true // 右
          maze[row][col].walls[2] = true // 下
          stack.pop()
          continue
        }
      }

      const directions = [
        [-1, 0], // 上
        [0, 1], // 右
        [1, 0], // 下
        [0, -1] // 左
      ]

      const shuffledDirections = directions
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

      let hasUnvisitedNeighbor = false

      for (const [dy, dx] of shuffledDirections) {
        const newRow = row + dy
        const newCol = col + dx

        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && !maze[newRow][newCol].visited) {
          // 打开相应的墙
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

          maze[newRow][newCol].visited = true
          stack.push([newRow, newCol])
          hasUnvisitedNeighbor = true
          break
        }
      }

      if (!hasUnvisitedNeighbor) {
        stack.pop()
      }
    }

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
    const stack: Position[] = []
    const visited = new Set<string>()
    const currentPos: Position = { row: 0, col: 0 }

    const posToString = (pos: Position) => `${pos.row},${pos.col}`

    // 修改 sleep 函数以设置最小延迟时间
    const sleep = (ms: number) =>
      new Promise(
        (resolve) => setTimeout(resolve, Math.max(10, ms / speed)) // 确保最小延迟为10ms
      )

    // 修改动画函数
    const animateMovement = async (from: Position, to: Position, pathColor: string = '#ff4444') => {
      // 验证移动是否合法（是否有墙）
      const isValidMove = () => {
        // 检查是否是相邻格子
        const dx = to.col - from.col
        const dy = to.row - from.row

        if (Math.abs(dx) + Math.abs(dy) !== 1) return false

        // 检查两个格子之间是否有墙
        if (dy === -1) {
          // 向上移动
          return !maze[from.row][from.col].walls[0] && !maze[to.row][to.col].walls[2]
        } else if (dx === 1) {
          // 向右移动
          return !maze[from.row][from.col].walls[1] && !maze[to.row][to.col].walls[3]
        } else if (dy === 1) {
          // 向下移动
          return !maze[from.row][from.col].walls[2] && !maze[to.row][to.col].walls[0]
        } else if (dx === -1) {
          // 向左移动
          return !maze[from.row][from.col].walls[3] && !maze[to.row][to.col].walls[1]
        }
        return false
      }

      // 验证移动是否合法
      if (!isValidMove()) {
        console.warn('Invalid move detected:', from, to)
        return false
      }

      // 根据速度调整步数，但保持最小步数
      const baseSteps = 10
      const steps = Math.max(3, Math.floor(baseSteps / Math.sqrt(speed)))

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
          cellSize * 0.3,
          0,
          Math.PI * 2
        )
        context.fill()

        await sleep(5) // 每帧之间的最小延迟
      }

      return true
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

    // 添加获取有效移动的函数
    const getValidMoves = (pos: Position): Position[] => {
      const moves: Position[] = []
      const { row, col } = pos

      // 检查四个方向 [上, 右, 下, 左]
      if (!maze[row][col].walls[0] && row > 0) moves.push({ row: row - 1, col }) // 上
      if (!maze[row][col].walls[1] && col < gridSize - 1) moves.push({ row, col: col + 1 }) // 右
      if (!maze[row][col].walls[2] && row < gridSize - 1) moves.push({ row: row + 1, col }) // 下
      if (!maze[row][col].walls[3] && col > 0) moves.push({ row, col: col - 1 }) // 左

      return moves
    }

    // 新增：先找到到终点的路径
    const findPathToEnd = (pos: Position, visitedPath = new Set<string>()): Position[] | null => {
      if (pos.row === gridSize - 1 && pos.col === gridSize - 1) {
        return [pos]
      }

      visitedPath.add(posToString(pos))
      const validMoves = getValidMoves(pos).filter((move) => !visitedPath.has(posToString(move)))

      for (const nextPos of validMoves) {
        const path = findPathToEnd(nextPos, new Set(visitedPath))
        if (path) {
          return [pos, ...path]
        }
      }
      return null
    }

    // 获取到终点的正确路径
    const pathToEnd = findPathToEnd(currentPos) || []
    const correctPathSet = new Set(pathToEnd.map(posToString))

    // 修改 getValidMovesWithPriority 函数
    const getValidMovesWithPriority = (pos: Position): Position[] => {
      const moves = getValidMoves(pos).filter((move) => !visited.has(posToString(move)))
      return moves.sort((a, b) => {
        const aInCorrectPath = correctPathSet.has(posToString(a))
        const bInCorrectPath = correctPathSet.has(posToString(b))
        if (aInCorrectPath && !bInCorrectPath) return 1
        if (!aInCorrectPath && bInCorrectPath) return -1
        return Math.random() - 0.5 // 随机排序非正确路径的移动
      })
    }

    const explore = async (pos: Position) => {
      if (visited.has(posToString(pos))) return false

      // 检查是否到达终点
      if (pos.row === gridSize - 1 && pos.col === gridSize - 1) {
        visited.add(posToString(pos))
        return true
      }

      visited.add(posToString(pos))
      stack.push(pos)

      const validMoves = getValidMovesWithPriority(pos)

      for (const nextPos of validMoves) {
        if (!visited.has(posToString(nextPos))) {
          const moveSuccess = await animateMovement(pos, nextPos, '#ff4444')
          if (!moveSuccess) continue

          drawPath(pos, nextPos, '#ff4444')

          const reachedEnd = await explore(nextPos)
          if (reachedEnd) return true

          // 只有在移动成功时才进行回溯
          const backtrackSuccess = await animateMovement(nextPos, pos, '#4444ff')
          if (backtrackSuccess) {
            drawPath(pos, nextPos, '#4444ff')
          }
        }
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
    // 在开发者模式下输出迷宫数组
    if (isDevMode) {
      console.log('迷宫数组:', lodashEs.cloneDeep(maze))
    }
    setMazeData(maze)
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    drawMaze(context, maze)
    setIsFinished(false)
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
    // 重新生成迷宫
    handleGenerateMaze()
  }

  // 修改计算单元格大小的函数
  const calculateCellSize = (size: number) => {
    // 获取视口的宽度和高度
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 计算可用空间（考虑边距和控制面板的高度）
    const availableWidth = Math.min(viewportWidth - 40, 750) - padding * 2 // 左右边距20px
    const availableHeight = viewportHeight - 200 - padding * 2 // 预留控制面板空间

    // 使用较小的值来确保完整显示
    const maxCellSize = Math.min(Math.floor(availableWidth / size), Math.floor(availableHeight / size))

    return Math.max(10, maxCellSize) // 确保最小单元格大小为10px
  }

  // 添加窗口大小变化的监听
  useEffect(() => {
    const handleResize = () => {
      const newCellSize = calculateCellSize(gridSize)
      setCellSize(newCellSize)

      // 如果迷宫已经存在，重新绘制
      if (mazeData.length > 0) {
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) return
        drawMaze(context, mazeData)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
              // 开发者模式下显示额外选项
              ...(isDevMode
                ? [
                    { value: 5, label: '5 x 5' },
                    { value: 10, label: '10 x 10' },
                    { value: 15, label: '15 x 15' }
                  ]
                : []),
              { value: 20, label: '20 x 20' },
              { value: 25, label: '25 x 25' },
              { value: 30, label: '30 x 30' },
              { value: 35, label: '35 x 35' },
              { value: 40, label: '40 x 40' },
              { value: 45, label: '45 x 45' },
              { value: 50, label: '50 x 50' },
              { value: 55, label: '55 x 55' },
              { value: 60, label: '60 x 60' },
              { value: 65, label: '65 x 65' },
              { value: 70, label: '70 x 70' },
              { value: 75, label: '75 x 75' },
              { value: 80, label: '80 x 80' },
              { value: 85, label: '85 x 85' },
              { value: 90, label: '90 x 90' },
              { value: 95, label: '95 x 95' },
              { value: 100, label: '100 x 100' }
            ]}
            style={{ width: 150 }}
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
