# -*- coding: utf-8 -*-
# 1) ترتيب الاقتراحات 2/2/1 والوحيد الممركز = صيدليات المناوبة
p = r"C:\Users\DELL\Desktop\help\src\features\home\Hero.tsx"
t = open(p, encoding="utf-8").read()

old_arr = """const QUICK_LINKS = [
  { label: 'الأطباء', to: '/doctors', icon: Stethoscope, tone: 'primary' },
  { label: 'الصيدليات', to: '/pharmacies', icon: Pill, tone: 'gold' },
  { label: 'صيدليات المناوبة', to: '/duty-pharmacies', icon: Moon, tone: 'primary' },
  { label: 'العيادات', to: '/clinics', icon: Building2, tone: 'gold' },
  { label: 'المشافي', to: '/hospitals', icon: Hospital, tone: 'primary' },
  { label: 'المخابر', to: '/labs', icon: FlaskConical, tone: 'gold' },
]"""
new_arr = """const QUICK_LINKS = [
  { label: 'الأطباء', to: '/doctors', icon: Stethoscope, tone: 'primary' },
  { label: 'الصيدليات', to: '/pharmacies', icon: Pill, tone: 'gold' },
  { label: 'المشافي', to: '/hospitals', icon: Hospital, tone: 'primary' },
  { label: 'المخابر', to: '/labs', icon: FlaskConical, tone: 'gold' },
  { label: 'صيدليات المناوبة', to: '/duty-pharmacies', icon: Moon, tone: 'primary', solo: true },
]"""
assert old_arr in t, "quick links array anchor"
t = t.replace(old_arr, new_arr, 1)

# الشبكة: عمودان، والعنصر الأخير (صيدليات المناوبة) يمتد عمودين كاملين متمركزاً
old_grid = 'className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5"'
new_grid = 'className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2"'
assert old_grid in t, "grid container anchor"
t = t.replace(old_grid, new_grid, 1)

old_item = """            <Link
              key={q.label}
              to={q.to}
              className={cn(
                'group flex items-center gap-2 rounded-2xl border bg-surface py-2 pe-3 ps-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',"""
new_item = """            <Link
              key={q.label}
              to={q.to}
              className={cn(
                'group flex items-center gap-2 rounded-2xl border bg-surface py-2 pe-3 ps-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                'solo' in q && 'col-span-2 mx-auto w-full max-w-[240px] justify-center',"""
assert old_item in t, "item anchor"
t = t.replace(old_item, new_item, 1)

open(p, "w", encoding="utf-8").write(t)
print("1) Hero quick links 2/2/1 with centered duty pharmacies")
