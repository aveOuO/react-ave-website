import InputWithTag from './InputWithTag'

const ComponentExample = () => {
  return (
    <div className='page-container'>
      <div style={{ width: '500px', display: 'flex', alignItems: 'center' }}>
        <p style={{ marginRight: '20px' }}>输入框输入回车添加tag</p>
        <InputWithTag />
      </div>
    </div>
  )
}
export default ComponentExample
