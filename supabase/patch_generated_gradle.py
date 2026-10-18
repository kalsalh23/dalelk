# -*- coding: utf-8 -*-
# تعديل مستودعات المشروع المولد مباشرة: google() → جسر maven
import os

APK_DIR = r"C:\Users\DELL\Desktop\dalil-apk"
MAVEN = 'maven { url "https://dalil-altaybeh.vercel.app/proxy-maven" }'
changed = []

for dirpath, dirnames, filenames in os.walk(APK_DIR):
    if "node_modules" in dirpath or "gradle-8" in dirpath:
        continue
    for fn in filenames:
        if fn != "build.gradle":
            continue
        p = os.path.join(dirpath, fn)
        t = open(p, encoding="utf-8", errors="replace").read()
        if "google()" in t:
            open(p, "w", encoding="utf-8").write(t.replace("google()", MAVEN))
            changed.append(p.replace(APK_DIR, ""))

with open(__file__ + ".out", "w", encoding="utf-8") as f:
    f.write("\n".join(changed) if changed else "none")
print("done")
