# -*- coding: utf-8 -*-
# إصلاح سطر الملخص بالنص الفعلي في الملف
path = r"C:\Users\DELL\Desktop\help\src\components\entities\EntityDetailPage.tsx"
t = open(path, encoding="utf-8").read()
old = "{dayLabel(apptDay)}{apptTime ? ` — ${apptTime}` : ''}"
new = "{dayLabel(apptDay)}{apptTime ? ` — الساعة ${apptTime}` : ''}{apptDateShort ? ` (${apptDateShort})` : ''}"
assert old in t, "summary anchor still missing"
t = t.replace(old, new, 1)
open(path, "w", encoding="utf-8").write(t)
print("summary fixed")
