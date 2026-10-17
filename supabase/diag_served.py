# -*- coding: utf-8 -*-
import urllib.request

req = urllib.request.Request("https://dalil-altaybeh.vercel.app/dalil-taybeh.apk")
with urllib.request.urlopen(req, timeout=120) as r:
    data = r.read()
    headers = dict(r.headers)

out = [
    "size: " + str(len(data)),
    "magic: " + repr(data[:8]),
    "is zip (PK): " + str(data[:2] == b"PK"),
    "is html: " + str(b"<html" in data[:200] or b"<!DOCTYPE" in data[:100]),
    "content-type: " + str(headers.get("Content-Type")),
    "content-encoding: " + str(headers.get("Content-Encoding")),
    "cache-control: " + str(headers.get("Cache-Control")),
    "age: " + str(headers.get("Age")),
    "x-vercel-cache: " + str(headers.get("X-Vercel-Cache")),
    "etag: " + str(headers.get("ETag")),
]
open(__file__ + ".out", "w", encoding="utf-8").write("\n".join(out))
print("ok")
