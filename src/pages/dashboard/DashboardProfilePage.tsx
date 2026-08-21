import { useEffect, useState } from 'react'
import { Save, Phone, MapPin, Video, Stethoscope, Sparkles, Share2, Globe } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { readStoredSession, updateEntityOwn } from '@/services/entityAccount'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea, Select } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { Seo } from '@/components/seo/Seo'

export function DashboardProfilePage() {
  const { session, setSession } = useDashboardSession()
  const toast = useToast()
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session) return
    const e = session.entity as Record<string, unknown> | null
    if (!e) return
    setForm({
      name: String(e.name ?? ''),
      specialty: String(e.specialty ?? ''),
      gender: String(e.gender ?? ''),
      phone: String(e.phone ?? ''),
      whatsapp: String(e.whatsapp ?? ''),
      address: String(e.address ?? ''),
      bio: String((e.bio as string) ?? (e.description as string) ?? ''),
      services: Array.isArray(e.services) ? (e.services as string[]).join('، ') : String(e.services ?? ''),
      certifications: Array.isArray(e.certifications) ? (e.certifications as string[]).join('، ') : String((e as Record<string, unknown>).certifications ?? ''),
      departments: Array.isArray((e as Record<string, unknown>).departments) ? ((e as Record<string, unknown>).departments as string[]).join('، ') : String((e as Record<string, unknown>).departments ?? ''),
      tests: Array.isArray((e as Record<string, unknown>).tests) ? ((e as Record<string, unknown>).tests as string[]).join('، ') : String((e as Record<string, unknown>).tests ?? ''),
      machines: Array.isArray((e as Record<string, unknown>).machines) ? ((e as Record<string, unknown>).machines as string[]).join('، ') : String((e as Record<string, unknown>).machines ?? ''),
      video_url: String(e.video_url ?? ''),
      instagram: String((e as Record<string, unknown>).instagram ?? ''),
      facebook: String((e as Record<string, unknown>).facebook ?? ''),
      experience_years: String((e as Record<string, unknown>).experience_years ?? ''),
      emergency_phone: String((e as Record<string, unknown>).emergency_phone ?? ''),
    })
  }, [session])

  if (!session) return null
  const isDoctor = session.entity_type === 'doctor'
  const isHospital = session.entity_type === 'hospital'
  const isLab = session.entity_type === 'lab'
  const isRadiology = session.entity_type === 'radiology'

  const save = async () => {
    const stored = readStoredSession()
    if (!stored) return
    if (!form.name.trim()) { toast.show('الاسم مطلوب', 'error'); return }
    setSaving(true)
    const fields: Record<string, unknown> = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      address: form.address.trim() || null,
      video_url: form.video_url.trim() || null,
      instagram: form.instagram.trim() || null,
      facebook: form.facebook.trim() || null,
    }
    const label = isDoctor ? 'bio' : 'description'
    fields[label] = form.bio.trim() || null
    if (isDoctor) {
      fields.specialty = form.specialty.trim() || null
      if (form.gender) fields.gender = form.gender
      fields.experience_years = form.experience_years.trim() || null
      fields.certifications = form.certifications.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean)
    }
    const services = form.services.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean)
    fields.services = services
    if (form.departments) fields.departments = form.departments.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean)
    if (form.tests) fields.tests = form.tests.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean)
    if (form.machines) fields.machines = form.machines.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean)
    if (form.emergency_phone) fields.emergency_phone = form.emergency_phone.trim() || null

    const ok = await updateEntityOwn(stored.token, fields)
    setSaving(false)
    if (ok) {
      toast.show('تم حفظ التغييرات')
      setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), ...fields, services, ...(isDoctor ? { certifications: fields.certifications } : {}) } as Record<string, unknown> } : prev)
    } else toast.show('تعذر الحفظ — حاول مجدداً', 'error')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Seo title="الملف الشخصي" description="تعديل بيانات الجهة" />
      <div>
        <h1 className="text-xl font-black text-ink">الملف الشخصي</h1>
        <p className="mt-1 text-sm text-muted">عدّل معلوماتك الأساسية وستظهر فوراً على صفحتك العامة.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>البيانات الأساسية</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم" required><Input value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="الاسم الكامل" /></Field>
            {isDoctor && (
              <>
                <Field label="الاختصاص"><div className="relative"><Stethoscope className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input className="pr-10" value={form.specialty ?? ''} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="مثال: قلبية" /></div></Field>
                <Field label="الجنس"><Select value={form.gender ?? ''} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}><option value="">— غير محدد —</option><option value="male">ذكر</option><option value="female">أنثى</option></Select></Field>
                <Field label="سنوات الخبرة"><Input type="number" min={0} value={form.experience_years ?? ''} onChange={(e) => setForm((f) => ({ ...f, experience_years: e.target.value }))} placeholder="مثال: 12" /></Field>
              </>
            )}
            <Field label="الهاتف"><div className="relative"><Phone className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input dir="ltr" className="pr-10" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="09xxxxxxxx" /></div></Field>
            <Field label="واتساب"><Input dir="ltr" value={form.whatsapp ?? ''} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="09xxxxxxxx" /></Field>
            <Field label="العنوان" hint="يظهر على صفحة الجهة والخريطة"><div className="relative"><MapPin className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input className="pr-10" value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div></Field>
            {isHospital && <Field label="هاتف الطوارئ"><Input dir="ltr" value={form.emergency_phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, emergency_phone: e.target.value }))} /></Field>}
            <Field label="رابط فيديو تعريفي"><div className="relative"><Video className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input dir="ltr" className="pr-10" value={form.video_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/..." /></div></Field>
          </div>

          <Field label={isDoctor ? 'نبذة تعريفية' : 'وصف الجهة'} hint="تظهر في أعلى صفحة الجهة"><Textarea rows={4} value={form.bio ?? ''} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder={isDoctor ? 'نبذة عن الطبيب وخبرته...' : 'وصف مختصر عن الجهة وخدماتها...'} /></Field>

          <Field label="الخدمات (افصل بفاصلة)"><Textarea rows={2} value={form.services ?? ''} onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))} placeholder="معاينة، تخطيط قلب، إيكو..." /></Field>

          {isDoctor && <Field label="الشهادات (افصل بفاصلة)"><Textarea rows={2} value={form.certifications ?? ''} onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))} /></Field>}
          {(isHospital || session.entity_type === 'health_center') && <Field label="الأقسام"><Textarea rows={2} value={form.departments ?? ''} onChange={(e) => setForm((f) => ({ ...f, departments: e.target.value }))} placeholder="قلبية، عظمية..." /></Field>}
          {isLab && <Field label="التحاليل المتاحة"><Textarea rows={2} value={form.tests ?? ''} onChange={(e) => setForm((f) => ({ ...f, tests: e.target.value }))} /></Field>}
          {isRadiology && <Field label="الأجهزة"><Textarea rows={2} value={form.machines ?? ''} onChange={(e) => setForm((f) => ({ ...f, machines: e.target.value }))} /></Field>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="انستغرام"><div className="relative"><Share2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input dir="ltr" className="pr-10" value={form.instagram ?? ''} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} placeholder="https://instagram.com/..." /></div></Field>
            <Field label="فيسبوك"><div className="relative"><Globe className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input dir="ltr" className="pr-10" value={form.facebook ?? ''} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} placeholder="https://facebook.com/..." /></div></Field>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => void save()} loading={saving}><Save className="size-4" /> حفظ التغييرات</Button>
            <span className="inline-flex items-center gap-1 rounded-xl bg-primary-light px-3 py-2 text-xs font-bold text-primary-dark"><Sparkles className="size-3.5" /> يظهر مباشرة على صفحتك</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
