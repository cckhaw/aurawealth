import { body, HttpError, route, send } from './_lib/http.js'
import { requireUser } from './_lib/auth.js'
import { createJson, dataKey, readJson, writeJson } from './_lib/store.js'

const MAX_BYTES = 1_500_000
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

export default route(['PUT'], async (req, res) => {
  const user = await requireUser(req)
  const b = body(req)
  const d = b.data
  if (!isObj(d) || !Array.isArray(d.holdings) || !Array.isArray(d.transactions) || !isObj(d.settings))
    throw new HttpError(400, 'Invalid data shape')
  if (d.holdings.length > 1000 || d.transactions.length > 20000) throw new HttpError(413, 'Too much data')
  const clean = { holdings: d.holdings, transactions: d.transactions, settings: d.settings }
  if (JSON.stringify(clean).length > MAX_BYTES) throw new HttpError(413, 'Too much data')

  const key = dataKey(user.id)
  const out = b.rev ? await writeJson(key, clean, b.rev) : await createJson(key, clean)
  if (!out) {
    // Someone (another tab/device) saved first: hand back the latest copy so the client can reload it.
    const latest = await readJson(key)
    throw new HttpError(409, 'Your data changed on another device.', { data: latest?.value ?? null, rev: latest?.etag ?? null })
  }
  send(res, 200, { rev: out.etag })
})
