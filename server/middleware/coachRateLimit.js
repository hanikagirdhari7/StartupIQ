import { createHash } from 'node:crypto'

// Sliding-window limit for POST /api/coach — Ask IQ only.
//
// Its own counters, deliberately separate from the analysis limiter: a founder
// who asks ten follow-up questions has not run ten analyses, and sharing a bucket
// would let a conversation block the form. Both still spend the same provider
// quota, so the ceiling is generous for reading and typing but not open-ended.
//
//   burst   8 per minute   — a held-down Enter key or a script
//   window  30 per hour     — a long conversation, with room to spare
//
// In-process only, so a restart clears it and each extra instance gets its own
// budget. Same size question as the analysis limiter; see its note on trust proxy.

const BURST_WINDOW_MS = 60 * 1000
const BURST_MAX = 8
const QUOTA_WINDOW_MS = 60 * 60 * 1000
const QUOTA_MAX = 30
const SWEEP_THRESHOLD = 2000

const hits = new Map()

function prune(times, now, windowMs) {
  const cutoff = now - windowMs
  let expired = 0
  while (expired < times.length && times[expired] <= cutoff) expired += 1
  if (expired > 0) times.splice(0, expired)
  return times
}

function sweep(now) {
  for (const [key, entry] of hits) {
    prune(entry.quota, now, QUOTA_WINDOW_MS)
    prune(entry.burst, now, BURST_WINDOW_MS)
    if (entry.quota.length === 0 && entry.burst.length === 0) hits.delete(key)
  }
}

function waitMs(times, now, windowMs) {
  if (times.length === 0) return 0
  return Math.max(0, times[0] + windowMs - now)
}

function humanWait(seconds) {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

function clientTag(ip) {
  return createHash('sha256').update(String(ip)).digest('hex').slice(0, 8)
}

function reject(res, wait, ip, window) {
  const seconds = Math.max(1, Math.ceil(wait / 1000))
  console.warn(
    `${new Date().toISOString()} [coach-rate-limit] client=${clientTag(ip)} ` +
      `window=${window} rejected retryAfter=${seconds}s`
  )
  res.set('Retry-After', String(seconds))
  return res.status(429).json({
    success: false,
    error: 'RATE_LIMITED',
    retryAfterSeconds: seconds,
    message: `Ask IQ has answered a lot of questions just now. Please wait about ${humanWait(seconds)} and ask again.`,
  })
}

export function coachRateLimit(req, res, next) {
  const now = Date.now()
  const key = req.ip || 'unidentified'
  if (hits.size > SWEEP_THRESHOLD) sweep(now)

  let entry = hits.get(key)
  if (!entry) {
    entry = { burst: [], quota: [] }
    hits.set(key, entry)
  }
  prune(entry.burst, now, BURST_WINDOW_MS)
  prune(entry.quota, now, QUOTA_WINDOW_MS)

  if (entry.burst.length >= BURST_MAX) {
    return reject(res, waitMs(entry.burst, now, BURST_WINDOW_MS), key, 'burst')
  }
  if (entry.quota.length >= QUOTA_MAX) {
    return reject(res, waitMs(entry.quota, now, QUOTA_WINDOW_MS), key, 'quota')
  }

  entry.burst.push(now)
  entry.quota.push(now)
  return next()
}
