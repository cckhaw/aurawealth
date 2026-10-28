import { createHash, randomBytes } from 'node:crypto'
import { BlobNotFoundError, BlobPreconditionFailedError, del, get, put } from '@vercel/blob'

const OPTS = { access: 'private', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 }

export const emailKey = (email) => `emails/${createHash('sha256').update(email).digest('hex')}.json`
export const profileKey = (id) => `users/${id}/profile.json`
export const dataKey = (id) => `users/${id}/data.json`
export const newId = () => randomBytes(12).toString('hex')

/** Read JSON + etag, or null when missing. */
export async function readJson(pathname) {
  try {
    const r = await get(pathname, { access: 'private', useCache: false })
    if (!r || r.statusCode !== 200) return null
    return { value: JSON.parse(await new Response(r.stream).text()), etag: r.blob.etag }
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null
    throw e
  }
}

/** Create-only write. Returns false if the key already exists (used for unique emails). */
export async function createJson(pathname, value) {
  try {
    const r = await put(pathname, JSON.stringify(value), { ...OPTS, allowOverwrite: false })
    return { etag: r.etag }
  } catch (e) {
    if (/already exists/i.test(String(e?.message))) return false
    throw e
  }
}

/** Overwrite; with `etag` the write only succeeds if nobody changed the blob meanwhile. */
export async function writeJson(pathname, value, etag) {
  try {
    const r = await put(pathname, JSON.stringify(value), { ...OPTS, allowOverwrite: true, ...(etag ? { ifMatch: etag } : {}) })
    return { etag: r.etag }
  } catch (e) {
    if (e instanceof BlobPreconditionFailedError) return false
    throw e
  }
}

export const remove = (...paths) => del(paths)
