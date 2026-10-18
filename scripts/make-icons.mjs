// توليد أيقونات PNG للتطبيق من شعار المنصة SVG
import sharp from 'sharp'
import fs from 'node:fs'

const SVG = fs.readFileSync('public/favicon.svg')

const jobs = [
  { size: 192, out: 'public/icons/icon-192.png', pad: 0.14 },   // مع هوامش (أيقونة قياسية)
  { size: 512, out: 'public/icons/icon-512.png', pad: 0.14 },
  { size: 512, out: 'public/icons/icon-512-maskable.png', pad: 0.24 }, // maskable: هوامش أكبر
]

fs.mkdirSync('public/icons', { recursive: true })

for (const j of jobs) {
  const inner = Math.round(j.size * (1 - j.pad * 2))
  const offset = Math.round(j.size * j.pad)
  await sharp(SVG)
    .resize(inner, inner)
    .extend({
      top: offset, bottom: offset, left: offset, right: offset,
      background: { r: 5, g: 66, b: 57, alpha: 1 }, // #054239 خلفية الهوية
    })
    .png()
    .toFile(j.out)
  console.log('created', j.out)
}
