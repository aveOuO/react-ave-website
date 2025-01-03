import { RouteObject } from 'react-router-dom'
import ClickCounter from '@/components/ClickCounter/ClickCounter'
import DialogTestPage from '@/pages/DialogTestPage/DialogTestPage'
import App from '@/App'
import CanvasPage from '@/pages/CanvasPage/CanvasPage'
import ComponentExample from '@/pages/ComponentDesignPage/ComponentExample'
import { CanvasMaze } from '@/pages/CanvasPage/CanvasMaze'
import { MerryChristmas } from '@/pages/MerryChristmas/MerryChristmas.tsx'

export const routes: RouteObject[] = [
  {
    path: '/merry-christmas',
    element: <MerryChristmas />
  },
  {
    path: '/maze',
    element: <CanvasMaze />
  },
  {
    path: '/component-example',
    element: <ComponentExample />
  },
  {
    path: '/',
    element: <App />,
    children: [
      ...(import.meta.env.ENV === 'dev'
        ? [
            {
              path: '/',
              Component: DialogTestPage
            },
            {
              path: '/cps',
              Component: ClickCounter
            },
            {
              path: '/canvas',
              children: [
                { path: '/canvas/snake', Component: CanvasPage },
                { path: '/canvas/maze', Component: CanvasMaze }
              ]
            },
            { path: '/component-example', Component: ComponentExample }
          ]
        : [])
    ]
  }
]
