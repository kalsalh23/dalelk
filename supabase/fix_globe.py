# -*- coding: utf-8 -*-
p = r"C:\Users\DELL\Desktop\help\src\components\layout\Footer.tsx"
t = open(p, encoding="utf-8").read()
t = t.replace("import { Globe, MessageCircle, AtSign, Phone, ShieldCheck, Code2, BellRing, BellOff } from 'lucide-react'",
              "import { MessageCircle, AtSign, Phone, ShieldCheck, Code2, BellRing, BellOff } from 'lucide-react'", 1)
open(p, "w", encoding="utf-8").write(t)
print("Globe removed")
