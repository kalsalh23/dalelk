import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, HeartPulse, Bone, Eye, Ear, Flower2, Baby, Shield, Scissors, Activity, Thermometer, Droplet, Bandage } from 'lucide-react'
import { SPECIALTIES } from '@/constants'

const SPECIALTY_ICONS: Record<string, React.ReactNode> = {
  'طب عام': <Stethoscope className="size-6" />,
  'طبChildren': <Baby className="size-6" />,
  'طب الأطفال': <Baby className="size-6" />,
  'النسائية والتوليد': <Flower2 className="size-6" />,
  'القلبية': <HeartPulse className="size-6" />,
  'الأذن والأنف والحنجرة': <Ear className="size-6" />,
  'العينية': <Eye className="size-6" />,
  'الأمراض الجلدية': <Droplet className="size-6" />,
  'العظمية': <Bone className="size-6" />,
  'الباطنية': <Shield className="size-6" />,
  'الأمراض النفسية': <Activity className="size-6" />,
  'المسالك البولية': <Droplet className="size-6" />,
  'الأسنان': <Scissors className="size-6" />,
  'الجراحة العامة': <Scissors className="size-6" />,
  'العصبية': <Activity className="size-6" />,
  'الغدد والسكري': <Thermometer className="size-6" />,
  'العلاج الفيزيائي': <Bandage className="size-6" />,
}

export function SpecialtyCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {SPECIALTIES.map((specialty, index) => {
        const icon = SPECIALTY_ICONS[specialty] ?? <Stethoscope className="size-6" />
        return (
          <motion.div
            key={specialty}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
          >
            <Link
              to={`/doctors/${encodeURIComponent(specialty)}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-light/50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                {icon}
              </div>
              <span className="text-sm font-bold text-ink group-hover:text-primary">{specialty}</span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}