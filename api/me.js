import { HttpError, route, send } from './_lib/http.js'
import { publicUser, requireUser } from './_lib/auth.js'
import { dataKey, readJson } from './_lib/store.js'

// Returns the signed-in user and *only their* data. The user id comes from the signed cookie, never from the request.
export default route(['GET'], async (req, res) => {
  let user
  try {
    user = await requireUser(req)
  } catch (e) {
    // Anonymous visitors are a normal state, not an error (keeps the browser console clean).
    if (e instanceof HttpError && e.status === 401) return send(res, 200, { user: null })
    throw e
  }
  const rec = await readJson(dataKey(user.id))
  send(res, 200, { user: publicUser(user), data: rec?.value ?? null, rev: rec?.etag ?? null })
})
