// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import router from './router/index.ts'

createRoot(document.getElementById('root')!).render(
  // <StrictMode></StrictMode>
  <ConfigProvider wave={{ disabled: true }}>
    <RouterProvider router={router} />
    {/* <App></App> */}
  </ConfigProvider>
)
