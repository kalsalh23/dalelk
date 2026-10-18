# -*- coding: utf-8 -*-
# الحزمة: 1) إصلاح تجاوز النص في اسأل دليلك  2) اسم ورقم المطوّر في الترويسة
#          3) تصغير وترتيب أزرار الاقتراحات السريعة  4) إعادة تصميم الفوتر بألوان مميزة

# ===== 1) AskPage: منع تجاوز النص خارج الشاشة =====
p = r"C:\Users\DELL\Desktop\help\src\pages\AskPage.tsx"
t = open(p, encoding="utf-8").read()
old = '<div className="mt-4 flex items-center gap-2 text-xs text-muted">\n                    <span className="font-semibold">اختصاصات متوفرة:</span>'
new = '<div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">\n                    <span className="font-semibold">اختصاصات متوفرة:</span>'
assert old in t, "ask specialties anchor"
t = t.replace(old, new, 1)
t = t.replace('className="mt-8 rounded-2xl border border-gold/40 bg-gold-soft/70 p-5 sm:p-6"',
              'className="mt-8 overflow-hidden rounded-2xl border border-gold/40 bg-gold-soft/70 p-5 sm:p-6"', 1)
open(p, "w", encoding="utf-8").write(t)
print("1) AskPage overflow fixed")

# ===== 2) Header: اسم ورقم المطوّر مكان زر دخول الجهة السابق =====
p = r"C:\Users\DELL\Desktop\help\src\components\layout\Header.tsx"
t = open(p, encoding="utf-8").read()
anchor = '''          <button
            onClick={() => navigate('/search')}'''
chip = '''          <a
            href="https://wa.me/963952639157"
            target="_blank" rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary"
          >
            <span className="font-black">مطوّر المنصة:</span>
            <span className="text-muted" dir="ltr">0952639157</span>
          </a>
          <button
            onClick={() => navigate('/search')}'''
assert anchor in t, "header search anchor"
t = t.replace(anchor, chip, 1)
open(p, "w", encoding="utf-8").write(t)
print("2) Header developer chip added")

# ===== 3) Hero: تصغير وترتيب أزرار الاقتراحات السريعة =====
p = r"C:\Users\DELL\Desktop\help\src\features\home\Hero.tsx"
t = open(p, encoding="utf-8").read()
old_cont = 'className="mt-8 flex flex-wrap items-center justify-center gap-2.5"'
new_cont = 'className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5"'
assert old_cont in t, "quick links container anchor"
t = t.replace(old_cont, new_cont, 1)
t = t.replace("'group flex items-center gap-2.5 rounded-2xl border bg-surface py-2.5 pe-4 ps-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'",
              "'group flex items-center gap-2 rounded-2xl border bg-surface py-2 pe-3 ps-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md'", 1)
t = t.replace("'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300'",
              "'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300'", 1)
t = t.replace('<span className="text-sm font-black text-ink">{q.label}</span>',
              '<span className="text-xs font-bold text-ink">{q.label}</span>', 1)
# بطاقة الإعلانات: تصغير طفيف
t = t.replace('className="group flex cursor-pointer items-center gap-3.5 rounded-2xl border border-primary/25 bg-surface p-3 text-start shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"',
              'className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-primary/25 bg-surface p-2.5 text-start shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"', 1)
t = t.replace('className="size-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:size-24"',
              'className="size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:size-20"', 1)
open(p, "w", encoding="utf-8").write(t)
print("3) Hero quick links + ads tightened")
