import { FC } from 'react'
import { Button } from 'antd'

const ClickButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  const buttonClick = () => {
    onClick()
  }

  return (
    <Button onClick={() => buttonClick()} danger>
      有多快点多快🥵
    </Button>
  )
}

export default ClickButton
