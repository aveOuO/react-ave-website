import { usePromiseDialog } from '../hooks/usePromiseDialog'

export const createPromiseDialog = (options: { component: any; props?: any }) => {
  return () => {
    const { openDialog } = usePromiseDialog()
    return (props?: any) => openDialog(options.component, { ...props, ...options.props }) as Promise<any>
  }
}
