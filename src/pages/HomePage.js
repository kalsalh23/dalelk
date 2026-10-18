import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Hero } from '@/features/home/Hero';
import { ServicesGrid } from '@/features/home/ServicesGrid';
import { FeaturedDoctors } from '@/features/home/FeaturedDoctors';
import { FeaturedPharmacies } from '@/features/home/FeaturedPharmacies';
import { DutyPharmacies } from '@/features/home/DutyPharmacies';
import { NearbyMap } from '@/features/home/NearbyMap';
import { AskCta } from '@/features/home/AskCta';
import { Seo } from '@/components/seo/Seo';
export function HomePage() {
    return (_jsxs(_Fragment, { children: [_jsx(Seo, {}), _jsx(Hero, {}), _jsx(DutyPharmacies, {}), _jsx(FeaturedDoctors, {}), _jsx(FeaturedPharmacies, {}), _jsx(ServicesGrid, {}), _jsx(NearbyMap, {}), _jsx(AskCta, {})] }));
}
