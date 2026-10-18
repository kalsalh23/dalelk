# -*- coding: utf-8 -*-
p = r"C:\Users\DELL\Desktop\help\src\pages\AdsPage.tsx"
t = open(p, encoding="utf-8").read()
old = "import { Seo } from '@/components/seo/Seo'"
new = "import { Seo } from '@/components/seo/Seo'\nimport { EmptyState } from '@/components/ui/States'"
assert old in t
t = t.replace(old, new, 1)
open(p, "w", encoding="utf-8").write(t)
print("EmptyState import added")
