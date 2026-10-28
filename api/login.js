import { body, HttpError, route, send } from './_lib/http.js'
import { checkPassword, hashPassword, normalizeEmail, publicUser, sessionCookie } from './_lib/auth.js'
import { emailKey, profileKey, readJson, writeJson } from './_lib/store.js'

const MAX_FAILS = 8
const LOCK_MS = 15 * 60 * 1000
const BAD = 'Incorrect email or password.'
let dummy

export default route(['POST'], async (req, res) => {
  const b = body(req)
  const email = normalizeEmail(b.email)
  const password = String(b.password || '').slice(0, 128)

  const idx = email ? await readJson(emailKey(email)) : null
  const rec = idx ? await readJson(profileKey(idx.value.id)) : null
  if (!rec) {
    // Spend the same time as a real check so response timing doesn't reveal which emails exist.
    dummy ||= await hashPassword('timing-equalizer')
    await checkPassword(password, dummy.salt, dummy.hash)
    throw new HttpError(401, BAD)
  }

  const user = rec.value
  if (user.lockedUntil > Date.now())
    throw new HttpError(429, 'Too many failed attempts. Try again in a few minutes.')

  if (!(await checkPassword(password, user.salt, user.hash))) {
    const fails = (user.fails || 0) + 1
    const next = fails >= MAX_FAILS ? { fails: 0, lockedUntil: Date.now() + LOCK_MS } : { fails }
    await writeJson(profileKey(user.id), { ...user, ...next }, rec.etag)
    throw new HttpError(401, BAD)
  }

  if (user.fails || user.lockedUntil) await writeJson(profileKey(user.id), { ...user, fails: 0, lockedUntil: 0 }, rec.etag)
  send(res, 200, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(user) })
})
