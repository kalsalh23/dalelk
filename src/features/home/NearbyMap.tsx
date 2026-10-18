import { useMemo } from 'react'
import { MapPinned } from 'lucide-react'
import { useMarkers } from '@/hooks/useEntities'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { InteractiveMap } from '@/components/shared/Map'
import { Skeleton } from '@/components/ui/States'
import type { MapMarkerData, EntityType } from '@/types'

export function NearbyMap() {
  const { data, isLoading } = useMarkers(null)

  const markers: MapMarkerData[] = useMemo(() => {
    if (!data) return []
    const list: MapMarkerData[] = []
    ;(Object.keys(data) as EntityType[]).forEach((type) => {
      for (const m of data[type] ?? []) {
        list.push({
          id: String(m.id),
          name: String(m.name ?? ''),
          entityType: type,
          lat: Number(m.lat),
          lng: Number(m.lng),
          phone: (m.phone as string) ?? null,
          address: (m.address as string) ?? null,
          image: (m.image as string) ?? null,
          specialty: (m.specialty as string) ?? null,
          slug: String(m.slug ?? ''),
        })
      }
    })
    return list
  }, [data])

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionTitle
          title="الخدمات الطبية بالقرب منك"
          subtitle="اضغط على العلامات على الخريطة لعرض معلومات كل جهة"
          icon={<MapPinned className="size-5" />}
        />
        {isLoading ? (
          <Skeleton className="h-[420px] w-full rounded-[18px]" />
        ) : (
          <InteractiveMap markers={markers} height="440px" />
        )}
      </div>
    </section>
  )
}