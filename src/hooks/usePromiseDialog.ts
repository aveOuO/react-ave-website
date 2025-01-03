import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

interface DialogProps<T = any> {
  visible: boolean
  onClose: () => void
  onOk: (data: T) => void
  [key: string]: any
}

type DialogComponent<T = any> = React.ComponentType<DialogProps<T>> & {
  defaultProps?: Partial<DialogProps<T>>
}

export const usePromiseDialog = () => {
  const openDialog = <T,>(DialogInstance: DialogComponent, props?: Omit<DialogProps, 'visible' | 'onClose' | 'onOk'>) => {
    return new Promise<T>((resolve, reject) => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      const root = createRoot(div)

      const cleanup = () => {
        root.unmount()
        document.body.removeChild(div)
      }

      const handleClose = () => {
        cleanup()
        reject(new Error('Dialog closed'))
      }

      const handleOk = (data: T) => {
        cleanup()
        resolve(data)
      }

      root.render(
        createElement(DialogInstance, {
          visible: true,
          ...props,
          onClose: handleClose,
          onOk: handleOk
        })
      )
    })
  }

  return {
    openDialog
  }
}
