import React from 'react'
import { Button, Layout, message } from 'antd'
import { useMyDialog } from './components/MyDialog/hooks/useMyDialog'
import './App.css'
import ClickCounter from './components/ClickCounter/ClickCounter'
import { SiteHeader } from './components/SiteHeader'

const { Header, Content } = Layout

const App: React.FC = () => {
  const showDialog = useMyDialog()

  const justCick = async () => {
    const clickTimes = await showDialog()
    if (clickTimes) message.warning(`好你小子，直接点了我${clickTimes}次，马上到你家门口傲。`)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <SiteHeader></SiteHeader>
      </Header>
      <Content>
        <div className='app-container'>
          <div>
            <Button onClick={justCick}>打开弹窗</Button>
          </div>
          <div className='card'>
            <ClickCounter></ClickCounter>
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default App
