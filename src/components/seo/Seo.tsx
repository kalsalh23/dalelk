import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { SeoProps } from '@/lib/seo'
import { applySeo } from '@/lib/seo'
import { trackPageView } from '@/services/stats'

export function Seo({ ...props }: SeoProps) {
  const { pathname, search } = useLocation()
  useEffect(() => {
    applySeo(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, JSON.stringify(props.jsonLd)])
  useEffect(() => {
    const path = pathname + search
    void trackPageView(path)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  return null
}

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}