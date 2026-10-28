import { body, HttpError, route, send } from './_lib/http.js'
import { checkPassword, clearCookie, hashPassword, requireUser, sessionCookie } from './_lib/auth.js'
import { dataKey, emailKey, profileKey, readJson, remove, writeJson } from './_lib/store.js'

export default route(['POST', 'DELETE'], async (req, res) => {
  const user = await requireUser(req)

  if (req.method === 'DELETE') {
    const b = req.body && typeof req.body === 'object' ? req.body : {}
    if (!(await checkPassword(String(b.password || ''), user.salt, user.hash))) throw new HttpError(403, 'Password is incorrect.')
    await remove(dataKey(user.id), profileKey(user.id), emailKey(user.email))
    return send(res, 200, { ok: true }, { 'Set-Cookie': clearCookie() })
  }

  // POST = change password. Bumping `sv` signs out every other device.
  const b = body(req)
  const next = String(b.newPassword || '')
  if (next.length < 8 || next.length > 128) throw new HttpError(400, 'New password must be 8–128 characters.')
  if (!(await checkPassword(String(b.password || ''), user.salt, user.hash))) throw new HttpError(403, 'Current password is incorrect.')
  const rec = await readJson(profileKey(user.id))
  const updated = { ...rec.value, ...(await hashPassword(next)), sv: (rec.value.sv || 1) + 1 }
  if (!(await writeJson(profileKey(user.id), updated, rec.etag))) throw new HttpError(409, 'Please try again.')
  send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(updated) })
})
