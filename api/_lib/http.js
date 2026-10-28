// Small helpers shared by every API route.
export function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}

export class HttpError extends Error {
  constructor(status, message, extra) {
    super(message)
    this.status = status
    this.extra = extra
  }
}

/** Wrap a handler: method allow-list, CSRF origin check, JSON body, uniform errors. */
export function route(methods, fn) {
  return async (req, res) => {
    try {
      if (!methods.includes(req.method)) {
        res.setHeader('Allow', methods.join(', '))
        throw new HttpError(405, 'Method not allowed')
      }
      if (req.method !== 'GET') {
        const origin = req.headers.origin
        if (origin) {
          let host
          try { host = new URL(origin).host } catch { /* fallthrough */ }
          if (host !== req.headers.host) throw new HttpError(403, 'Cross-origin request blocked')
        }
        if (req.method !== 'DELETE' && !String(req.headers['content-type'] || '').includes('application/json'))
          throw new HttpError(415, 'Expected application/json')
      }
      await fn(req, res)
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message, ...e.extra })
      console.error(e)
      send(res, 500, { error: 'Something went wrong. Please try again.' })
    }
  }
}

export function body(req) {
  const b = req.body
  if (b && typeof b === 'object') return b
  if (typeof b === 'string') {
    try { return JSON.parse(b) } catch { /* fallthrough */ }
  }
  throw new HttpError(400, 'Invalid JSON body')
}
