import { Hero } from '@/features/home/Hero'
import { ServicesGrid } from '@/features/home/ServicesGrid'
import { AdsSection } from '@/features/home/AdsSection'
import { DutyPharmacies } from '@/features/home/DutyPharmacies'
import { NearbyMap } from '@/features/home/NearbyMap'
import { AskCta } from '@/features/home/AskCta'
import { Seo } from '@/components/seo/Seo'

export function HomePage() {
  return (
    <>
      <Seo />
      <Hero />
      <ServicesGrid />
      <AdsSection />
      <DutyPharmacies />
      <NearbyMap />
      <AskCta />
    </>
  )
}