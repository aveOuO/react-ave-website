import React, { FC, useEffect } from 'react'
import ClickButton from './ClickButton'
import dayjs, { Dayjs } from 'dayjs'
import './index.css'

const ClickCounter: FC = () => {
  const [count, setCount] = React.useState<Dayjs[]>([])
  const [maxCount, setMaxCount] = React.useState<number>(0)

  const [timer, setTimer] = React.useState<number>()

  const startCount = () => {
    const now = dayjs()
    setCount((preCount) => {
      const res = preCount.filter((item) => now.diff(item, 'second') < 1)
      return res
    })
    setTimer(requestAnimationFrame(startCount))
  }

  useEffect(() => {
    setMaxCount((preMaxCount) => {
      return count.length > preMaxCount ? count.length : preMaxCount
    })
    if (!count.length && timer) {
      cancelAnimationFrame(timer)
    }
  }, [count, timer])

  const onClick = () => {
    setCount((preCount) => {
      return [...preCount, dayjs()]
    })

    // 第一次点击就开启定时器
    if (!count.length) {
      if (timer) cancelAnimationFrame(timer)
      setTimer(requestAnimationFrame(startCount))
    }
  }

  return (
    <div className='click-counter'>
      <h1>
        CPS: {count.length}，最大CPS: {maxCount}
      </h1>
      <ClickButton onClick={onClick}></ClickButton>
    </div>
  )
}
export default ClickCounter
