import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Phone, MessageCircle, MapPin, Clock, BadgeCheck,
  Monitor, Star, CalendarClock, ArrowLeft, User, Share2, ChevronDown, BellRing, CalendarX,
} from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '@/components/ui/BrandIcons'
import { useEntity } from '@/hooks/useEntities'
import { ENTITY_TABLES } from '@/services/content'
import { dayLabel } from '@/services/appointments'
import { subscribePush } from '@/services/push'
import {
  trackBooking, fetchBookingStatus, allTrackedBookings,
  type TrackedBooking, type BookingStatus,
} from '@/services/bookingStatus'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/States'
import { VerifiedBadge, PlanBadge } from '@/components/ui/Badge'
import { InteractiveMap } from '@/components/shared/Map'
import { Dialog } from '@/components/ui/Dialog'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { getPublicUrl } from '@/lib/supabase'
import { waLink, mapsLink, cn, effectivePlan } from '@/lib/utils'
import { ENTITY_LABELS } from '@/constants'
import type { EntityType, WorkHours } from '@/types'
import { EntityIcon } from '@/components/ui/EntityIcon'
import { track, incrementViewCount } from '@/services/stats'
import { Seo } from '@/components/seo/Seo'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

const DAY_ORDER = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
const DAY_NAMES: Record<string, string> = {
  sat: 'Ø§Ù„Ø³Ø¨Øª', sun: 'Ø§Ù„Ø£Ø­Ø¯', mon: 'Ø§Ù„Ø§Ø«Ù†ÙŠÙ†', tue: 'Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡',
  wed: 'Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡', thu: 'Ø§Ù„Ø®Ù…ÙŠØ³', fri: 'Ø§Ù„Ø¬Ù…Ø¹Ø©',
}

// Ø´Ø±ÙŠØ· Ø§Ù„Ø£ÙŠØ§Ù…: 14 ÙŠÙˆÙ…Ø§Ù‹ Ù‚Ø§Ø¯Ù…Ø© (Ø§Ù„ÙŠÙˆÙ… Ø£ÙˆÙ„Ø§Ù‹ â€” RTL ÙŠØ¬Ø¹Ù„Ù‡ ÙÙŠ Ø£Ù‚ØµÙ‰ Ø§Ù„ÙŠÙ…ÙŠÙ†)
const JS_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
function buildDayStrip(): Array<{ iso: string; dayNum: string; dayName: string; isToday: boolean; key: string }> {
  const out: Array<{ iso: string; dayNum: string; dayName: string; isToday: boolean; key: string }> = []
  const base = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayNum: String(d.getDate()).padStart(2, '0'),
      dayName: d.toLocaleDateString('ar', { weekday: 'long' }),
      isToday: i === 0,
      key: JS_DAY_KEYS[d.getDay()],
    })
  }
  return out
}

function monthLabelOf(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('ar', { month: 'long', year: 'numeric' })
}

/** ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© ÙƒÙ„ 15 Ø¯Ù‚ÙŠÙ‚Ø© Ù…Ù† Ù†Øµ Ø¯ÙˆØ§Ù… Ø§Ù„ÙŠÙˆÙ… â€” ÙŠÙÙ‡Ù… Ø§Ù„ØµÙŠØº Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Ù…Ù† 5 Ø§Ù„Ù‰ 9 Ù…Ø³Ø§Ø¡Ø§ØŒ 9 ØµØ¨Ø§Ø­Ø§ Ø­ØªÙ‰ 12 _ Ù…Ù† 4 Ù…Ø³Ø§Ø¡Ø§ Ø­ØªÙ‰ 7...) */
const AM_WORDS = new Set(['ØµØ¨Ø§Ø­Ø§', 'ØµØ¨Ø§Ø­'])
const PM_WORDS = new Set(['Ù…Ø³Ø§Ø¡Ø§', 'Ù…Ø³Ø§Ø¡', 'Ø¸Ù‡Ø±Ø§', 'Ù„ÙŠÙ„Ø§', 'Ø¹ØµØ±Ø§'])
function to24(n: number, period: 'am' | 'pm' | null): number {
  if (period === 'pm') return n < 12 ? n + 12 : 24
  if (period === 'am') return n === 12 ? 12 : n
  return n
}
function slotsForHours(text: string): string[] {
  const raw = (text ?? '').trim()
  if (!raw || raw.includes('Ù…ØºÙ„Ù‚') || raw.includes('Ø¥Ø¬Ø§Ø²Ø©')) return []
  let s = raw.replace(/[Ù -Ù©]/g, (d) => String('Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©'.indexOf(d)))
  s = s.replace(/Ù„Ù„/g, 'Ø§Ù„Ù‰').replace(/Ø­ØªÙ‰|Ø­Ù‰/g, 'Ø§Ù„Ù‰')
  s = s.replace(/[-â€“â€”]\s*Ù…Ù†/g, '_Ù…Ù†').replace(/\sÙˆ\s/g, '_').replace(/\sÙ…Ù†\s/g, ' _ ')
  const chunks = s.split(/_+/).map((c) => c.trim()).filter(Boolean)

  const set = new Set<string>()
  for (const chunk of chunks) {
    const tokens = [...chunk.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(ØµØ¨Ø§Ø­Ø§|ØµØ¨Ø§Ø­|Ù…Ø³Ø§Ø¡Ø§|Ù…Ø³Ø§Ø¡|Ø¸Ù‡Ø±Ø§|Ù„ÙŠÙ„Ø§|Ø¹ØµØ±Ø§)?/g)]
      .map((m) => ({ h: +m[1], min: m[2] ? +m[2] : 0, p: m[3] || null }))
      .filter((tk) => tk.h <= 23 && tk.min <= 59)
    if (tokens.length < 2) continue
    const [a, b] = tokens
    const segPeriod = [a.p, b.p].find((p) => p && PM_WORDS.has(p)) ? 'pm' : [a.p, b.p].find((p) => p && AM_WORDS.has(p)) ? 'am' : null
    // ÙÙŠ Ù…Ù‚Ø·Ø¹ Ù…Ø³Ø§Ø¦ÙŠ Ø¨Ù„Ø§ ÙˆØµÙ Ø¹Ù„Ù‰ Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©: Ø¥Ù† ÙƒØ§Ù†Øª Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© >= Ø§Ù„Ù†Ù‡Ø§ÙŠØ© Ø±Ù‚Ù…ÙŠØ§Ù‹ ÙÙ‡ÙŠ ØµØ¨Ø§Ø­ÙŠØ© (Ù…Ù† 11 Ø§Ù„Ù‰ 2 Ø¸Ù‡Ø±Ø§ = 11:00)
    const sa = a.p ? (PM_WORDS.has(a.p) ? 'pm' : 'am') : (segPeriod === 'pm' && a.h >= b.h ? 'am' : segPeriod)
    const sb = b.p ? (PM_WORDS.has(b.p) ? 'pm' : 'am') : segPeriod
    let start = to24(a.h, sa) * 60 + a.min
    let end = to24(b.h, sb) * 60 + b.min
    if (end < start) end += 12 * 60
    if (segPeriod === null && start <= 7 * 60 && end > start) { start += 12 * 60; end += 12 * 60 }
    if (end <= start || start < 0 || end > 24 * 60 || end - start > 20 * 60) continue
    for (let x = start; x < end; x += 15) {
      set.add(`${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`)
    }
  }
  return [...set].sort()
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardBody>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-ink">
          <span className="h-6 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        {children}
      </CardBody>
    </Card>
  )
}

