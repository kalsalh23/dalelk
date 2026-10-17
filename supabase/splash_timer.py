# -*- coding: utf-8 -*-
p = r"C:\Users\DELL\Desktop\help\index.html"
t = open(p, encoding="utf-8").read()
changed = []
if "}, 5000);" in t:
    t = t.replace("}, 5000);", "}, 3000);", 1)
    changed.append("timer 5000->3000")
if "5 ثوانٍ" in t:
    t = t.replace("5 ثوانٍ", "3 ثوانٍ")
    changed.append("comment updated")
open(p, "w", encoding="utf-8").write(t)
with open(__file__ + ".out", "w", encoding="utf-8") as f:
    f.write("\n".join(changed) if changed else "NOT FOUND")
print("ok")
