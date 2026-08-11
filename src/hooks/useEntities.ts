import { useQuery } from '@tanstack/react-query'
import { fetchEntities, fetchEntity, fetchAllMarkers, fetchDutyPharmacies } from '@/services/content'
import type { EntityType } from '@/types'

export const entityKeys = {
  all: ['entities'] as const,
  list: (type: EntityType) => [...entityKeys.all, 'list', type] as const,
  listFiltered: (type: EntityType, key: string) => [...entityKeys.list(type), key] as const,
  detail: (type: EntityType, id: string) => [...entityKeys.all, 'detail', type, id] as const,
  markers: ['entities', 'markers'] as const,
  duty: ['duty-pharmacies'] as const,
}

export function useEntities<T>(type: EntityType, params: { search?: string; cityId?: string | null; specialty?: string | null; limit?: number; offset?: number } = {}) {
  const key = JSON.stringify(params)
  return useQuery({
    queryKey: entityKeys.listFiltered(type, key),
    queryFn: () => fetchEntities<T>(type, { ...params, active: true }),
  })
}

export function useEntity<T>(type: EntityType, slugOrId: string | undefined) {
  return useQuery({
    queryKey: entityKeys.detail(type, slugOrId ?? ''),
    queryFn: () => fetchEntity<T>(type, slugOrId!),
    enabled: !!slugOrId,
  })
}

export function useMarkers(cityId?: string | null) {
  return useQuery({
    queryKey: [...entityKeys.markers, cityId ?? 'all'],
    queryFn: () => fetchAllMarkers(cityId),
  })
}

export function useDutyPharmacies(cityId?: string | null) {
  return useQuery({
    queryKey: [...entityKeys.duty, cityId ?? 'all'],
    queryFn: () => fetchDutyPharmacies(cityId),
  })
}