/** Ø´Ø±ÙŠØ· Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…ÙˆØ¹Ø¯ â€” ÙŠØ¹Ø±Ø¶ Ù…Ø§ ÙˆØµÙ„Ù‡ Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© Ù„Ø­Ø¸ÙŠØ§Ù‹ */
function BookingStatusLine({ booking }: { booking: TrackedBooking | null }) {
  const s: BookingStatus = booking?.status ?? 'pending'
  const tone =
    s === 'confirmed' ? 'border-success/40 bg-emerald-50 text-emerald-800'
      : s === 'rejected' || s === 'cancelled' ? 'border-wine/40 bg-wine-soft text-error'
        : s === 'done' ? 'border-border bg-subtle text-muted'
          : 'border-gold/40 bg-gold-soft text-gold-dark'
  const label =
    s === 'confirmed' ? 'ØªÙ… ØªØ£ÙƒÙŠØ¯ Ù…ÙˆØ¹Ø¯Ùƒ ÙÙŠ Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© âœ“'
      : s === 'rejected' ? 'Ù„Ù… ÙŠÙÙ‚Ø¨Ù„ Ø§Ù„Ø·Ù„Ø¨ â€” Ø§Ø®ØªØ± ÙˆÙ‚ØªØ§Ù‹ Ø¢Ø®Ø±'
        : s === 'cancelled' ? 'Ø£ÙÙ„ØºÙŠ Ø§Ù„Ù…ÙˆØ¹Ø¯ â€” ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©'
          : s === 'done' ? 'ØªÙ…Øª Ø§Ù„Ø²ÙŠØ§Ø±Ø©'
            : s === 'new' ? 'Ø§Ù„Ø·Ù„Ø¨ Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ÙÙŠ Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©'
              : 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø±Ø¯ Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©â€¦'
  return (
    <div className={cn('mx-auto mt-3 flex max-w-sm items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold', tone)}>
      <span className={cn('size-2 shrink-0 rounded-full', s === 'confirmed' ? 'bg-success' : s === 'rejected' || s === 'cancelled' ? 'bg-error' : 'bg-gold-dark')} />
      {label}
    </div>
  )
}

function Chips({ items, color }: { items: string[] | null | undefined; color?: string }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it}
          className="rounded-xl border border-primary/15 bg-primary-light/40 px-3 py-1.5 text-xs font-semibold text-primary-dark"
          style={color ? { backgroundColor: `${color}14`, color, borderColor: `${color}33` } : undefined}
        >
          {it}
        </span>
      ))}
    </div>
  )
}

