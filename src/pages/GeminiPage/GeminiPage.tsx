import React, { useState } from 'react'
import { ConfigProvider, Layout, theme } from 'antd'
import { RightCircleFilled } from '@ant-design/icons'
import 'highlight.js/styles/default.css'
import hljs from 'highlight.js'
import clsx from 'clsx'
import './styles/page.scss'

const GeminiPage: React.FC = () => {
  const [_theme, setTheme] = useState<'dark' | 'light'>('light')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <ConfigProvider
      theme={{
        algorithm: _theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}>
      <Layout className='h-full'>
        <Layout.Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className='relative'
          style={{ background: '#F9FBFF', borderRight: '1px solid #ddd' }}>
          <div className='cursor-pointer absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2'>
            <RightCircleFilled
              className={clsx(
                'text-[30px]',
                'text-[#eee]',
                'bg-[#333]',
                'transition-all',
                'duration-300',
                'rounded-full',
                !collapsed && 'transform rotate-180 origin-center'
              )}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
        </Layout.Sider>
        <Layout.Content className='bg-white'>
          <div className={clsx('h-full', 'mx-auto', 'flex', 'flex-col', 'relative')}>
            <div className='flex-shrink-0 flex pt-[10px] relative'>
              <div className='chat-title mx-auto text-center'>
                <h1 className='text-[22px] font-bold'>标题</h1>
                <div className='title-mask'></div>
              </div>
            </div>
            <div className='relative flex-grow'>
              <div className='overflow-y-auto overflow-x-hidden absolute top-0 left-0 right-0 bottom-0'>
                <div className='min-h-full flex flex-col'>
                  <div className='chat-table-list w-full mx-auto py-[40px]'>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                    <div>内容</div>
                  </div>
                  <div className='chat-box flex-shrink-0 sticky bottom-0 mt-auto'>聊天框</div>
                </div>
              </div>
            </div>
          </div>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}

export default GeminiPage
