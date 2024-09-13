import logoUrl from '../../assets/logo.svg'
import type { MenuProps } from 'antd'
import { useState } from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]
const items: MenuItem[] = [
  {
    label: '首页',
    key: '/'
  },
  {
    label: 'CPS测试',
    key: '/cps'
  },
  { label: '画布', key: '/canvas' }
]

export const SiteHeader: React.FC = () => {
  const location = useLocation()
  const [current, setCurrent] = useState(location.pathname)
  const nav = useNavigate()
  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key)
    nav(e.key, { replace: true })
  }
  return (
    <>
      <div style={{ height: '100%', display: 'flex', marginRight: '10px' }}>
        <img style={{ width: '160px', margin: 'auto 0' }} src={logoUrl} alt='泉塘小子logo' />
      </div>
      <Menu
        theme='dark'
        mode='horizontal'
        selectedKeys={[current]}
        style={{ userSelect: 'none' }}
        items={items}
        onClick={onClick}
      />
    </>
  )
}
