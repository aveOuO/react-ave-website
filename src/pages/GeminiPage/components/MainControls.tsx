import { BulbFilled, BulbOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Input, Layout } from 'antd'
import React from 'react'

interface MainControlsProps {
  onThemeChange: () => void
  isDarkMode: boolean
}

const MainControls: React.FC<MainControlsProps> = ({ onThemeChange, isDarkMode }) => {
  const [showSetting] = React.useState(false)
  return (
    <>
      <div className='mb-[10px]'>
        <Input.Password placeholder='请输入提供的API Key'></Input.Password>
      </div>
      <div className='flex items-center'>
        <Button type='primary' size='large'>
          建立链接
        </Button>
        <Button
          shape='circle'
          type='primary'
          size='large'
          icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
          className='ml-auto'
          onClick={onThemeChange}></Button>
        {showSetting && (
          <Button shape='circle' type='primary' size='large' icon={<SettingOutlined />} className='ml-[10px]'></Button>
        )}
      </div>
    </>
  )
}

export default MainControls
