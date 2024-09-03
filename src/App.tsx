import React, { useState } from 'react'
import { Button, message } from 'antd'
import { useMyDialog } from './components/MyDialog/hooks/useMyDialog'
import './App.css'
import ClickCounter from './components/ClickCounter/ClickCounter'

const App: React.FC = () => {
  const showDialog = useMyDialog()

  const justCick = async () => {
    const clickTimes = await showDialog()
    if (clickTimes) message.warning(`好你小子，直接点了我${clickTimes}次，马上到你家门口傲。`)
  }

  return (
    <div className='app-container'>
      <div>
        <Button onClick={justCick}>打开弹窗</Button>
      </div>
      <div className='card'>
        <ClickCounter></ClickCounter>
      </div>
    </div>
  )
}

export default App
