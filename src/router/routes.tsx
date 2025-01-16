import React, { lazy, Suspense } from 'react'
import { RouteObject } from 'react-router-dom'
import App from '@/App'

const LazyComponent = (componentImport: () => Promise<any>) => {
  const Component = lazy(componentImport)
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Component />
    </Suspense>
  )
}

export const routes: RouteObject[] = [
  {
    path: '/merry-christmas',
    element: LazyComponent(() => import('@/pages/MerryChristmas/MerryChristmas.tsx'))
  },
  {
    path: '/maze',
    element: LazyComponent(() => import('@/pages/CanvasPage/CanvasMaze'))
  },
  {
    path: '/component-example',
    element: LazyComponent(() => import('@/pages/ComponentDesignPage/ComponentExample'))
  },
  {
    path: '/gemini-page',
    element: LazyComponent(() => import('@/pages/GeminiPage/GeminiPage'))
  },
  {
    path: '/',
    element: <App />,
    children: [
      ...(import.meta.env.ENV === 'dev'
        ? [
            {
              path: '/',
              element: LazyComponent(() => import('@/pages/DialogTestPage/DialogTestPage'))
            },
            {
              path: '/cps',
              element: LazyComponent(() => import('@/components/ClickCounter/ClickCounter'))
            },
            {
              path: '/canvas',
              children: [
                {
                  path: '/canvas/snake',
                  element: LazyComponent(() => import('@/pages/CanvasPage/CanvasPage'))
                },
                {
                  path: '/canvas/maze',
                  element: LazyComponent(() => import('@/pages/CanvasPage/CanvasMaze'))
                }
              ]
            },
            {
              path: '/component-example',
              element: LazyComponent(() => import('@/pages/ComponentDesignPage/ComponentExample'))
            }
          ]
        : [])
    ]
  }
]
