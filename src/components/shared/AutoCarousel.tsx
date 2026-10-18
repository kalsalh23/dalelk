import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * شريط بطاقات أفقي بمنظور «البطاقة المركزية»: بطاقة واحدة بارزة في المنتصف
 * وجيرانها ظاهرون جزئياً على الطرفين. تنتقل تلقائياً كل autoMs ملي ثانية،
 * وتنقلاً يدوياً بالأسهم أو النقاط أو السحب.
 *
 * المحرك: transform على صف البطاقات (لا scrollLeft) — لأن التمركز بالتمرير
 * محدود في واجهات RTL بحيث لا يمكن تمركز أول/آخر بطاقة أصلاً.
 */
export function AutoCarousel({ count, autoMs = 10_000, accent = 'primary', ariaLabel, children }: {
  count: number
  autoMs?: number
  accent?: 'primary' | 'gold'
  ariaLabel?: string
  children: ReactNode[]
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const dragState = useRef({ startX: 0, startedOn: false })

  // إزاحة transform بحيث تتمركز البطاقة i:
  // card.offsetLeft/offsetWidth يقاسان من الطرف الأيسر للصف (ثابت في كل المتصفحات)،
  // والصف نفسه داخل نافذة عرض direction=rtl فالترجمة الموجبة تدفعه يميناً.
  // نصف عرض البطاقة يُقاس بالنسبة للنافذة: نُبقي الحساب كله بإحداثيات أفقية موحّدة
  // عبر getBoundingClientRect لأنها لا تتأثر بـ RTL على الإطلاق.
  const measureCenter = (viewport: HTMLElement, i: number): number => {
    const track = viewport.firstElementChild as HTMLElement | null
    const card = track?.children[i] as HTMLElement | undefined
    if (!track || !card) return 0
    const vRect = viewport.getBoundingClientRect()
    const cRect = card.getBoundingClientRect()
    // بعد الترجمة الحالية: مسافة مركز البطاقة عن مركز النافذة
    return cRect.left + cRect.width / 2 - (vRect.left + vRect.width / 2)
  }

  const applyTransform = (i: number, animate: boolean) => {
    const viewport = viewportRef.current
    if (!viewport || !viewport.firstElementChild) return
    const track = viewport.firstElementChild as HTMLElement
    const current = track.dataset.cur === undefined ? 0 : Number(track.dataset.cur)
    const delta = measureCenter(viewport, i)
    const next = current - delta
    track.dataset.cur = String(next)
    track.style.transition = animate ? 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
    track.style.transform = `translateX(${next}px)`
  }

  // عند تغيّر الفهرس (تلقائي أو يدوي) تُنقل البطاقة النشطة إلى المنتصف
  useEffect(() => {
    applyTransform(index, true)
  }, [index])

  // إعادة التمركز عند تغيّر حجم النافذة
  useEffect(() => {
    const onResize = () => applyTransform(index, false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [index])

  // التمرير التلقائي: كل دورة تنتقل للبطاقة التالية وتلف دائرياً
  // يتوقف أثناء السحب أو توقف المستخدم على الشريط
  useEffect(() => {
    if (hoverPaused || dragging || count <= 1) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), autoMs)
    return () => window.clearInterval(t)
  }, [hoverPaused, dragging, count, autoMs])

  // سحب باللمس/الفأرة: تتبع الحركة أفقياً وإفلات البطاقة الأقرب للمنتصف
  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, startedOn: true }
    setDragging(true)
    const viewport = viewportRef.current
    if (viewport) {
      const track = viewport.firstElementChild as HTMLElement
      track.style.transition = 'none'
    }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.startedOn) return
    const delta = e.clientX - dragState.current.startX
    if (Math.abs(delta) < 6) return
    const viewport = viewportRef.current
    if (!viewport) return
    const track = viewport.firstElementChild as HTMLElement
    track.style.cursor = 'grabbing'
    // أثناء السحب نمشي مع الإصبع انطلاقاً من الترجمة الحالية
    const current = track.dataset.cur === undefined ? 0 : Number(track.dataset.cur)
    track.dataset.cur = String(current)
    track.style.transform = `translateX(${current + delta}px)`
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragState.current.startedOn) return
    const delta = e.clientX - dragState.current.startX
    dragState.current.startedOn = false
    setDragging(false)
    const viewport = viewportRef.current
    if (viewport) (viewport.firstElementChild as HTMLElement).style.cursor = ''
    // عتبة السحب: 60px تكفي للانتقال للبطاقة التالية/السابقة
    const threshold = 60
    if (delta <= -threshold) setIndex((i) => (i + 1) % count)
    else if (delta >= threshold) setIndex((i) => (i - 1 + count) % count)
    else applyTransform(index, true)
  }

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count)

  const arrowFloat = cn(
    'absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-lg transition cursor-pointer',
    accent === 'gold'
      ? 'border-gold/40 text-gold-dark hover:bg-gold hover:text-primary-dark'
      : 'border-primary/20 text-primary hover:bg-primary hover:text-white',
  )
  const dotActive = accent === 'gold' ? 'bg-gold' : 'bg-primary'
  const btnSide = cn(
    'flex size-9 items-center justify-center rounded-full border border-border bg-surface text-ink transition cursor-pointer',
    accent === 'gold' ? 'hover:bg-gold hover:text-primary-dark' : 'hover:bg-primary hover:text-white',
  )

  return (
    <div
      className="relative"
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
    >
      <div
        ref={viewportRef}
        aria-label={ariaLabel}
        className="mx-auto w-full max-w-xl overflow-hidden cursor-grab select-none touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* بطاقة كاملة العرض لكل خطوة: translateX بمقدار نافذة بالضبط — RTL بلا حسابات هشة */}
        <div className="flex items-stretch">
          {children.map((card, i) => (
            <div key={i} data-i={i} className="w-full shrink-0 px-1.5">
              {card}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="السابق" className={cn(arrowFloat, 'right-2 sm:-right-2')}>
            <ChevronRight className="size-5" />
          </button>
          <button onClick={() => go(1)} aria-label="التالي" className={cn(arrowFloat, 'left-2 sm:-left-2')}>
            <ChevronLeft className="size-5" />
          </button>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button onClick={() => go(-1)} aria-label="السابق" className={btnSide}>
              <ChevronRight className="size-4.5" />
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`بطاقة ${i + 1}`}
                  className={cn(
                    'h-2 rounded-full transition-all cursor-pointer',
                    i === index ? cn('w-6', dotActive) : 'w-2 bg-subtle-strong hover:bg-faint',
                  )}
                />
              ))}
            </div>
            <button onClick={() => go(1)} aria-label="التالي" className={btnSide}>
              <ChevronLeft className="size-4.5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
