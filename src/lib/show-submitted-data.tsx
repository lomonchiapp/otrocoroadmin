import { toast } from 'sonner'

export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  toast.message(title, {
    description: (
      // w-[340px]
      <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  })
}

interface ToastOptions {
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export function showToast({ title, message, type = 'info' }: ToastOptions) {
  switch (type) {
    case 'success':
      toast.success(title, { description: message })
      break
    case 'error':
      toast.error(title, { description: message })
      break
    case 'warning':
      toast.warning(title, { description: message })
      break
    case 'info':
    default:
      toast.info(title, { description: message })
      break
  }
}
