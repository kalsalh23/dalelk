# -*- coding: utf-8 -*-
# الفوتر: رقم التواصل الصحيح 0952639157 (واتساب: 963952639157)
path = r"C:\Users\DELL\Desktop\help\src\components\layout\Footer.tsx"
t = open(path, encoding="utf-8").read()

t = t.replace('href="https://wa.me/963952639157"', 'href="https://wa.me/963952639157"', 1)  # واتساب صحيح أصلاً
t = t.replace(">0992639157<", ">0952639157<", 1)

open(path, "w", encoding="utf-8").write(t)
print("number fixed: 0952639157")
