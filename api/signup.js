import { body, HttpError, route, send } from './_lib/http.js'
import { hashPassword, normalizeEmail, publicUser, sessionCookie, validEmail } from './_lib/auth.js'
import { createJson, emailKey, newId, profileKey, remove } from './_lib/store.js'

export default route(['POST'], async (req, res) => {
  const b = body(req)
  const email = normalizeEmail(b.email)
  const name = String(b.name || '').trim().slice(0, 60)
  const password = String(b.password || '')
  if (!name) throw new HttpError(400, 'Please enter your name.')
  if (!validEmail(email)) throw new HttpError(400, 'Please enter a valid email address.')
  if (password.length < 8 || password.length > 128) throw new HttpError(400, 'Password must be 8–128 characters.')

  const id = newId()
  // The email index is create-only, so two simultaneous signups cannot both win.
  if (!(await createJson(emailKey(email), { id }))) throw new HttpError(409, 'An account with this email already exists.')

  const { salt, hash } = await hashPassword(password)
  const user = { id, email, name, salt, hash, sv: 1, fails: 0, lockedUntil: 0, createdAt: new Date().toISOString() }
  try {
    if (!(await createJson(profileKey(id), user))) throw new Error('profile exists')
  } catch (e) {
    await remove(emailKey(email)).catch(() => {})
    throw e
  }
  send(res, 201, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(user) })
})
