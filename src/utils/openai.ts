import OpenAI from 'openai'
import Cookies from 'js-cookie'
import { message } from 'antd'

export const initOpenAI = async (apiKey?: string) => {
  apiKey = apiKey || Cookies.get('apiKey')
  if (!apiKey) {
    message.error('请先设置apiKey')
    throw new Error('请先设置apiKey')
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://gemini.vvangxuanan.top/v1',
    dangerouslyAllowBrowser: true
  })
}
