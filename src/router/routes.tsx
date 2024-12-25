import { RouteObject } from 'react-router-dom'
import ClickCounter from '@/components/ClickCounter/ClickCounter'
import DialogTestPage from '@/pages/DialogTestPage/DialogTestPage'
import App from '@/App'
import CanvasPage from '@/pages/CanvasPage/CanvasPage'
import ComponentExample from '@/pages/ComponentDesignPage/ComponentExample'
import { CanvasMaze } from '@/pages/CanvasPage/CanvasMaze'
import { MerryChristmas } from '@/pages/MerryChristmas/MerryChristmas'

export const routes: RouteObject[] = [
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
            { path: '/component-example', Component: ComponentExample },
            { path: '/merry-chris', Component: MerryChristmas }
          ]
        : [{ path: '/merry-chris', Component: MerryChristmas }])
    ]
  }
]
