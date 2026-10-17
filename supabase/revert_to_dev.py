# -*- coding: utf-8 -*-
# إرجاع التواصل: اسم مطوّر المنصة ورقمه مكانه الزر (الفوتر + عن المنصة + اللوحات)
WA_NEW = 'href="https://wa.me/84382676210"'

# ===== 1) الفوتر: الزر الأخضر → اسم المطوّر ورقمه (واتساب المطوّر) =====
p = r"C:\Users\DELL\Desktop\help\src\components\layout\Footer.tsx"
t = open(p, encoding="utf-8").read()
old_btn = """            <a
              href="https://wa.me/84382676210"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/10 px-3 py-1.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              <Phone className="size-4" />
              دعم المنصة والإدارة (واتساب)
            </a>"""
new_btn = """            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <Phone className="size-4 text-primary" />
              <span>مطوّر المنصة: م. قصي مهند الصالح</span>
              <a
                dir="ltr"
                href="https://wa.me/963952639157"
                target="_blank" rel="noopener noreferrer"
                className="font-bold text-primary hover:underline"
              >
                0992639157
              </a>
            </div>"""
assert old_btn in t, "footer button anchor"
t = t.replace(old_btn, new_btn, 1)
# أيقونة الواتساب تعود لرقم المطوّر
t = t.replace('href="https://wa.me/84382676210"', 'href={`https://wa.me/963${developer.phone?.replace(/^0/, "")}`}', 1)
open(p, "w", encoding="utf-8").write(t)
print("1) Footer: developer name + number")

# ===== 2) AboutPlatformPage: عودة رابط الهاتف =====
p2 = r"C:\Users\DELL\Desktop\help\src\pages\AboutPlatformPage.tsx"
t2 = open(p2, encoding="utf-8").read()
t2 = t2.replace('href="https://wa.me/84382676210" target="_blank" rel="noopener noreferrer"',
                'href={`tel:${settings?.about?.support_phone ?? DEFAULT_DEVELOPER.phone}`}', 1)
open(p2, "w", encoding="utf-8").write(t2)
print("2) AboutPlatform reverted")

# ===== 3) اللوحات: عودة روابط الهاتف =====
for p3 in [r"C:\Users\DELL\Desktop\help\src\layouts\AdminLayout.tsx",
           r"C:\Users\DELL\Desktop\help\src\layouts\DashboardLayout.tsx"]:
    t3 = open(p3, encoding="utf-8").read()
    t3 = t3.replace('href="https://wa.me/84382676210" target="_blank" rel="noopener noreferrer"',
                    'href={`tel:${DEFAULT_DEVELOPER.phone}`}')
    open(p3, "w", encoding="utf-8").write(t3)
print("3) layouts reverted")
