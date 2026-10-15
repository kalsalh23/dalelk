import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'
import { ToastProvider } from '@/components/ui/Toast'
import { APP_SLOGAN } from '@/constants'
import { applySeo } from '@/lib/seo'
import { healPushSubscription } from '@/services/push'
import { Analytics } from '@vercel/analytics/react'

// بدون title: يستخدم الاسم الخارجي الكامل «دليل طيبة الإمام الطبي» كعنوان افتراضي
applySeo({ description: APP_SLOGAN })

// شفاء ذاتي: تجديد اشتراكات الإشعارات المتقادمة عند كل فتح (كل 12 ساعة)
void healPushSubscription()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        <Analytics />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App