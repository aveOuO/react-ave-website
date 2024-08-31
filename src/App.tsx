import React, { useState } from 'react'
import './App.css'
import { Button, message } from 'antd'
import { useMyDialog } from './components/MyDialog/hooks/useMyDialog'

const App: React.FC = () => {
  const [count, setCount] = useState(0)

  const showDialog = useMyDialog()

  const justCick = async () => {
    const clickTimes = await showDialog()
    if (clickTimes) message.warning(`好你小子，直接点了我${clickTimes}次，马上到你家门口傲。`)
  }

  return (
    <>
      <div>
        <Button onClick={justCick}>求你点我</Button>
      </div>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>点击次数 {count}</button>
      </div>
    </>
  )
}

export default App
