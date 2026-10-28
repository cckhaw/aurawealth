import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { HttpError } from './http.js'
import { profileKey, readJson } from './store.js'

const COOKIE = 'aw_session'
const MAX_AGE = 60 * 60 * 24 * 30

const secret = () => {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error('SESSION_SECRET is not configured')
  return s
}

const b64 = (b) => Buffer.from(b).toString('base64url')
const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url')

const kdf = (password, salt) =>
  new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? reject(e) : resolve(k))))

export async function hashPassword(password) {
  const salt = randomBytes(16)
  return { salt: salt.toString('base64'), hash: (await kdf(password, salt)).toString('base64') }
}

export async function checkPassword(password, salt, hash) {
  const key = await kdf(password, Buffer.from(salt, 'base64'))
  const expected = Buffer.from(hash, 'base64')
  return key.length === expected.length && timingSafeEqual(key, expected)
}

export const normalizeEmail = (e) => String(e || '').trim().toLowerCase()
export const validEmail = (e) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)

export function sessionCookie(user) {
  const payload = b64(JSON.stringify({ u: user.id, sv: user.sv, exp: Date.now() + MAX_AGE * 1000 }))
  return `${COOKIE}=${payload}.${sign(payload)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`
}

export const clearCookie = () => `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`

/** Resolve the signed-in user from the cookie, or throw 401. */
export async function requireUser(req) {
  const raw = String(req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))
  const token = raw?.slice(COOKIE.length + 1)
  const [payload, sig] = (token || '').split('.')
  if (!payload || !sig) throw new HttpError(401, 'Not signed in')
  const good = Buffer.from(sign(payload))
  const given = Buffer.from(sig)
  if (good.length !== given.length || !timingSafeEqual(good, given)) throw new HttpError(401, 'Not signed in')
  let claims
  try { claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) } catch { throw new HttpError(401, 'Not signed in') }
  if (!claims.u || !/^[a-f0-9]{24}$/.test(claims.u) || claims.exp < Date.now()) throw new HttpError(401, 'Session expired')
  const rec = await readJson(profileKey(claims.u))
  if (!rec || rec.value.sv !== claims.sv) throw new HttpError(401, 'Session expired')
  return rec.value
}

export const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt })
