import React, { FC, useEffect } from 'react'
import ClickButton from './ClickButton'
import dayjs, { Dayjs } from 'dayjs'
import './index.css'

const ClickCounter: FC = () => {
  const [count, setCount] = React.useState<Dayjs[]>([])
  const [timer, setTimer] = React.useState<NodeJS.Timeout>()
  const [maxCount, setMaxCount] = React.useState<number>(0)

  useEffect(() => {
    setMaxCount((preMaxCount) => {
      return count.length > preMaxCount ? count.length : preMaxCount
    })
  }, [count])

  const onClick = () => {
    setCount((preCount) => {
      return [...preCount, dayjs()]
    })

    // 第一次点击就开启定时器
    if (!count.length) {
      clearInterval(timer)
      const newTimer = setInterval(() => {
        const now = dayjs()
        setCount((preCount) => {
          const res = preCount.filter((item) => now.diff(item, 'second') < 1)
          if (!res.length) {
            setTimer((currentTimer) => {
              clearInterval(currentTimer)
              return undefined
            })
          }
          return res
        })
      }, 1000)
      setTimer(newTimer)
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
