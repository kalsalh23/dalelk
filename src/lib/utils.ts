import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('ar-SY', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  } catch {
    return '—'
  }
}

export function telLink(phone: string | null | undefined): string {
  if (!phone) return '#'
  const cleaned = phone.replace(/\s/g, '').replace(/^\+/, '')
  return `tel:+${cleaned.startsWith('9') || cleaned.startsWith('0') ? '' : ''}${cleaned}`
}

export function waLink(phone: string | null | undefined, text?: string): string {
  if (!phone) return '#'
  const cleaned = phone.replace(/[^\d]/g, '')
  const full = cleaned.startsWith('963') ? cleaned : `963${cleaned.replace(/^0/, '')}`
  if (text) return `https://wa.me/${full}?text=${encodeURIComponent(text)}`
  return `https://wa.me/${full}`
}

export function mapsLink(lat: number | null, lng: number | null, address?: string | null): string {
  if (lat && lng) return `https://www.google.com/maps?q=${lat},${lng}`
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  return '#'
}

export function truncate(text: string | null | undefined, max = 120): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function plural(count: number, singular: string, pluralWord: string, plural2?: string): string {
  const n = Math.abs(count)
  if (plural2) {
    if (n === 1) return singular
    if (n === 2) return plural2
    return pluralWord
  }
  if (n === 1) return singular
  return pluralWord
}

export function countLabel(count: number): string {
  return `${count} ${plural(count, 'عنصر', 'عناصر', 'عنصرين')}`
}

/** تنسيق رقم الثلاث (1,234) */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('ar-SY').format(n)
}

export function todaySQL(): string {
  return new Date().toISOString().slice(0, 10)
}

export const waitFor = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))