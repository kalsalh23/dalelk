import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { MapPinned } from 'lucide-react';
import { useMarkers } from '@/hooks/useEntities';
import { SectionTitle } from '@/components/ui/Breadcrumbs';
import { InteractiveMap } from '@/components/shared/Map';
import { Skeleton } from '@/components/ui/States';
export function NearbyMap() {
    const { data, isLoading } = useMarkers(null);
    const markers = useMemo(() => {
        if (!data)
            return [];
        const list = [];
        Object.keys(data).forEach((type) => {
            for (const m of data[type] ?? []) {
                list.push({
                    id: String(m.id),
                    name: String(m.name ?? ''),
                    entityType: type,
                    lat: Number(m.lat),
                    lng: Number(m.lng),
                    phone: m.phone ?? null,
                    address: m.address ?? null,
                    image: m.image ?? null,
                    specialty: m.specialty ?? null,
                    slug: String(m.slug ?? ''),
                });
            }
        });
        return list;
    }, [data]);
    return (_jsx("section", { className: "border-y border-border bg-surface", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-14 sm:px-6", children: [_jsx(SectionTitle, { title: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0628\u0627\u0644\u0642\u0631\u0628 \u0645\u0646\u0643", subtitle: "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0631\u064A\u0637\u0629 \u0644\u0639\u0631\u0636 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0643\u0644 \u062C\u0647\u0629", icon: _jsx(MapPinned, { className: "size-5" }) }), isLoading ? (_jsx(Skeleton, { className: "h-[420px] w-full rounded-[18px]" })) : (_jsx(InteractiveMap, { markers: markers, height: "440px" }))] }) }));
}