function WorkHoursTable({ hours }: { hours: WorkHours }) {
  if (!hours) return null
  return (
    <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
      {DAY_ORDER.map((d) => {
        if (!(d in hours)) return null
        return (
          <div key={d} className="flex items-center justify-between bg-surface px-4 py-2.5 text-sm">
            <span className="font-semibold text-ink">{DAY_NAMES[d]}</span>
            <span className={cn('font-medium', String(hours[d]).includes('Ù…ØºÙ„Ù‚') || String(hours[d]).includes('Ø¥Ø¬Ø§Ø²Ø©') ? 'text-error' : 'text-primary')}>
              {hours[d] ?? 'â€”'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function EntityDetailPageComponent({ type, title }: { type: EntityType; title: string }) {
  const { slug } = useParams<{ slug: string }>()
  const { data, isError, refetch } = useEntity<Record<string, unknown>>(type, slug)
  const [imgError, setImgError] = useState(false)
  const [ready, setReady] = useState(data)
  const toast = useToast()
  const [apptOpen, setApptOpen] = useState(false)
  const [apptDay, setApptDay] = useState('')
  const [apptTime, setApptTime] = useState('')
  const [apptDateISO, setApptDateISO] = useState('')
  const [takenTimes, setTakenTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookedInfo, setBookedInfo] = useState<{
    doctor: string; dateLabel: string; time: string; instant: boolean; requestId: string | null
  } | null>(null)
  const [bookingStatus, setBookingStatus] = useState<TrackedBooking | null>(null)
  const [apptName, setApptName] = useState('')
  const [apptPhone, setApptPhone] = useState('')
  const [apptSending, setApptSending] = useState(false)
  const [apptDone, setApptDone] = useState(false)
  const [apptNotify, setApptNotify] = useState(true)
  const [apptStep, setApptStep] = useState<1 | 2>(1)
  const [prevBooking, setPrevBooking] = useState<{ doctor: string; dateLabel: string; time: string } | null>(null)
  const [checkingPhone, setCheckingPhone] = useState(false)

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return
    if (!apptDay) { toast.show('Ø§Ø®ØªØ± Ø§Ù„ÙŠÙˆÙ… Ø§Ù„Ù…Ù†Ø§Ø³Ø¨', 'error'); return }
    if (!apptName.trim() || !apptPhone.trim()) { toast.show('Ø£Ø¯Ø®Ù„ Ø§Ù„Ø§Ø³Ù… ÙˆØ±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ', 'error'); return }
    if (!apptTime) { toast.show('Ø§Ø®ØªØ± Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨', 'error'); return }
    setApptSending(true)
    try {
      const res = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: String(ready.id),
          date: apptDateISO,
          time: apptTime,
          name: apptName.trim(),
          phone: apptPhone.trim(),
        }),
      })
      const d = await res.json().catch(() => ({}))
      // Ø­Ø¬Ø² Ù†Ø´Ø· ÙˆØ§Ø­Ø¯ ÙÙ‚Ø· Ù„ÙƒÙ„ Ù…ÙˆØ§Ø·Ù† â€” ÙŠØ´Ù…Ù„ Ù…Ø§ Ø³Ø¬Ù‘Ù„Ù‡ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ù† Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©
      if (d.error === 'has_booking') {
        showPrevBooking(d.booking as { doctor?: string | null; date?: string | null; time?: string | null } | undefined)
        return
      }
      if (res.status === 409 || d.error === 'taken') {
        toast.show(d.message || 'Ø¹Ø°Ø±Ø§Ù‹ØŒ Ù‡Ø°Ø§ Ø§Ù„ÙˆÙ‚Øª Ø­ÙØ¬Ø² Ù„Ù„ØªÙˆ â€” Ø§Ø®ØªØ± ÙˆÙ‚ØªØ§Ù‹ Ø¢Ø®Ø±', 'error')
        setApptTime('')
        setApptStep(1)
        if (apptDateISO) setTakenTimes((prev) => (prev.includes(apptTime) ? prev : [...prev, apptTime]))
        return
      }
      if (!res.ok || !d.ok) {
        toast.show(d.message || 'ØªØ¹Ø°Ø± Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø­Ø¬Ø²ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹', 'error')
        return
      }
      // Ù†Ø¬Ø§Ø­: ÙÙˆØ±ÙŠ (Ù…Ø¤ÙƒØ¯ ÙÙŠ Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©) Ø£Ùˆ Ø§Ø­ØªÙŠØ§Ø·ÙŠ (Ø·Ù„Ø¨ Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©)
      setBookedInfo({
        doctor: d.doctor_name || String(ready.name ?? ''),
        dateLabel: d.date_label || apptDateISO,
        time: apptTime,
        instant: d.mode === 'instant',
        requestId: d.request_id ? String(d.request_id) : null,
      })
      setApptDone(true)
      void track('appointment_request', { entityType: type, entityId: String(ready.id) })
      // ØªØªØ¨Ù‘Ø¹ Ø§Ù„Ø­Ø§Ù„Ø©: Ø§Ø³ØªÙ‚ØµØ§Ø¡ Ù…Ø¬Ø§Ù†ÙŠ + Ø¥Ø´Ø¹Ø§Ø± Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…ØªØµÙØ­ Ø¹Ù†Ø¯ Ø§Ù„Ù‚Ø¨ÙˆÙ„/Ø§Ù„Ø±ÙØ¶
      if (d.request_id) {
        const id = String(d.request_id)
        trackBooking({
          id,
          doctor: d.doctor_name || String(ready.name ?? ''),
          dateLabel: d.date_label || apptDateISO,
          time: apptTime,
        })
        setBookingStatus(allTrackedBookings().find((x) => x.id === id) ?? { id, status: 'pending' })
        // Â«Ø£Ø´Ø¹Ø±Ù†ÙŠÂ» Ù…Ø®ØªØ§Ø±: Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¥Ø°Ù† ÙˆØ³Ø¬Ù‘Ù„ Ø§Ø´ØªØ±Ø§Ùƒ Ø§Ù„Ø¯ÙØ¹ Ù„ÙŠØµÙ„Ù‡ Ø§Ù„Ø¥Ø´Ø¹Ø§Ø± Ø­ØªÙ‰ ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹ Ù…ØºÙ„Ù‚
        if (apptNotify) {
          void Notification.requestPermission().then((perm) => {
            if (perm === 'granted') void subscribePush({ appointmentId: id })
          })
        } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          // Ø§Ø´ØªØ±Ø§Ùƒ ØµØ§Ù…Øª Ù„Ù…Ù† ÙØ¹Ù‘Ù„Ù‡Ø§ Ø³Ø§Ø¨Ù‚Ø§Ù‹ (Ù„ÙŠØµÙ„Ù‡ Ø£ÙŠ ØªØ­Ø¯ÙŠØ« Ù…Ø³ØªÙ‚Ø¨Ù„ÙŠ Ø¯ÙˆÙ† Ø¥Ø²Ø¹Ø§Ø¬)
          void subscribePush({ appointmentId: id })
        }
      }
    } catch {
      toast.show('ØªØ¹Ø°Ø± Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø­Ø¬Ø²ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹', 'error')
    } finally {
      setApptSending(false)
    }
  }

  // Ø¹Ø±Ø¶ Ø±Ø³Ø§Ù„Ø© Â«Ù„Ø¯ÙŠÙƒ Ø­Ø¬Ø² Ø³Ø§Ø¨Ù‚Â» Ù…Ù† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ù†Ø´Ø· (Ù…Ù† Ø§Ù„ÙØ­Øµ Ø§Ù„Ù…Ø³Ø¨Ù‚ Ø£Ùˆ Ù…Ù† Ø§Ù„Ø®Ø§Ø¯Ù… Ø¹Ù†Ø¯ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„)
  const showPrevBooking = (b?: { doctor?: string | null; date?: string | null; time?: string | null }) => {
    setPrevBooking({
      doctor: b?.doctor || String(ready?.name ?? ''),
      dateLabel: b?.date ? new Date(String(b.date) + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' }) : '',
      time: b?.time || '',
    })
  }

  // ØªØ­Ù‚Ù‚ ÙÙˆØ±ÙŠ Ù…Ù† Â«Ø­Ø¬Ø² Ù†Ø´Ø· ÙˆØ§Ø­Ø¯ Ù„ÙƒÙ„ Ù…ÙˆØ§Ø·Ù†Â» Ù„Ø­Ø¸Ø© Ø¥Ø¯Ø®Ø§Ù„ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ (ÙŠØ´Ù…Ù„ Ù…Ø§ Ø³Ø¬Ù‘Ù„Ù‡ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ù…Ù† Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©)
  const checkPrevBooking = async (phoneValue: string) => {
    if (phoneValue.replace(/\D/g, '').length < 9) return
    setCheckingPhone(true)
    try {
      const r = await fetch(`/api/check-booking?phone=${encodeURIComponent(phoneValue.trim())}`)
      const d = await r.json().catch(() => null)
      if (d?.has) showPrevBooking(d.booking)
    } catch { /* Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙŠØ­Ø¯Ø« Ø¹Ù†Ø¯ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ */ } finally {
      setCheckingPhone(false)
    }
  }

  // Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…Ø­Ø¬ÙˆØ²Ø© ÙØ¹Ù„ÙŠØ§Ù‹ Ù„Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ… (Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…Ø¤ÙƒØ¯Ø© Ø¨Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© + Ø·Ù„Ø¨Ø§Øª Ù…Ø¹Ù„Ù‚Ø©)
  useEffect(() => {
    if (!apptDateISO || !ready) return
    let cancelled = false
    setLoadingSlots(true)
    fetch(`/api/taken-slots?doctor_id=${ready.id}&date=${apptDateISO}`)
      .then((r) => (r.ok ? r.json() : { taken: [] }))
      .then((d) => { if (!cancelled) setTakenTimes(Array.isArray(d.taken) ? d.taken : []) })
      .catch(() => { if (!cancelled) setTakenTimes([]) })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [apptDateISO, ready?.id])

  useEffect(() => {
    if (apptTime && takenTimes.includes(apptTime)) setApptTime('')
  }, [takenTimes, apptTime])

  // ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø¬Ø² Ù„Ø­Ø¸ÙŠØ§Ù‹: Ø§Ø³ØªÙ…Ø§Ø¹ Ù„Ø­Ø¯Ø« Ø§Ù„Ø®Ø¯Ù…Ø© + Ø§Ø³ØªÙ‚ØµØ§Ø¡ Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©
  useEffect(() => {
    if (!bookedInfo?.requestId) return
    const id = bookedInfo.requestId
    const sync = () => {
      const b = allTrackedBookings().find((x) => x.id === id)
      if (b) setBookingStatus(b)
    }
    const onStatus = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; status: BookingStatus }>).detail
      if (detail?.id === id) sync()
    }
    sync()
    void fetchBookingStatus(id).then(sync)
    window.addEventListener('dalil-booking-status', onStatus)
    const t = setInterval(() => void fetchBookingStatus(id).then(sync), 15000)
    return () => {
      window.removeEventListener('dalil-booking-status', onStatus)
      clearInterval(t)
    }
  }, [bookedInfo?.requestId])

  useEffect(() => {
    if (data) {
      setReady(data)
      void incrementViewCount(ENTITY_TABLES[type], String(data.id))
      void track('profile_view', { entityType: type, entityId: String(data.id) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isError || !ready) return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><ErrorState message="ØªØ¹Ø°Ø± Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù†ØµØ±." onRetry={() => void refetch()} /></div>

  const name = String(ready.name ?? '')
  const specialty = (ready.specialty as string) ?? null
  const description = (ready.description as string) ?? (ready.bio as string) ?? null
  const address = (ready.address as string) ?? null
  const phone = (ready.phone as string) ?? null
  const whatsapp = (ready.whatsapp as string) ?? null
  const lat = ready.lat as number
  const lng = ready.lng as number
  const image = getPublicUrl(ready.image as string)
  const gallery = ((ready.gallery as string[]) ?? []).map(getPublicUrl).filter(Boolean)
  const videoUrl = (ready.video_url as string) ?? null
  const services = (ready.services as string[] | null) ?? null
  const hours = (ready.work_hours as WorkHours) ?? null
  const certified = Boolean(ready.is_verified)
  const plan = effectivePlan(ready as { plan?: string | null; plan_expires_at?: string | null })
  const rating = ready.rating ? Number(ready.rating) : null

  // Ø´Ø±ÙŠØ· Ø§Ù„Ø­Ø¬Ø²: Ø§Ù„Ø£ÙŠØ§Ù… + Ø­Ø§Ù„Ø© Ø§Ù„ÙØªØ­ + Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ù„ÙŠÙˆÙ… Ø§Ù„Ù…Ø®ØªØ§Ø±
  const stripDays = buildDayStrip()
  const dayOpen = (key: string) => !hours || !Object.keys(hours).length || Boolean((hours[key] ?? '').trim())
  const daySlots = apptDay ? slotsForHours(String(hours?.[apptDay] ?? '')) : []
  const apptDateShort = apptDateISO
    ? new Date(apptDateISO + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' })
    : ''

  const routeLink = `${type === 'health_center' ? 'health-centers' : type === 'radiology' ? 'radiology' : `${type}s`}`
  const shareUrl = absoluteUrl(`/${routeLink}/${encodeURIComponent(String(ready.slug ?? slug ?? ''))}`)

  // ÙˆØ¶Ø¹ Ø§Ù„Ø¥Ø¬Ø§Ø²Ø©: ÙŠÙˆÙ‚Ù Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…Ø¤Ù‚ØªØ§Ù‹ ÙˆÙŠØ¹Ø±Ø¶ Ø±Ø³Ø§Ù„Ø© Ø¹Ù„Ù‰ Ø§Ù„ØµÙØ­Ø©
  const vacationUntil = (ready.vacation_until as string | null) ?? null
  const onVacation = Boolean(
    type === 'doctor' && vacationUntil && new Date(vacationUntil + 'T23:59:59') >= new Date(),
  )
  const vacationLabel = vacationUntil
    ? new Date(vacationUntil + 'T00:00:00').toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  // Ù…Ø´Ø§Ø±ÙƒØ© ØµÙØ­Ø© Ø§Ù„Ø¬Ù‡Ø©: Ù„ÙˆØ­Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© Ø§Ù„Ø£ØµÙ„ÙŠØ© Ø¹Ù„Ù‰ Ø§Ù„Ø¬ÙˆØ§Ù„ (ÙˆØ§ØªØ³Ø§Ø¨ ÙˆØºÙŠØ±Ù‡)ØŒ Ø£Ùˆ Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø· ÙƒØ¨Ø¯ÙŠÙ„
  const shareEntity = async () => {
    const shareData: ShareData = {
      title: name,
      text: `ØªØ¹Ø±Ù‘Ù Ø¹Ù„Ù‰ ${name} (${specialty ?? ENTITY_LABELS[type]}) â€” Ø¹Ø¨Ø± Ø¯Ù„ÙŠÙ„ Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù… Ø§Ù„Ø·Ø¨ÙŠ`,
      url: shareUrl,
    }
    void track('share', { entityType: type, entityId: String(ready.id) })
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return // Ø£ØºÙ„Ù‚ Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© Ø¨Ù†ÙØ³Ù‡
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.show('ØªÙ… Ù†Ø³Ø® Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙØ­Ø© â€” ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø±Ø³Ø§Ù„Ù‡ Ù„Ø£ÙŠ Ø´Ø®Øµ')
    } catch {
      toast.show('ØªØ¹Ø°Ø± Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø·', 'error')
    }
  }

  const schema: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': type === 'doctor' ? 'Physician' : 'MedicalBusiness',
      name: name ?? undefined,
      description: description ?? undefined,
      image: image ?? undefined,
      address: { '@type': 'PostalAddress', addressLocality: 'Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù…', addressCountry: 'SY' },
      phone: (phone as string) ?? undefined,
      hasMap: lat && lng ? mapsLink(lat, lng, address) : undefined,
    },
    breadcrumbSchema([
      { label: 'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©', url: absoluteUrl('/') },
      { label: title, url: absoluteUrl(`/${routeLink}`) },
      { label: name },
    ]),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title={name}
        description={description ?? name}
        image={image}
        path={`/${routeLink}/${encodeURIComponent(slug ?? "")}`}
        type="profile"
        jsonLd={schema}
      />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: title, to: `/${routeLink}` },
            { label: name },
          ]}
        />
      </div>

      {/* Ø¨Ø·Ø§Ù‚Ø© Ø±Ø¦ÙŠØ³ÙŠØ© */}
      <div className="mb-6 overflow-hidden rounded-[18px] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="h-28 w-full bg-gradient-to-l from-primary to-primary-dark sm:h-36" />
        <div className="px-5 pb-5 pt-0 sm:px-8">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div
              className={cn(
                'flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary-light text-primary-dark shadow-lg sm:size-32',
                imgError || !image ? 'relative' : '',
              )}
            >
              {image && !imgError ? (
                <img src={image} alt={name} onError={() => setImgError(true)} className="h-full w-full object-cover" />
              ) : (
                <EntityIcon type={type} className="size-12" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-ink sm:text-3xl">{name}</h1>
                <div className="flex items-center gap-2">
                  {certified && <VerifiedBadge />}
                  {plan !== 'free' && <PlanBadge plan={plan} />}
                  {(Boolean(ready.facebook) || Boolean(ready.instagram)) && (
                    <div className="flex items-center gap-1.5">
                      {Boolean(ready.facebook) && (
                        <a
                          href={String(ready.facebook)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ã™ÂÃ™Å Ã˜Â³Ã˜Â¨Ã™Ë†Ã™Æ’"
                          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary"
                          dir="ltr"
                        >
                          <FacebookIcon className="size-4" />
                        </a>
                      )}
                      {Boolean(ready.instagram) && (
                        <a
                          href={String(ready.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ã˜Â§Ã™â€ Ã˜Â³Ã˜ÂªÃ˜ÂºÃ˜Â±Ã˜Â§Ã™â€¦"
                          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary"
                          dir="ltr"
                        >
                          <InstagramIcon className="size-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {/* Ã˜Â£Ã™Å Ã™â€šÃ™Ë†Ã™â€ Ã˜Â© Ã™â€¦Ã˜Â´Ã˜Â§Ã˜Â±Ã™Æ’Ã˜Â© Ã˜ÂµÃ˜ÂºÃ™Å Ã˜Â±Ã˜Â© Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ˜Â¬Ã™â€¡Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã™â€šÃ˜Â§Ã˜Â¨Ã™â€žÃ˜Â© Ã™â€žÃ™â€žÃ˜Â§Ã˜Â³Ã™â€¦ */}
                <button
                  onClick={() => void shareEntity()}
                  title="Ã™â€¦Ã˜Â´Ã˜Â§Ã˜Â±Ã™Æ’Ã˜Â© Ã™â€¡Ã˜Â°Ã™â€¡ Ã˜Â§Ã™â€žÃ˜Â¬Ã™â€¡Ã˜Â©"
                  aria-label="Ã™â€¦Ã˜Â´Ã˜Â§Ã˜Â±Ã™Æ’Ã˜Â©"
                  className="ms-auto flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary"
                >
                  <Share2 className="size-4.5" />
                </button>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary-dark">
                <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold">
                  {specialty ?? ENTITY_LABELS[type]}
                </span>
                {rating ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-gold-dark">
                    <Star className="size-4 fill-gold text-gold-dark" />
                    {rating.toFixed(1)}
                  </span>
                ) : null}
              </p>
              {address && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="size-4 text-primary" />
                  {address}
                </p>
              )}
            </div>
          </div>

          {onVacation && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gold/50 bg-gold-soft/70 px-4 py-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold text-primary-dark">
                <CalendarClock className="size-5" />
              </span>
              <div>
                <p className="text-sm font-black text-gold-dark">Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙÙŠ Ø¥Ø¬Ø§Ø²Ø© Ø­ØªÙ‰ {vacationLabel}</p>
                <p className="text-xs text-muted">Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…ØªÙˆÙ‚ÙØ© Ù…Ø¤Ù‚ØªØ§Ù‹ â€” ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù‡Ø§ØªÙÙŠØ§Ù‹ Ø£Ùˆ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨ Ù„Ù„Ø§Ø³ØªÙØ³Ø§Ø±.</p>
              </div>
            </div>
          )}

          {(phone || whatsapp || type === 'doctor') && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {phone && (
                <Button size="lg" onClick={() => void track('phone_click', { entityType: type, entityId: String(ready.id) })} asChild>
                  <a href={`tel:${phone}`} className="!w-full sm:!flex-1">
                    <Phone className="size-5 shrink-0" />
                    Ø§ØªØµØ§Ù„
                  </a>
                </Button>
              )}
              {whatsapp && (
                <Button size="lg" variant="whatsapp" onClick={() => void track('whatsapp_click', { entityType: type, entityId: String(ready.id) })} asChild>
                  <a href={waLink(whatsapp, `Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£ÙˆØ¯ Ø§Ù„Ø§Ø³ØªÙØ³Ø§Ø± Ù…Ù† ${name}`)} target="_blank" rel="noopener noreferrer" className="!w-full sm:!flex-1">
                    <MessageCircle className="size-5 shrink-0" />
                    ÙˆØ§ØªØ³Ø§Ø¨
                  </a>
                </Button>
              )}
              {type === 'doctor' && (
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={plan === 'free' || onVacation}
                  title={onVacation ? 'Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙÙŠ Ø¥Ø¬Ø§Ø²Ø© Ø­Ø§Ù„ÙŠØ§Ù‹ â€” Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…ØªÙˆÙ‚ÙØ© Ù…Ø¤Ù‚ØªØ§Ù‹' : plan === 'free' ? 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…ØªØ§Ø­Ø© Ù„Ù„Ø£Ø·Ø¨Ø§Ø¡ Ø§Ù„Ù…Ø´ØªØ±ÙƒÙŠÙ† ÙÙŠ Ø¨Ø§Ù‚Ø© Ù…Ø¯ÙÙˆØ¹Ø© â€” Ø§Ø´ØªØ±Ùƒ Ù…Ù† ØµÙØ­Ø© Ø§Ù„Ø¨Ø§Ù‚Ø§Øª Ù„ØªÙØ¹ÙŠÙ„Ù‡Ø§' : undefined}
                  onClick={() => { if (plan !== 'free' && !onVacation) { const d0 = buildDayStrip().find((d) => !hours || !Object.keys(hours).length || Boolean((hours[d.key] ?? '').trim())) ?? buildDayStrip()[0]; setApptOpen(true); setApptDone(false); setApptStep(1); setApptDay(d0.key); setApptDateISO(d0.iso); setApptTime(''); setPrevBooking(null) } }}
                  className={cn(
                    '!w-full sm:!flex-1 bg-none bg-gradient-to-l from-gold to-gold-dark text-primary-dark font-black shadow-lg shadow-gold/40 hover:brightness-105 hover:text-primary-dark border border-gold-dark/30',
                    plan === 'free' && 'cursor-not-allowed',
                  )}
                >
                  <CalendarClock className="size-5 shrink-0" />
                  Ø·Ù„Ø¨ Ù…ÙˆØ¹Ø¯
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {description && (
            <Section title="Ù†Ø¨Ø°Ø©">
              <p className="whitespace-pre-line text-sm leading-7 text-muted">{description}</p>
            </Section>
          )}

          {type === 'doctor' && (ready.certifications as string[] | null)?.length ? (
            <Section title="Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª ÙˆØ§Ù„Ù…Ø¤Ù‡Ù„Ø§Øª">
              <ul className="space-y-2.5">
                {(ready.certifications as string[]).map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
                    {c}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {type !== 'doctor' && type !== 'pharmacy' && type !== 'lab' && type !== 'radiology' && (ready.departments as string[] | null)?.length ? (
            <Section title="Ø§Ù„Ø£Ù‚Ø³Ø§Ù…">
              <Chips items={ready.departments as string[]} />
            </Section>
          ) : null}

          {services?.length ? (
            <Section title={type === 'lab' ? 'Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ù„ØªØ­Ø§Ù„ÙŠÙ„' : type === 'radiology' ? 'Ø§Ù„Ø®Ø¯Ù…Ø§Øª ÙˆØ§Ù„Ø£Ø¬Ù‡Ø²Ø©' : 'Ø§Ù„Ø®Ø¯Ù…Ø§Øª'}>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <span key={s} className="rounded-xl bg-subtle border border-border px-3 py-1.5 text-xs font-semibold text-ink">
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {type === 'lab' && (ready.tests as string[] | null)?.length ? (
            <Section title="Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„">
              <Chips items={ready.tests as string[]} />
            </Section>
          ) : null}

          {type === 'radiology' && (ready.machines as string[] | null)?.length ? (
            <Section title="Ø§Ù„Ø£Ø¬Ù‡Ø²Ø©">
              <div className="grid gap-2 sm:grid-cols-2">
                {(ready.machines as string[]).map((m) => (
                  <div key={m} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink">
                    <Monitor className="size-4 text-primary" />
                    {m}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {gallery.length > 0 && (
            <Section title="Ù…Ø¹Ø±Ø¶ Ø§Ù„ØµÙˆØ±">
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((g) => (
                  <a key={g} href={g ?? '#'} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl">
                    <img src={g ?? ''} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </a>
                ))}
              </div>
            </Section>
          )}

          {videoUrl && (
            <Section title="ÙÙŠØ¯ÙŠÙˆ ØªØ¹Ø±ÙŠÙÙŠ">
              <div className="aspect-video overflow-hidden rounded-2xl">
                <iframe
                  src={videoUrl}
                  title="ÙÙŠØ¯ÙŠÙˆ ØªØ¹Ø±ÙŠÙÙŠ"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªÙˆØ§ØµÙ„">
            <div className="space-y-3 text-sm">
                                          <div className="flex items-center justify-between rounded-xl bg-subtle px-4 py-3">
                <span className="flex items-center gap-2 text-muted">
                  <InstagramIcon className="size-4.5 text-primary" />
                  Ø§Ù†Ø³ØªØºØ±Ø§Ù…
                </span>
                {ready.instagram ? (
                  <a href={String(ready.instagram)} target="_blank" rel="noopener noreferrer" className="font-bold text-primary truncate max-w-[60%]" dir="ltr">{String(ready.instagram)}</a>
                ) : (
                  <span className="font-bold text-primary truncate max-w-[60%]" dir="ltr">?????? ??? ?????</span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3 rounded-xl bg-subtle px-4 py-3">
                <span className="text-muted">Ø§Ù„Ø¹Ù†ÙˆØ§Ù†</span>
                <span className="text-left font-semibold text-ink">{address ?? 'â€”'}</span>
              </div>
              {(ready.opening_hours as string | null) && (
                <div className="flex items-center justify-between rounded-xl bg-subtle px-4 py-3">
                  <span className="flex items-center gap-1.5 text-muted"><Clock className="size-4" />Ø§Ù„Ø¯ÙˆØ§Ù…</span>
                  <span className="font-semibold text-ink">{String(ready.opening_hours)}</span>
                </div>
              )}
            </div>
          </Section>

          {type === 'doctor' && (ready.experience_years as number | null) ? (
            <Section title="Ø§Ù„Ø®Ø¨Ø±Ø©">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-light text-2xl font-black text-primary-dark">
                  {Number(ready.experience_years)}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Ø³Ù†Ø© Ø®Ø¨Ø±Ø©</p>
                  <p className="text-xs text-muted">ÙÙŠ Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ø·Ø¨ÙŠØ©</p>
                </div>
              </div>
            </Section>
          ) : null}

          {hours && Object.keys(hours).length > 0 ? (
            <Section title="Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ø¯ÙˆØ§Ù…">
              <WorkHoursTable hours={hours} />
            </Section>
          ) : null}

          <Section title={type === 'doctor' ? 'Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø·Ø¨ÙŠØ¨' : 'Ø§Ù„Ù…ÙˆÙ‚Ø¹'}>
            <InteractiveMap
              height="260px"
              markers={lat && lng ? [{ id: String(ready.id), name, entityType: type, lat, lng, phone, address, image: ready.image as string, specialty, slug }] : []}
              zoom={15}
            />
            {(lat && lng) ? (
              <a
                href={mapsLink(lat, lng, address)}
                target="_blank" rel="noopener noreferrer" onClick={() => void track('map_click', { entityType: type, entityId: String(ready.id) })}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark transition hover:bg-primary-light"
              >
                <MapPin className="size-4" />
                Ø¹Ø±Ø¶ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø±ÙŠØ·Ø©
              </a>
            ) : null}
          </Section>
        </div>
      </div>

      {/* Ø­ÙˆØ§Ø± Ø·Ù„Ø¨ Ù…ÙˆØ¹Ø¯ â€” Ù„Ù„Ø£Ø·Ø¨Ø§Ø¡ ÙÙ‚Ø· */}
      {type === 'doctor' && (
        <Dialog open={apptOpen} onClose={() => setApptOpen(false)} title={`Ø·Ù„Ø¨ Ù…ÙˆØ¹Ø¯ â€” ${name}`}>
          {prevBooking ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-50 text-error">
                <CalendarX className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-black text-ink">Ù†Ø¹ØªØ°Ø± Ù…Ù†Ùƒ. Ù„Ø¯ÙŠÙƒ Ø­Ø¬Ø² Ù…Ø³Ø¨Ù‚ ÙÙŠ Ø§Ù„Ø¯Ù„ÙŠÙ„</h3>
              <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-border bg-subtle px-5 py-4 text-start">
                <p className="flex items-center justify-between text-sm">
                  <span className="text-muted">Ø§Ù„Ø·Ø¨ÙŠØ¨</span>
                  <span className="font-bold text-ink">{prevBooking.doctor}</span>
                </p>
                {prevBooking.dateLabel && (
                  <p className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted">Ø§Ù„ÙŠÙˆÙ… ÙˆØ§Ù„ØªØ§Ø±ÙŠØ®</span>
                    <span className="font-bold text-ink">{prevBooking.dateLabel}</span>
                  </p>
                )}
                {prevBooking.time && (
                  <p className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted">Ø§Ù„Ø³Ø§Ø¹Ø©</span>
                    <span className="font-bold text-ink" dir="ltr">{prevBooking.time}</span>
                  </p>
                )}
              </div>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted">
                Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø­Ø¬Ø² Ø£ÙƒØ«Ø± Ù…Ù† Ù…ÙˆØ¹Ø¯ ÙˆØ§Ø­Ø¯. Ù„ØªØ¹Ø¯ÙŠÙ„ Ù…ÙˆØ¹Ø¯Ùƒ Ø£Ùˆ Ø¥Ù„ØºØ§Ø¦Ù‡ ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© Ù‡Ø§ØªÙÙŠØ§Ù‹.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => { setPrevBooking(null); setApptOpen(false) }}>
                Ø¥ØºÙ„Ø§Ù‚
              </Button>
            </div>
          ) : apptDone ? (
            <div className="py-6 text-center">
              <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${bookedInfo?.instant ? 'bg-emerald-50 text-success' : 'bg-primary-light text-primary-dark'}`}>
                <CalendarClock className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-black text-ink">
                {bookedInfo?.instant ? 'ØªÙ… Ø§Ù„Ø­Ø¬Ø² Ø¨Ù†Ø¬Ø§Ø­ âœ“' : 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ù…ÙˆØ¹Ø¯Ùƒ'}
              </h3>
              {bookedInfo?.instant ? (
                <>
                  <div className="mx-auto mt-3 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-start">
                    <p className="flex items-center justify-between text-sm">
                      <span className="text-muted">Ø§Ù„Ø·Ø¨ÙŠØ¨</span>
                      <span className="font-bold text-ink">{bookedInfo.doctor}</span>
                    </p>
                    <p className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted">Ø§Ù„ÙŠÙˆÙ… ÙˆØ§Ù„ØªØ§Ø±ÙŠØ®</span>
                      <span className="font-bold text-ink">{bookedInfo.dateLabel}</span>
                    </p>
                    <p className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted">Ø§Ù„Ø³Ø§Ø¹Ø©</span>
                      <span className="font-bold text-ink" dir="ltr">{bookedInfo.time}</span>
                    </p>
                  </div>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted">
                    Ù…ÙˆØ¹Ø¯Ùƒ Ù…Ø¤ÙƒØ¯ ÙÙŠ Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© â€” Ø§Ø­ØªÙØ¸ Ø¨Ù‡Ø°Ø§ Ø§Ù„ÙˆÙ‚Øª. Ù„ØªØ¹Ø¯ÙŠÙ„Ù‡ Ø£Ùˆ Ø¥Ù„ØºØ§Ø¦Ù‡ ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© Ù‡Ø§ØªÙÙŠØ§Ù‹
                    <span className="font-bold text-ink" dir="ltr"> {apptPhone ? '' : ''}</span>.
                  </p>
                </>
              ) : (
                <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
                  ÙˆØµÙ„ Ø·Ù„Ø¨Ùƒ Ø¥Ù„Ù‰ {name} ÙˆØ³ÙŠØªÙ… Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø¹Ù„Ù‰ Ø±Ù‚Ù…Ùƒ
                  <span className="font-bold text-ink" dir="ltr"> {apptPhone}</span> Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù…ÙˆØ¹Ø¯.
                </p>
              )}
              {/* Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…ÙˆØ¹Ø¯ â€” ØªØ­Ø¯ÙŠØ« ÙÙˆØ±ÙŠ Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© */}
              {bookedInfo?.requestId && !bookedInfo.instant && <BookingStatusLine booking={bookingStatus} />}
              {/* ØªÙØ¹ÙŠÙ„ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ù‡Ø°Ø§ Ø§Ù„Ù…ÙˆØ¹Ø¯ Ù„ÙŠØµÙ„Ùƒ Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡ Ø­ØªÙ‰ ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹ Ù…ØºÙ„Ù‚ */}
              <div className="mx-auto mt-4 max-w-sm">
                <button
                  type="button"
                  onClick={() => {
                    const id = bookedInfo?.requestId
                    if (!id) return
                    void Notification.requestPermission().then((perm) => {
                      if (perm === 'granted') {
                        void subscribePush({ appointmentId: id }).then(() =>
                          toast.show('Ù…ÙØ¹Ù‘Ù„ â€” Ø³ÙŠØµÙ„Ùƒ Ø¥Ø´Ø¹Ø§Ø± ÙÙˆØ±ÙŠ Ø¹Ù†Ø¯ Ù‚Ø¨ÙˆÙ„ Ø£Ùˆ Ø±ÙØ¶ Ø·Ù„Ø¨Ùƒ', 'success'),
                        )
                      }
                    })
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark transition hover:bg-primary-light"
                >
                  <BellRing className="size-4" />
                  ÙØ¹Ù‘Ù„ Ø¥Ø´Ø¹Ø§Ø± Ù‡Ø°Ø§ Ø§Ù„Ù…ÙˆØ¹Ø¯
                </button>
              </div>
              <Button variant="outline" className="mt-5" onClick={() => { setApptOpen(false); setApptDone(false); setApptStep(1); setApptDay(''); setApptTime(''); setApptDateISO(''); setApptName(''); setApptPhone(''); setBookedInfo(null) }}>
                Ø¥ØºÙ„Ø§Ù‚
              </Button>
            </div>
          ) : (
            <form onSubmit={submitAppointment} className="space-y-4">
              {/* Ù…Ø¤Ø´Ø± Ø§Ù„Ø®Ø·ÙˆØ§Øª */}
              <div className="flex items-center justify-center gap-2" aria-hidden="true">
                {[1, 2].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black transition',
                      apptStep === n ? 'bg-primary text-white' : 'bg-subtle text-muted',
                    )}
                  >
                    {n === 1 ? <CalendarClock className="size-3.5" /> : <User className="size-3.5" />}
                    {n === 1 ? 'Ø§Ù„Ù…ÙˆØ¹Ø¯' : 'Ø¨ÙŠØ§Ù†Ø§ØªÙƒ'}
                  </span>
                ))}
                <span className={cn('h-0.5 w-6 rounded-full transition', apptStep === 2 ? 'bg-primary' : 'bg-subtle-strong')} />
              </div>

              {apptStep === 1 ? (
                <>
                  <p className="rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted">
                    Ù‡Ø°Ù‡ Ø®Ø¯Ù…Ø© <strong className="text-ink">Ø·Ù„Ø¨ Ù…ÙˆØ¹Ø¯</strong> â€” ÙŠØµÙ„ Ø·Ù„Ø¨Ùƒ Ø¥Ù„Ù‰ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ù„ÙŠØ¤ÙƒØ¯Ù‡ØŒ ÙˆØ³ØªØªÙ… ØªØ³ÙˆÙŠØ© Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ù…Ø¹ÙƒÙ… Ù‡Ø§ØªÙÙŠØ§Ù‹ Ø£Ùˆ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨.
                  </p>

                  {/* Ø§Ù„Ø´Ù‡Ø± */}
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-black text-ink">{monthLabelOf(apptDateISO || stripDays[0].iso)}</p>
                    <ChevronDown className="size-4 text-muted" />
                  </div>

                  {/* Ø´Ø±ÙŠØ· Ø§Ù„Ø£ÙŠØ§Ù… */}
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {stripDays.map((d) => {
                      const open = dayOpen(d.key)
                      const selected = apptDateISO === d.iso
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          disabled={!open}
                          onClick={() => { setApptDateISO(d.iso); setApptDay(d.key); setApptTime('') }}
                          className={cn(
                            'flex h-28 w-[68px] shrink-0 flex-col items-center justify-center gap-2.5 rounded-[30px] border transition',
                            selected
                              ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                              : open
                                ? 'cursor-pointer border-transparent bg-subtle text-ink hover:bg-subtle-strong/60'
                                : 'cursor-not-allowed border-transparent bg-subtle/40 text-muted/50',
                          )}
                        >
                          <span className="text-[13px] font-bold">{d.isToday ? 'Ø§Ù„ÙŠÙˆÙ…' : d.dayName}</span>
                          <span className={cn('flex size-9 items-center justify-center rounded-full text-base font-black', selected && 'bg-white text-primary-dark')}>
                            {d.dayNum}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© */}
                  <div className="rounded-2xl bg-subtle/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-black text-ink">Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©</p>
                      {daySlots.length > 0 && <p className="text-sm font-bold text-muted">{daySlots.length} Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©</p>}
                    </div>
                    {daySlots.length > 0 ? (
                      loadingSlots ? (
                        <div className="flex items-center justify-center py-6 text-xs font-bold text-muted">
                          <span className="me-2 size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©â€¦
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {daySlots.map((s) => {
                            const taken = takenTimes.includes(s)
                            const selected = apptTime === s
                            return (
                              <button
                                key={s}
                                type="button"
                                disabled={taken}
                                onClick={() => setApptTime(s)}
                                className={cn(
                                  'rounded-xl border py-2 text-sm font-black transition',
                                  taken
                                    ? 'cursor-not-allowed border-rose-200 bg-rose-50 text-rose-400'
                                    : selected
                                      ? 'border-primary bg-primary text-white ring-2 ring-primary/25'
                                      : 'cursor-pointer border-transparent bg-surface text-ink hover:border-primary/40',
                                )}
                                dir="ltr"
                              >
                                <span className="block">{s}</span>
                                <span className={cn('block text-[9px] font-bold leading-3', taken ? 'text-rose-400' : selected ? 'text-white/80' : 'text-slate-300')}>
                                  {taken ? 'Ù…Ø­Ø¬ÙˆØ²' : 'Ù…ØªØ§Ø­'}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )
                    ) : (
                      <Field label="Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…ÙØ¶Ù„ (ØªÙ‚Ø±ÙŠØ¨ÙŠ)" hint="Ø£ÙˆÙ‚Ø§Øª Ø¯ÙˆØ§Ù… Ø§Ù„Ø·Ø¨ÙŠØ¨ ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø© Ø¨Ø¯Ù‚Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ… â€” Ø§ÙƒØªØ¨ Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ùƒ">
                        <Input value={apptTime} onChange={(e) => setApptTime(e.target.value)} placeholder="Ù…Ø«Ø§Ù„: 10:00 ØµØ¨Ø§Ø­Ø§Ù‹" />
                      </Field>
                    )}
                    {daySlots.length === 0 && hours && Object.keys(hours).length > 0 && (
                      <p className="mt-2 text-[11px] text-muted">Ø£ÙŠØ§Ù… Ø¯ÙˆØ§Ù… Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙÙ‚Ø· â€” Ø§Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø±Ù…Ø§Ø¯ÙŠØ© Ù…ØºÙ„Ù‚Ø©.</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={!apptDay || loadingSlots || (daySlots.length > 0 && !apptTime)}
                    onClick={() => setApptStep(2)}
                  >
                    Ø§Ù„ØªØ§Ù„ÙŠ
                    <ArrowLeft className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Ù…Ù„Ø®Øµ Ø§Ù„Ù…Ø®ØªØ§Ø±Ø§Øª Ù…Ù† Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© */}
                  <button
                    type="button"
                    onClick={() => setApptStep(1)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-primary/20 bg-primary-light/30 px-4 py-3 text-right transition hover:border-primary/50"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-primary-dark">
                      <CalendarClock className="size-4" />
                      {dayLabel(apptDay)}{apptTime ? ` â€” Ø§Ù„Ø³Ø§Ø¹Ø© ${apptTime}` : ''}{apptDateShort ? ` (${apptDateShort})` : ''}{apptDateShort ? ` (${apptDateShort})` : ''}
                    </span>
                    <span className="text-[11px] font-bold text-primary hover:underline">ØªØ¹Ø¯ÙŠÙ„</span>
                  </button>

                  <div className="grid gap-4">
                    <Field label="Ø§Ù„Ø§Ø³Ù…" required>
                      <Input value={apptName} onChange={(e) => setApptName(e.target.value)} placeholder="Ø§Ø³Ù…Ùƒ Ø§Ù„ÙƒØ±ÙŠÙ…" />
                    </Field>
                    <Field label="Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ" required hint={checkingPhone ? 'Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø¬ÙˆØ²Ø§ØªÙƒ Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©â€¦' : undefined}>
                      <Input
                        type="tel"
                        value={apptPhone}
                        onChange={(e) => setApptPhone(e.target.value)}
                        onBlur={(e) => void checkPrevBooking(e.target.value)}
                        placeholder="09xx xxx xxx"
                        dir="ltr"
                        disabled={checkingPhone}
                      />
                    </Field>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-primary/20 bg-primary-light/30 px-4 py-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-[#428177]"
                      checked={apptNotify}
                      onChange={(e) => setApptNotify(e.target.checked)}
                    />
                    <span className="text-xs leading-6 text-muted">
                      <strong className="text-ink">Ø£Ø¨Ù„ØºÙ†ÙŠ Ø¹Ù†Ø¯ ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù„Ø¨</strong> â€” Ø¥Ø´Ø¹Ø§Ø± Ù…ØªØµÙØ­ ÙŠØµÙ„Ùƒ ÙÙˆØ± ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ø¨ÙŠØ¨ Ù„Ù„Ù…ÙˆØ¹Ø¯ (Ø­ØªÙ‰ ÙˆØ£Ù†Øª Ø®Ø§Ø±Ø¬ Ø§Ù„Ù…ÙˆÙ‚Ø¹).
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <Button type="submit" loading={apptSending} className="flex-1">
                      <CalendarClock className="size-4" />
                      Ø­Ø¬Ø² Ù…ÙˆØ¹Ø¯
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setApptStep(1)}>
                      Ø§Ù„Ø³Ø§Ø¨Ù‚
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </Dialog>
      )}
    </div>
  )
}

export function EntityDetailPage(props: { type: EntityType; title: string }) { return <EntityDetailPageComponent {...props} />; }
