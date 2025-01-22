import React, { useCallback, useRef, useState } from 'react'
import { Button, ConfigProvider, Input, Layout, theme } from 'antd'
import { RightCircleFilled } from '@ant-design/icons'
import 'highlight.js/styles/default.css'
import hljs from 'highlight.js'
import clsx from 'clsx'
import './styles/page.scss'
import { TextAreaRef } from 'antd/es/input/TextArea'
import { initOpenAI } from '@/utils/openai'
import OpenAI from 'openai'

const GeminiPage: React.FC = () => {
  // 主题色切换
  const [_theme, setTheme] = useState<'dark' | 'light'>('light')
  // 侧边栏折叠
  const [collapsed, setCollapsed] = useState(false)
  // 聊天框输入
  const textareaRef = useRef<TextAreaRef>(null)
  const [value, setValue] = useState('')
  const [submiting, setSubmiting] = useState(false)

  const openAi = useRef<OpenAI>()

  const onSubmit = async () => {
    if (submiting) return
    if (!openAi.current) {
      openAi.current = await initOpenAI()
    }
    const openai = openAi.current

    setSubmiting(true)
    try {
      const completion = await openai.chat.completions.create({
        model: 'gemini-2.0-flash-exp',
        messages: [
          { role: 'developer', content: 'You are a helpful assistant.' },
          {
            role: 'user',
            content: '你好'
          }
        ]
      })

      console.log(completion)
    } finally {
      setSubmiting(false)
    }
  }

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
        if (!event.shiftKey && !event.ctrlKey) {
          event.preventDefault()
          // 在这里可以添加发送消息的逻辑
          console.log('发送消息')
          return
        }

        if (event.ctrlKey) {
          const { selectionStart, selectionEnd } = event.currentTarget
          const before = value.substring(0, selectionStart)
          const after = value.substring(selectionEnd)
          setValue(`${before}\n${after}`)
          setTimeout(() => {
            if (textareaRef.current) {
              const textarea = textareaRef.current.resizableTextArea?.textArea
              if (textarea) {
                textarea.selectionStart = selectionStart + 1
                textarea.selectionEnd = selectionStart + 1
              }
            }
          })
          return
        }
      }
    },
    [value]
  )

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
          <div className='cursor-pointer absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-50'>
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
                  </div>
                  <div className='chat-box flex-shrink-0 sticky bottom-0 mt-auto pb-[10px]'>
                    <div className='relative'>
                      <Input.TextArea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        style={{ resize: 'none', paddingRight: '100px' }}
                        onKeyDown={handleKeyDown}></Input.TextArea>
                      <Button
                        className='absolute right-[20px] bottom-[10px]'
                        disabled={!value.length}
                        loading={submiting}
                        type='primary'
                        onClick={onSubmit}>
                        发送
                      </Button>
                    </div>
                  </div>
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
