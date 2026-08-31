// Saved business-validation reports, kept in this browser only.
//
// Nothing here talks to the server or reveals the provider: reports already
// contain AI output, and the only record of what a founder analysed is the
// router state they are viewing. Writing it to localStorage keeps it available
// after a refresh and stays consistent with "your idea is private" — the data
// never leaves the device and is never sent anywhere.

const STORAGE_KEY = 'startupiq.reports.v1'
const MAX_REPORTS = 10

function storage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    // Private-mode browsers can refuse access outright.
    return null
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// Small non-cryptographic hash — only used to recognise the same report twice.
function hash(input) {
  let h = 5381
  for (let index = 0; index < input.length; index += 1) {
    h = (h * 33) ^ input.charCodeAt(index)
  }
  return (h >>> 0).toString(36)
}

// A report arriving from the form is saved once, then read back by id, so the
// same id must be produced from the report itself. Without this, React's
// double render in development would store every report twice.
function reportIdOf(report) {
  const analyzedAt = text(report && report.analyzedAt)
  const idea = text(report && report.idea && report.idea.businessIdea)
  return `r-${hash(`${analyzedAt}|${idea}`)}`
}

function reportSummary(report) {
  const idea = (report && report.idea) || {}
  const businessIdea = text(idea.businessIdea)
  return {
    title: businessIdea.length > 110 ? `${businessIdea.slice(0, 110).trimEnd()}…` : businessIdea || 'Untitled idea',
    location: text(idea.location) || 'Not provided',
    businessType: text(idea.businessType) || 'Not provided',
    budgetPKR: Number.isFinite(Number(idea.budgetPKR)) && Number(idea.budgetPKR) > 0 ? Number(idea.budgetPKR) : null,
    analyzedAt: text(report && report.analyzedAt) || null,
  }
}

function isValidReport(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) return false
  if (!report.idea || typeof report.idea !== 'object' || Array.isArray(report.idea)) return false
  if (!report.analysis || typeof report.analysis !== 'object' || Array.isArray(report.analysis)) return false
  return typeof report.idea.businessIdea === 'string' && text(report.idea.businessIdea) !== ''
}

// Anything read from storage is untrusted: it may be old, hand-edited or a
// leftover from another build. Rebuild a plain entry and drop what we cannot
// recognise instead of letting a bad record break the page.
function toEntry(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const report = value.report
  if (!isValidReport(report)) return null
  const savedAt = Number.isFinite(Number(value.savedAt)) ? Number(value.savedAt) : Date.parse(text(value.savedAt))
  if (!Number.isFinite(savedAt)) return null
  return {
    id: text(value.id) || reportIdOf(report),
    savedAt,
    summary: reportSummary(report),
    report,
  }
}

function readAll() {
  const store = storage()
  if (!store) return []

  let raw = null
  try {
    raw = store.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    removeStore(store)
    return []
  }
  if (!Array.isArray(parsed)) {
    removeStore(store)
    return []
  }

  const seen = new Set()
  const entries = []
  for (const value of parsed) {
    const entry = toEntry(value)
    if (!entry || seen.has(entry.id)) continue
    seen.add(entry.id)
    entries.push(entry)
  }
  return entries.sort((a, b) => b.savedAt - a.savedAt)
}

function removeStore(store) {
  try {
    store.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do — an unreadable store stays ignored.
  }
}

function writeAll(entries) {
  const store = storage()
  if (!store) return false
  const sorted = [...entries].sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_REPORTS)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(sorted))
      return true
    } catch {
      // A full quota is the realistic failure: drop the oldest report and try
      // once more before giving up silently.
      sorted.pop()
    }
  }
  return false
}

export function listReports() {
  return readAll().map(({ id, savedAt, summary }) => ({ id, savedAt, summary }))
}

export function getLatestReport() {
  const [latest] = readAll()
  return latest ? { id: latest.id, report: latest.report } : null
}

export function getReport(id) {
  const wanted = text(id)
  if (!wanted) return null
  const match = readAll().find(entry => entry.id === wanted)
  return match ? { id: match.id, report: match.report } : null
}

// Saving the same report again refreshes it in place instead of duplicating it.
export function saveReport(report) {
  if (!isValidReport(report)) return null
  const id = reportIdOf(report)
  const entry = { id, savedAt: Date.now(), summary: reportSummary(report), report }
  const kept = readAll().filter(existing => existing.id !== id)
  writeAll([entry, ...kept])
  return id
}

export function deleteReport(id) {
  const wanted = text(id)
  if (!wanted) return false
  return writeAll(readAll().filter(entry => entry.id !== wanted))
}

export function clearReports() {
  const store = storage()
  if (!store) return false
  removeStore(store)
  return true
}

export function formatSavedAt(savedAt) {
  const stamp = Number(savedAt)
  if (!Number.isFinite(stamp)) return ''
  const date = new Date(stamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
