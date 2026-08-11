import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'
import { ToastProvider } from '@/components/ui/Toast'
import { APP_NAME, APP_SLOGAN } from '@/constants'
import { applySeo } from '@/lib/seo'

applySeo({ title: APP_NAME, description: APP_SLOGAN })

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App