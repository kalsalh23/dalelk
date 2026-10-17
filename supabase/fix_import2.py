# -*- coding: utf-8 -*-
p = r"C:\Users\DELL\Desktop\help\src\features\home\Hero.tsx"
t = open(p, encoding="utf-8").read()
t = t.replace("  Sparkles, ArrowLeft, Stethoscope, Pill, Moon, Building2, Hospital, FlaskConical, Megaphone,",
              "  Sparkles, ArrowLeft, Stethoscope, Pill, Moon, Hospital, FlaskConical, Megaphone,", 1)
open(p, "w", encoding="utf-8").write(t)
print("import cleaned")
