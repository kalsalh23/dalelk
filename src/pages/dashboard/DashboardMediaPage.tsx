import { useEffect, useState } from 'react'
import { Image as ImageIcon, Trash2, Upload, Star, Images, Save } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { readStoredSession, updateEntityOwn, folderForType } from '@/services/entityAccount'
import { compressImage, uploadToFolder, deleteImage } from '@/services/admin'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { getPublicUrl } from '@/lib/supabase'
import { Seo } from '@/components/seo/Seo'
import { queryClient } from '@/lib/queryClient'

export function DashboardMediaPage() {
  const { session, setSession } = useDashboardSession()
  const toast = useToast()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [gallery, setGallery] = useState<string[]>([])

  useEffect(() => {
    if (!session?.entity) return
    const e = session.entity as Record<string, unknown>
    setMainImage((e.image as string) ?? null)
    const g = (e.gallery as string[]) ?? (e.images as string[]) ?? []
    setGallery(Array.isArray(g) ? g : [])
  }, [session])

  if (!session) return null
  const folder = folderForType(session.entity_type)

  const handleMainUpload = async (file: File) => {
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const path = await uploadToFolder(folder, compressed)
      if (path) {
        if (mainImage) await deleteImage(mainImage).catch(() => {})
        setMainImage(path)
        toast.show('تم رفع الصورة الرئيسية — اضغط حفظ للتثبيت')
      } else {
        toast.show('فشل رفع الصورة — تأكد من تطبيق سياسات التخزين في Supabase', 'error')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('row-level security') || msg.includes('403')) {
        toast.show('فشل الرفع: سياسات التخزين غير مطبقة — طبّق migration_entity_dashboard.sql', 'error')
      } else {
        toast.show(`فشل رفع الصورة: ${msg || 'خطأ غير معروف'}`, 'error')
      }
    } finally { setUploading(false) }
  }

  const handleGalleryUpload = async (files: FileList) => {
    if (gallery.length + files.length > 12) { toast.show('الحد الأقصى 12 صورة في المعرض', 'error'); return }
    setUploading(true)
    try {
      const paths: string[] = []
      for (const f of Array.from(files)) {
        const c = await compressImage(f)
        const p = await uploadToFolder(folder, c)
        if (p) paths.push(p)
      }
      if (paths.length === 0) {
        toast.show('فشل رفع الصور — سياسات التخزين غير مطبقة', 'error')
      } else {
        setGallery((prev) => [...prev, ...paths])
        toast.show(`تم رفع ${paths.length} صورة — اضغط حفظ للتثبيت`)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      toast.show(`فشل رفع بعض الصور: ${msg || 'تحقق من سياسات التخزين'}`, 'error')
    } finally { setUploading(false) }
  }

  const removeGallery = (idx: number) => {
    const path = gallery[idx]
    setGallery((prev) => prev.filter((_, i) => i !== idx))
    if (path) void deleteImage(path)
  }

  const save = async () => {
    const stored = readStoredSession()
    if (!stored) return
    setSaving(true)
    const ok = await updateEntityOwn(stored.token, { image: mainImage, gallery, images: gallery })
    setSaving(false)
    if (ok) {
      toast.show('تم حفظ الصور — ستظهر في صفحة الجهة بعد تحديثها')
      setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), image: mainImage, gallery, images: gallery } as Record<string, unknown> } : prev)
      void queryClient.invalidateQueries({ queryKey: ['entities'] })
      void queryClient.invalidateQueries({ queryKey: ['entities', 'detail'] })
    } else toast.show('تعذر الحفظ — تأكد من تطبيق ترحيل الصور في Supabase', 'error')
  }

  const mainUrl = getPublicUrl(mainImage) ?? mainImage

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Seo title="الصور والمعرض" description="إدارة صور الجهة" />
      <div>
        <h1 className="text-xl font-black text-ink">الصور والمعرض</h1>
        <p className="mt-1 text-sm text-muted">الصورة الرئيسية تظهر في البطاقات والبحث. المعرض يظهر داخل صفحة الجهة (حتى 12 صورة).</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="size-4 text-amber-500" /> الصورة الرئيسية</CardTitle></CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-100">
              {mainUrl ? <img src={mainUrl} alt="الصورة الرئيسية" className="size-full object-cover" /> : <ImageIcon className="size-10 text-muted" />}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted">يُفضل مقاس مربع 800×800 بجودة عالية. سيتم ضغط الصورة تلقائياً.</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
                <Upload className="size-4" /> {uploading ? 'جارٍ الرفع…' : 'اختيار صورة جديدة'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleMainUpload(f); e.target.value = '' }} disabled={uploading} />
              </label>
              {mainImage && <Button variant="outline" size="sm" onClick={() => setMainImage(null)}><Trash2 className="size-4" /> إزالة</Button>}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Images className="size-4 text-primary" /> معرض الصور ({gallery.length}/12)</CardTitle>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold hover:bg-slate-50">
            <Upload className="size-4" /> إضافة صور
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) void handleGalleryUpload(e.target.files); e.target.value = '' }} disabled={uploading} />
          </label>
        </CardHeader>
        <CardBody>
          {gallery.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-slate-50 py-12 text-center">
              <Images className="mx-auto size-8 text-muted" />
              <p className="mt-2 text-sm text-muted">لا توجد صور في المعرض — أضف صوراً لعيادتك أو تجهيزاتك</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((p, i) => {
                const url = getPublicUrl(p) ?? p
                return (
                  <div key={`${p}-${i}`} className="group relative overflow-hidden rounded-2xl border border-border bg-slate-100">
                    <img src={url} alt="" className="aspect-square w-full object-cover" />
                    <button onClick={() => removeGallery(i)} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl bg-red-500 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-600">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <Button onClick={() => void save()} loading={saving}><Save className="size-4" /> حفظ الصور</Button>
            <span className="py-2 text-xs text-muted">الحفظ يحدّث الصفحة العامة فوراً</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
