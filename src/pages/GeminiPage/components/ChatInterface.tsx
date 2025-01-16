import { Button, Flex, Row } from 'antd'
import React from 'react'

const ChatInterface: React.FC = () => {
  return (
    <div className='chat-interface my-[20px]'>
      <div className='logs-wrapper'>
        <Flex gap={20} align='center'>
          <span>聊天记录</span>
          <Button type='primary'>展开更多</Button>
        </Flex>
        <div id='logs-container'></div>
      </div>
      <div className='input-controls'>
        <input type='text' id='message-input' placeholder='Enter message...' />
        <div className='action-buttons'>
          <button id='send-button'>Send</button>
          <button id='mic-button'>
            <span id='mic-icon' className='material-symbols-outlined'>
              mic
            </span>
          </button>
          <button id='camera-button'>
            <span id='camera-icon' className='material-symbols-outlined'>
              videocam
            </span>
          </button>
          <button id='screen-button'>
            <span id='screen-icon' className='material-symbols-outlined'>
              screen_share
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
