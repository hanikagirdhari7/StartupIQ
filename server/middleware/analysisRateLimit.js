// Sliding-window rate limit for POST /api/analyze.
//
// Why this exists: every accepted request spends a call on the shared AI key,
// and the free tier allows only a handful per day — one visitor refreshing the
// submit button can lock the whole service out for everyone. Two windows are
// applied per client address:
//
//   burst   3 per minute   — a script or a held-down key; no human clicks
//                            three analyses in a minute, since one takes ~30s
//   window  10 per 15 min  — a generous ceiling for real exploration of the
//                            form, so honest users never brush against it
//
// Counters live in this process only, so a restart clears them and each extra
// instance would get its own budget. That is the right size for a
// single-instance MVP; move to shared storage before scaling out.
//
// Keying uses req.ip. Express only resolves that to the real visitor when the
// operator sets `trust proxy`, and forwarding headers must not be trusted
// blindly because a client can invent them. Behind a proxy without that
// setting every visitor shares one bucket — noted rather than worked around.
//
// Rejections are answered here and never reach the AI layer, so they carry
// RATE_LIMITED rather than an AI_* code: the upstream was not contacted, and
// the two failures need different fixes.

const BURST_WINDOW_MS = 60 * 1000
const BURST_MAX = 3
const QUOTA_WINDOW_MS = 15 * 60 * 1000
const QUOTA_MAX = 10
// Timestamps expire on their own, but a spread of addresses could still grow
// the map, so it is swept once it gets large.
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

// Earliest surviving request decides how long to wait for room.
function waitMs(times, now, windowMs) {
  if (times.length === 0) return 0
  return Math.max(0, times[0] + windowMs - now)
}

function humanWait(seconds) {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

function reject(res, wait) {
  const seconds = Math.max(1, Math.ceil(wait / 1000))
  res.set('Retry-After', String(seconds))
  return res.status(429).json({
    success: false,
    error: 'RATE_LIMITED',
    message: `You have run several analyses in a row. Please wait about ${humanWait(seconds)} and try again.`,
  })
}

export function analysisRateLimit(req, res, next) {
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

  if (entry.burst.length >= BURST_MAX) return reject(res, waitMs(entry.burst, now, BURST_WINDOW_MS))
  if (entry.quota.length >= QUOTA_MAX) return reject(res, waitMs(entry.quota, now, QUOTA_WINDOW_MS))

  entry.burst.push(now)
  entry.quota.push(now)
  return next()
}
