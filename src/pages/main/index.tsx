import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

const { Header, Content } = Layout

export const MainPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        
      </Header>
      <Content style={{ position: 'relative' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
