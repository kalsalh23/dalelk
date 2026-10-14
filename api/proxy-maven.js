// جسر Maven: يمرر مكتبات Google Maven (AGP وandroidx و.aar) عبر Vercel
// الاستخدام: /proxy-maven/<path>
const BASE = 'https://dl.google.com/dl/android/maven2/'

export default async (req, res) => {
  const path = (req.query && req.query.path) || ''
  if (!path || path.includes('..') || !/^[\w./-]+$/.test(path)) {
    res.statusCode = 400
    return res.end('bad path')
  }
  if (!/\.(pom|jar|module|xml|aar)$/.test(path)) {
    res.statusCode = 400
    return res.end('bad type')
  }

  const upstream = await fetch(BASE + path, { redirect: 'follow' })
  if (!upstream.ok) {
    res.statusCode = upstream.status
    return res.end('upstream ' + upstream.status)
  }

  res.statusCode = 200
  res.setHeader('Content-Type', path.endsWith('.aar') ? 'application/octet-stream' : path.endsWith('.jar') ? 'application/java-archive' : 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=86400')

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
