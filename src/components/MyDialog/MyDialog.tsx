import { Button, Modal } from 'antd'
import React, { useState } from 'react'

interface ModalProps {
  visible: boolean
  onClose: () => void
  onOk: (count: number) => void
}

export const MyDialog: React.FC<ModalProps> = ({ visible, onClose, onOk }) => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('什么玩意，我就不点')

  const handleClick = () => {
    setCount((count) => {
      setText('求你让我飞起来🙏')
      return count + 1
    })
  }
  return (
    <Modal
      title='哼哼啊啊啊啊'
      open={visible}
      cancelText='我不点了，别让我飞起来😢'
      okText={text}
      onOk={() => onOk(count)}
      onCancel={() => onClose()}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          {count > 0 && <CancelBtn />}
          <OkBtn />
        </>
      )}>
      {count > 0 ? <p>AUV，可以你敢点我，我记住了，你点了我 {count} 下，等会就让你飞起来。</p> : <p>阿巴阿巴</p>}
      <Button type='primary' onClick={handleClick} danger>
        你敢点我吗？
      </Button>
    </Modal>
  )
}
