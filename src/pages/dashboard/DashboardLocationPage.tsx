import { useEffect, useState } from 'react'
import { MapPin, Save, ExternalLink, Navigation } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { readStoredSession, updateEntityOwn } from '@/services/entityAccount'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { mapsLink } from '@/lib/utils'
import { Seo } from '@/components/seo/Seo'
import { queryClient } from '@/lib/queryClient'

export function DashboardLocationPage() {
  const { session, setSession } = useDashboardSession()
  const toast = useToast()
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session?.entity) return
    const e = session.entity as Record<string, unknown>
    setAddress(String(e.address ?? ''))
    setLat(e.lat != null ? String(e.lat) : '')
    setLng(e.lng != null ? String(e.lng) : '')
  }, [session])

  if (!session) return null
  const e = session.entity as Record<string, unknown>

  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.show('المتصفح لا يدعم تحديد الموقع', 'error'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude))
        setLng(String(pos.coords.longitude))
        toast.show('تم التقاط الإحداثيات')
      },
      () => toast.show('تعذر تحديد الموقع — تأكد من السماح للمتصفح', 'error'),
    )
  }

  const save = async () => {
    const stored = readStoredSession()
    if (!stored) return
    setSaving(true)
    const fields: Record<string, unknown> = {
      address: address.trim() || null,
      lat: lat.trim() || null,
      lng: lng.trim() || null,
    }
    const ok = await updateEntityOwn(stored.token, fields)
    setSaving(false)
    if (ok) {
      toast.show('تم حفظ الموقع — سيظهر على الخريطة مباشرة')
      setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), address: fields.address, lat: lat.trim() ? Number(lat) : null, lng: lng.trim() ? Number(lng) : null } as Record<string, unknown> } : prev)
      void queryClient.invalidateQueries({ queryKey: ['entities'] })
      void queryClient.invalidateQueries({ queryKey: ['markers'] })
    } else toast.show('تعذر الحفظ — تأكد من تطبيق الترحيل في Supabase', 'error')
  }

  const previewLink = mapsLink(lat ? Number(lat) : (e.lat as number | null), lng ? Number(lng) : (e.lng as number | null), address || (e.address as string | null))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Seo title="الموقع والعنوان" description="تعديل موقع الجهة" />
      <div>
        <h1 className="text-xl font-black text-ink">الموقع والعنوان</h1>
        <p className="mt-1 text-sm text-muted">حدّد عنوانك الدقيق والإحداثيات ليظهر موقعك بشكل صحيح على الخريطة.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> العنوان والإحداثيات</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Field label="العنوان التفصيلي" hint="مثال: طيبة الإمام - الشارع الرئيسي بجانب ...">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="العنوان" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="خط العرض (lat)"><Input dir="ltr" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="35.26389" /></Field>
            <Field label="خط الطول (lng)"><Input dir="ltr" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="36.70667" /></Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" type="button" onClick={useMyLocation}><Navigation className="size-4" /> تحديد موقعي الحالي</Button>
            <a href={previewLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold hover:bg-slate-50">
              <ExternalLink className="size-4" /> معاينة على خرائط Google
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4 text-xs leading-6 text-muted">
            <p className="font-bold text-ink">كيف أحصل على الإحداثيات؟</p>
            <p className="mt-1">افتح <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline">خرائط Google</a>، انقر على موقعك، وانسخ الأرقام التي تظهر (lat, lng) والصقها هنا. أو استخدم زر "تحديد موقعي الحالي" إذا كنت في الموقع نفسه.</p>
          </div>
          <Button onClick={() => void save()} loading={saving}><Save className="size-4" /> حفظ الموقع</Button>
        </CardBody>
      </Card>

      {/* mini map preview iframe */}
      {(lat && lng) && (
        <Card>
          <CardBody className="p-2">
            <iframe
              title="معاينة الخريطة"
              className="h-[280px] w-full rounded-xl border-0"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`}
            />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
