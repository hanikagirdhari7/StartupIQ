// Money and date presentation for the whole dashboard.
//
// The analysis itself only ever carries plain numbers and ISO strings — this
// file decides how they look. PKR stays the default currency because StartupIQ
// serves Pakistani founders, but amounts are grouped the way Pakistani price
// tags read (1,00,000 rather than 100,000) and dates follow the visitor's own
// browser locale instead of a hardcoded en-US.

// last group of 3, then groups of 2: 1234567 -> 12,34,567
function groupPakistani(digits) {
  if (digits.length <= 3) return digits
  const head = digits.slice(0, -3)
  const tail = digits.slice(-3)
  const pairs = head.replace(/\B(?=(\d\d)+$)/g, ',')
  return `${pairs},${tail}`
}

// `fallback` keeps each section's own wording for a missing figure
// ("Not provided", "Not estimated", "Budget not given", "—").
export function formatPKR(value, fallback = '—') {
  const isBlank = value === null || value === undefined || String(value).trim() === ''
  const number = isBlank ? NaN : Number(value)
  if (!Number.isFinite(number)) return fallback
  const rounded = Math.round(number)
  const sign = rounded < 0 ? '-' : ''
  return `${sign}PKR ${groupPakistani(String(Math.abs(rounded)))}`
}

const DATE_OPTIONS = { month: 'short', day: 'numeric', year: 'numeric' }

function validDate(value) {
  const stamp = typeof value === 'number' ? value : Date.parse(String(value || ''))
  if (!Number.isFinite(stamp)) return null
  const date = new Date(stamp)
  return Number.isNaN(date.getTime()) ? null : date
}

// Accepts an epoch milliseconds value or an ISO string.
export function formatDate(value, fallback = '') {
  const date = validDate(value)
  return date ? date.toLocaleDateString(undefined, DATE_OPTIONS) : fallback
}

const DATE_TIME_OPTIONS = { ...DATE_OPTIONS, hour: 'numeric', minute: '2-digit' }

export function formatDateTime(value, fallback = '') {
  const date = validDate(value)
  return date ? date.toLocaleString(undefined, DATE_TIME_OPTIONS) : fallback
}
