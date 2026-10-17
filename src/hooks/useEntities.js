import { useQuery } from '@tanstack/react-query';
import { fetchEntities, fetchEntity, fetchAllMarkers, fetchDutyPharmacies, fetchFeaturedDoctors, fetchFeaturedPharmacies } from '@/services/content';
export const entityKeys = {
    all: ['entities'],
    list: (type) => [...entityKeys.all, 'list', type],
    listFiltered: (type, key) => [...entityKeys.list(type), key],
    detail: (type, id) => [...entityKeys.all, 'detail', type, id],
    markers: ['entities', 'markers'],
    duty: ['duty-pharmacies'],
    featured: ['featured-doctors'],
    featuredPharmacies: ['featured-pharmacies'],
};
export function useEntities(type, params = {}) {
    const key = JSON.stringify(params);
    return useQuery({
        queryKey: entityKeys.listFiltered(type, key),
        queryFn: () => fetchEntities(type, { ...params, active: true }),
    });
}
export function useEntity(type, slugOrId) {
    return useQuery({
        queryKey: entityKeys.detail(type, slugOrId ?? ''),
        queryFn: () => fetchEntity(type, slugOrId),
        enabled: !!slugOrId,
    });
}
export function useMarkers(cityId) {
    return useQuery({
        queryKey: [...entityKeys.markers, cityId ?? 'all'],
        queryFn: () => fetchAllMarkers(cityId),
    });
}
export function useDutyPharmacies(cityId) {
    return useQuery({
        queryKey: [...entityKeys.duty, cityId ?? 'all'],
        queryFn: () => fetchDutyPharmacies(cityId),
    });
}
export function useFeaturedDoctors(limit = 8) {
    return useQuery({
        queryKey: entityKeys.featured,
        queryFn: () => fetchFeaturedDoctors(limit),
    });
}
export function useFeaturedPharmacies(limit = 8) {
    return useQuery({
        queryKey: entityKeys.featuredPharmacies,
        queryFn: () => fetchFeaturedPharmacies(limit),
    });
}
