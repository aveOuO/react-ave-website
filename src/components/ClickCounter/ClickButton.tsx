import { FC } from 'react'
import { Button } from 'antd'

const ClickButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  const buttonClick = () => {
    onClick()
  }

  return (
    <Button
      type='primary'
      onClick={() => buttonClick()}
      size='large'
      style={{ padding: '200px', flexDirection: 'column' }}
      danger>
      <p>有多快点多快🥵</p>
      <p>避免某人说太小点不到🤣</p>
      <p>所以设置了这么大☝️🤓</p>
    </Button>
  )
}

export default ClickButton
