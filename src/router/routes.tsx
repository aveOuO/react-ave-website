import { RouteObject } from 'react-router-dom'
import ClickCounter from '@/components/ClickCounter/ClickCounter'
import DialogTestPage from '@/pages/DialogTestPage/DialogTestPage'
import App from '@/App'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        Component: DialogTestPage
      },
      {
        path: '/cps',
        Component: ClickCounter
      }
    ]
  }
]
