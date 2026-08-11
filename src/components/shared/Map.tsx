import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DEFAULT_CITY_COORDS, MAP_COLORS, ENTITY_LABELS } from '@/constants'
import { mapsLink } from '@/lib/utils'
import { getPublicUrl } from '@/lib/supabase'
import type { MapMarkerData } from '@/types'

const ICON_SIZE = 34

function makeIcon(color: string) {
  const svg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`
  return L.divIcon({
    className: '',
    html: `<div style="width:${ICON_SIZE}px;height:${ICON_SIZE}px;display:flex;align-items:center;justify-content:center;background:white;border:2.5px solid ${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(15,23,42,.25)">${svg}</div>`,
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_SIZE / 2, ICON_SIZE],
    popupAnchor: [0, -ICON_SIZE - 4],
  })
}

export function InteractiveMap({
  markers = [],
  height = '420px',
  center,
  zoom,
  className,
}: {
  markers?: MapMarkerData[]
  height?: string
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [center?.lat ?? DEFAULT_CITY_COORDS.lat, center?.lng ?? DEFAULT_CITY_COORDS.lng],
      zoom: zoom ?? 14,
      scrollWheelZoom: false,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.clearLayers()
    markers.forEach((mk) => {
      const marker = L.marker([mk.lat, mk.lng], { icon: makeIcon(MAP_COLORS[mk.entityType]) })
      const img = getPublicUrl(mk.image)
      const c = MAP_COLORS[mk.entityType]
      const chip = mk.specialty ?? ENTITY_LABELS[mk.entityType]
      const html = `
<div dir="rtl" style="font-family:'IBM Plex Sans Arabic','Inter',sans-serif;min-width:220px">
  <div style="position:relative;margin:-10px -10px 8px;height:96px;border-radius:16px 16px 0 0;overflow:hidden">
    ${
      img
        ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover"/>`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${c}"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg></div>`
    }
    <span style="position:absolute;top:8px;right:8px;background:${c};color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px">${chip}</span>
  </div>
  <div style="font-weight:800;font-size:14px;color:#1e293b;line-height:1.4">${mk.name}</div>
  ${
    mk.address
      ? `<div style="display:flex;gap:4px;margin-top:4px;font-size:11px;color:#64748b;align-items:flex-start"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0F766E" stroke-width="2.4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>${mk.address}</div>`
      : ''
  }
  <div style="display:flex;gap:6px;margin-top:8px">
    ${
      mk.phone
        ? `<a href="tel:${mk.phone}" style="flex:1;text-align:center;background:#0F766E;color:white;font-size:11px;font-weight:700;padding:7px 0;border-radius:10px;text-decoration:none">اتصال</a>`
        : ''
    }
    <a href="${mapsLink(mk.lat, mk.lng, mk.address)}" target="_blank" rel="noopener" style="flex:1;text-align:center;background:#f1f5f9;color:#0F766E;font-size:11px;font-weight:700;padding:7px 0;border-radius:10px;text-decoration:underline">الموقع</a>
  </div>
</div>`
      marker.bindPopup(html, { maxWidth: 260, closeButton: true })
      marker.addTo(layerRef.current!)
    })
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]))
      mapRef.current?.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 })
    }
  }, [markers])

  return (
    <div className={`relative overflow-hidden rounded-[18px] border border-border ${className ?? ''}`}>
      <div ref={containerRef} style={{ height }} className="z-0 w-full" dir="ltr" />
    </div>
  )
}