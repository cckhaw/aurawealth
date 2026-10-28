export class ApiError extends Error {
  constructor(status, message, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api/${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Can’t reach the server. Check your connection and try again.')
  }
  let data = null
  try { data = await res.json() } catch { /* empty */ }
  if (!res.ok) throw new ApiError(res.status, data?.error || 'Something went wrong. Please try again.', data)
  return data
}
