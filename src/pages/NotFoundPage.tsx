import { Link } from 'react-router-dom'
import { SearchX, Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-primary-light text-primary-dark">
        <SearchX className="size-10" />
      </div>
      <h1 className="text-3xl font-black text-ink">404</h1>
      <p className="max-w-sm text-sm text-muted">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark">
        <Home className="size-4" />
        العودة للرئيسية
      </Link>
    </div>
  )
}