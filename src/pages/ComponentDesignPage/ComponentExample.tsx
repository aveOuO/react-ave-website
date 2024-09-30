import InputWithTag from './InputWithTag'
import EditorJS from '@editorjs/editorjs'

const ComponentExample = () => {
  const editor = new EditorJS({
    holder: 'editorjs',
    hideToolbar: true,
    defaultBlock: ''
  })
  console.log(editor)
  return (
    <div className='page-container'>
      <div style={{ width: '500px', display: 'flex', alignItems: 'center' }}>
        <p style={{ marginRight: '20px' }}>输入框输入回车添加tag</p>
        <InputWithTag />
      </div>
      <div id='editorjs'></div>
    </div>
  )
}
export default ComponentExample
