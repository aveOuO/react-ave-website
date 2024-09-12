import { useMyDialog } from '@/components/MyDialog/hooks/useMyDialog'
import { Button, message } from 'antd'
import './index.css'

const DialogTestPage: React.FC = () => {
  const showDialog = useMyDialog()

  const justCick = async () => {
    const clickTimes = await showDialog()
    if (clickTimes) message.warning(`好你小子，直接点了我${clickTimes}次，马上到你家门口傲。`)
  }
  return (
    <div className='dialog-container'>
      <div style={{ margin: 'auto' }}>
        <Button onClick={justCick} style={{ padding: '20px' }}>
          打开弹窗
        </Button>
      </div>
    </div>
  )
}

export default DialogTestPage
