import { Input, InputRef, Tag } from 'antd'
import { useRef, useState } from 'react'

const InputWithTag = () => {
  const [value, setValue] = useState('')
  const [tags, setTags] = useState(new Set<string>())
  const reactInputRef = useRef<InputRef>(null)

  const handleTagClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 阻止事件冒泡
    e.stopPropagation()
    // 处理标签点击事件
    reactInputRef.current!.focus()
  }

  const onTagClose = (tagTitle: string) => {
    console.log(`移除${tagTitle}`)
    setTags((prevTags) => {
      prevTags.delete(tagTitle)
      return new Set(prevTags)
    })
  }

  const handleInputEnter = () => {
    setTags((prevTags) => {
      if (value.trim() !== '') {
        prevTags.add(value)
        setValue('')
        return new Set(prevTags)
      }
      return prevTags
    })
  }

  return (
    <div
      className='ant-input css-dev-only-do-not-override-11lehqq ant-input-outlined tag-input'
      style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', width: '300px', cursor: 'text' }}
      onClick={(e) => handleTagClick(e)}>
      {Array.from(tags).map((item) => (
        <Tag
          color='processing'
          key={item}
          style={{ marginRight: '0' }}
          closable
          onClose={() => onTagClose(item)}
          onClick={(e) => e.stopPropagation()}>
          {item}
        </Tag>
      ))}
      <div style={{ width: '25px', flexGrow: 1 }}>
        <Input
          ref={reactInputRef}
          style={{ width: '100%', padding: '0', borderColor: 'transparent', boxShadow: 'none' }}
          maxLength={6}
          placeholder={tags.size === 0 ? '请输入标签（每个标签名不能超过6个字符）' : ''}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          onPressEnter={() => handleInputEnter()}
          onBlur={() => setValue((val) => val?.trim() || '')}
        />
      </div>
    </div>
  )
}
export default InputWithTag
