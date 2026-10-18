# -*- coding: utf-8 -*-

# 1) المسارات: Component pattern
p = r"C:\Users\DELL\Desktop\help\src\routes\index.tsx"
t = open(p, encoding="utf-8").read()
t = t.replace("{ path: 'ads', lazy: () => import('@/pages/AdsPage').then((m) => ({ default: m.default })) }",
              "{ path: 'ads', lazy: () => import('@/pages/AdsPage').then((m) => ({ Component: m.default })) }")
t = t.replace("{ path: 'ads/:id', lazy: () => import('@/pages/AdDetailsPage').then((m) => ({ default: m.default })) }",
              "{ path: 'ads/:id', lazy: () => import('@/pages/AdDetailsPage').then((m) => ({ Component: m.default })) }")
open(p, "w", encoding="utf-8").write(t)
print("1) routes fixed")

# 2) Hero.tsx: إزالة href غير المستخدم
p2 = r"C:\Users\DELL\Desktop\help\src\features\home\Hero.tsx"
t2 = open(p2, encoding="utf-8").read()
old = "  const ad: Advertisement = items[idx % items.length]\n  const href = ad.link || undefined\n"
new = "  const ad: Advertisement = items[idx % items.length]\n"
t2 = t2.replace(old, new, 1)
open(p2, "w", encoding="utf-8").write(t2)
print("2) Hero href removed")

# 3) AdDetailsPage: إزالة Globe و ErrorState
p3 = r"C:\Users\DELL\Desktop\help\src\pages\AdDetailsPage.tsx"
t3 = open(p3, encoding="utf-8").read()
t3 = t3.replace("import { Megaphone, CalendarDays, ExternalLink, ArrowRight, Share2, Globe } from 'lucide-react'",
                "import { Megaphone, CalendarDays, ExternalLink, ArrowRight, Share2 } from 'lucide-react'")
if "ErrorState" in t3:
    import re as _re
    t3 = _re.sub(r"import \{[^}]*ErrorState[^}]*\} from '@?/?components/ui/States'\n", "", t3)
open(p3, "w", encoding="utf-8").write(t3)
print("3) AdDetailsPage cleaned")

# 4) AdsPage: SkeletonRows → pulse بسيط، وإزالة icon من EmptyState
p4 = r"C:\Users\DELL\Desktop\help\src\pages\AdsPage.tsx"
t4 = open(p4, encoding="utf-8").read()
t4 = t4.replace("import { SkeletonRows, EmptyState } from '@/components/ui/States'\n", "")
t4 = t4.replace('<EmptyState icon={Megaphone} title="لا توجد إعلانات حالياً" message="ستظهر هنا إعلانات الجهات الطبية والصحية عند توفرها." />',
                '<EmptyState title="لا توجد إعلانات حالياً" description="ستظهر هنا إعلانات الجهات الطبية والصحية عند توفرها." />')
open(p4, "w", encoding="utf-8").write(t4)
print("4) AdsPage cleaned")
