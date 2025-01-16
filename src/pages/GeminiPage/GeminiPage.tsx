import React, { useState } from 'react'
import MainControls from './components/MainControls'
import ConfigPanel from './components/ConfigPanel'
import ChatInterface from './components/ChatInterface'
import AudioVisualizers from './components/AudioVisualizers'
import VideoPreview from './components/VideoPreview'
import { ConfigProvider, Layout, theme } from 'antd'

const GeminiPage: React.FC = () => {
  const [_theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [showConfigPanel] = useState(false)

  return (
    <ConfigProvider
      theme={{
        algorithm: _theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}>
      <Layout style={{ padding: '20px' }} className='h-full'>
        <Layout.Content className='w-full max-w-[1000px] mx-auto'>
          <MainControls
            onThemeChange={() => setTheme(_theme === 'dark' ? 'light' : 'dark')}
            isDarkMode={_theme === 'dark'}
          />
          {showConfigPanel && <ConfigPanel />}
          <ChatInterface />
          <AudioVisualizers />
          <VideoPreview />
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}

export default GeminiPage
