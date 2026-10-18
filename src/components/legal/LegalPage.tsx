import { type ReactNode } from 'react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Seo } from '@/components/seo/Seo'

export function LegalPage({
  title,
  path,
  updated,
  children,
}: {
  title: string
  path: string
  updated?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Seo title={title} path={path} type="website" />
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="mt-4 text-2xl font-black text-ink sm:text-3xl">{title}</h1>
      {updated && <p className="mt-1 text-xs text-muted">آخر تحديث: {updated}</p>}
      <div className="prose-ink mt-6 space-y-6 text-sm leading-8 text-muted [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-ink [&_p]:leading-8 [&_strong]:text-ink [&_ul]:list-inside [&_ul]:space-y-1.5 [&_h2]:mb-2">
        {children}
      </div>
    </div>
  )
}