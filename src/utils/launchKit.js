import { formatDate } from './format'

// The Launch Kit re-uses what the report already says: the `launchRoadmap` periods,
// any `nextActions` the decision card does not already print, and the
// `marketingRecommendations`, rendered as tickable steps. It invents no task, cost or
// date — if the analysis did not say it, the kit does not show it.
//
// Ids are positions inside the stored analysis, which never changes once saved, so
// a tick stays attached to the same step after a refresh or a reopen. Each source
// keeps its own prefix (`n`, `p0`…, `m`) so adding a group can never renumber
// another group's saved ids.

// The decision card lists the first three nextActions verbatim under "What to do
// next", so the kit starts after them rather than repeating the same advice twice on
// one page. Slicing after numbering keeps each saved tick on its own id.
const DECISION_CARD_ACTION_COUNT = 3

function numbered(value, prefix) {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => ({
      id: `${prefix}-${index}`,
      text: typeof item === 'string' ? item.trim() : '',
    }))
    .filter(item => item.text !== '')
}

export function buildLaunchKit(analysis) {
  const actions = numbered(analysis && analysis.nextActions, 'n').slice(DECISION_CARD_ACTION_COUNT)

  const phases = (analysis && Array.isArray(analysis.launchRoadmap) ? analysis.launchRoadmap : [])
    .map((step, index) => ({
      id: `p${index}`,
      title: (step && typeof step.period === 'string' && step.period.trim()) || `Phase ${index + 1}`,
      items: numbered(step && step.actions, `p${index}`),
    }))
    .filter(phase => phase.items.length > 0)

  const groups = []
  if (actions.length > 0) groups.push({ id: 'first', title: 'Do these first', items: actions })
  groups.push(...phases)

  const marketing = numbered(analysis && analysis.marketingRecommendations, 'm')
  if (marketing.length > 0) groups.push({ id: 'marketing', title: 'Marketing', items: marketing })

  const items = groups.flatMap(group => group.items)
  return { groups, items }
}

export function countDone(items, checked) {
  return items.reduce((sum, item) => (checked[item.id] === true ? sum + 1 : sum), 0)
}

// Plain text so the plan survives leaving the app — notes, WhatsApp, email or a
// printed page. Completed items keep their text, because a crossed-out line is
// useless to whoever reads it on paper.
export function buildLaunchKitText({ kit, checked, idea, analyzedAt }) {
  const done = countDone(kit.items, checked)
  const lines = ['STARTUPIQ LAUNCH KIT', '']

  const ideaText = idea && typeof idea.businessIdea === 'string' ? idea.businessIdea.trim() : ''
  if (ideaText) lines.push(ideaText, '')

  const meta = [
    idea && idea.location,
    idea && idea.businessType,
    formatDate(analyzedAt) ? `Analysed ${formatDate(analyzedAt)}` : '',
  ].filter(Boolean)
  if (meta.length > 0) lines.push(meta.join(' · '))

  lines.push(`${done} of ${kit.items.length} done`, '')

  for (const group of kit.groups) {
    const groupDone = countDone(group.items, checked)
    lines.push(`${group.title.toUpperCase()} (${groupDone} of ${group.items.length})`)
    for (const item of group.items) {
      lines.push(`  [${checked[item.id] === true ? 'x' : ' '}] ${item.text}`)
    }
    lines.push('')
  }

  lines.push('From your StartupIQ report. Guidance to work from, not verified market data.')
  return lines.join('\n').trimEnd()
}
