import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

export const usePromiseDialog = () => {
  const openDialog = <T extends React.ComponentType<any>>(DialogInstance: T, props?: any) => {
    let resolve: (value?: any) => void
    let reject: (value: unknown) => void
    const p = new Promise((r, c) => {
      resolve = r
      reject = c
    })

    const div = document.createElement('div')
    document.body.appendChild(div)

    const root = createRoot(div)

    root.render(
      createElement(DialogInstance, {
        visible: true,
        ...props,
        onClose: () => {
          reject(new Error('Dialog closed'))
        },
        onOk: (data: any) => {
          resolve(data)
        }
      })
    )

    p.finally(() => {
      document.body.removeChild(div)
      root.unmount()
    })

    return p
  }
  return {
    openDialog
  }
}
