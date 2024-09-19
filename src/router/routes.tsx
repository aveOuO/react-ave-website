import { RouteObject } from 'react-router-dom'
import ClickCounter from '@/components/ClickCounter/ClickCounter'
import DialogTestPage from '@/pages/DialogTestPage/DialogTestPage'
import App from '@/App'
import CanvasPage from '@/pages/CanvasPage/CanvasPage'
import ComponentExample from '@/pages/ComponentDesignPage/ComponentExample'

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
      },
      { path: '/canvas', Component: CanvasPage },
      { path: '/component-example', Component: ComponentExample }
    ]
  }
]
