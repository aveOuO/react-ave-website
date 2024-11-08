import React from 'react'
import { Layout } from 'antd'
// import ClickCounter from './components/ClickCounter/ClickCounter'
import { SiteHeader } from './components/SiteHeader'
import { Outlet } from 'react-router-dom'

const { Header, Content } = Layout

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <SiteHeader></SiteHeader>
      </Header>
      <Content style={{ position: 'relative' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}

export default App
