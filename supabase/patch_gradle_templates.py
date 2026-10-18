# -*- coding: utf-8 -*-
# تعديل قوالب Gradle في bubblewrap: استبدال google() بمستودع الجسر (تجاوز الحجب الإقليمي)
import os, re

root = r"C:\Users\DELL\Desktop\dalil-apk\node_modules\@bubblewrap"
MAVEN = 'maven { url "https://dalil-altaybeh.vercel.app/proxy-maven" }'
changed = []

for dirpath, dirnames, filenames in os.walk(root):
    for fn in filenames:
        if not fn.endswith((".njk", ".gradle")):
            continue
        p = os.path.join(dirpath, fn)
        try:
            t = open(p, encoding="utf-8", errors="replace").read()
        except Exception:
            continue
        if "google()" not in t:
            continue
        new = t.replace("google()", MAVEN)
        open(p, "w", encoding="utf-8").write(new)
        changed.append(p.replace(root, ""))

with open(__file__ + ".out", "w", encoding="utf-8") as f:
    f.write("\n".join(changed) if changed else "no templates with google()")
print("done")
