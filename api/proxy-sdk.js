// جسر تنزيل أدوات أندرويد: يمرر ملفات dl.google.com عبر Vercel (تجاوز الحجب الإقليمي)
const BASE = 'https://dl.google.com/android/repository/'

export default async (req, res) => {
  const file = (req.query && req.query.file) || ''
  // أسماء ملفات مسموحة فقط (حماية من إساءة الاستخدام)
  if (!/^[\w.-]+\.(zip|exe|xml)$/.test(file)) {
    res.statusCode = 400
    return res.end('bad file')
  }

  const upstream = await fetch(BASE + file, { redirect: 'follow' })
  if (!upstream.ok) {
    res.statusCode = upstream.status
    return res.end('upstream ' + upstream.status)
  }

  const isXml = file.endsWith('.xml')
  res.statusCode = 200
  res.setHeader('Content-Type', isXml ? 'application/xml' : 'application/zip')
  if (!isXml) res.setHeader('Content-Disposition', 'attachment; filename="' + file + '"')

  if (upstream.body) {
    const reader = upstream.body.getReader()
    const { Writable } = await import('node:stream')
    const { pipeline } = await import('node:stream/promises')
    const writable = new Writable({
      write(chunk, _enc, cb) {
        res.write(chunk)
        cb()
      },
      final(cb) {
        res.end()
        cb()
      },
    })
    await pipeline({ [Symbol.asyncIterator]() { return { next: () => reader.read() } } }, writable)
  } else {
    res.end()
  }
}
