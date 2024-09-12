import logoUrl from '../../assets/logo.svg'
import type { MenuProps } from 'antd'
import { Menu, theme } from 'antd'

export const SiteHeader: React.FC = () => {
  return (
    <>
      <div style={{ height: '100%', display: 'flex' }}>
        <img style={{ width: '160px', margin: 'auto 0' }} src={logoUrl} alt='泉塘小子logo' />
      </div>
    </>
  )
}
