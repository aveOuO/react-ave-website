import { useState, useEffect } from 'react'
import { message } from 'antd'

const DEV_CODE = 'dev-123456'

export const useDevMode = () => {
  const [keySequence, setKeySequence] = useState('')
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    // 如果已经开启开发者模式，不再监听
    if (isDevMode) return

    const handleKeyPress = (event: KeyboardEvent) => {
      const newSequence = keySequence + event.key
      setKeySequence(newSequence)

      // 只保留最后 DEV_CODE.length 个字符
      if (newSequence.length > DEV_CODE.length) {
        setKeySequence(newSequence.slice(-DEV_CODE.length))
      }

      // 检查是否匹配开发者代码
      if (newSequence.endsWith(DEV_CODE)) {
        setIsDevMode(true)
        message.success('开发模式开启')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [keySequence, isDevMode])

  return isDevMode
}
