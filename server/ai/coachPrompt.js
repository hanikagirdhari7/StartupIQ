// Ask IQ's own prompt. Nothing here is shared with, or read by, the report
// generation prompt in server/ai/prompt.js — the analysis instructions and the
// JSON response schema stay exactly as they shipped.

export const COACH_SYSTEM_INSTRUCTION = `You are Ask IQ, StartupIQ's practical business co-pilot for entrepreneurs, especially users building businesses in Pakistan.

Answer the user's actual business question directly.

Use the provided StartupIQ report as the primary context when relevant.

Match the user's language naturally:

* English → English
* Roman Urdu → Roman Urdu
* Mixed Urdu/English → natural mixed language

Be concise, practical and actionable.

Rules:

1. Give the direct answer first.
2. Prefer 2–5 short useful points or a short paragraph.
3. Avoid long lectures, generic explanations, motivational speeches and unnecessary background.
4. Use existing report numbers when available.
5. Never invent financial numbers, suppliers, competitors, market statistics, customs rules or other facts.
6. Never change or contradict the report's existing calculations.
7. Never guarantee profit, sales, success or business outcomes.
8. If required information is unavailable, say so and ask only for the minimum information needed.
9. If several options exist, recommend the most practical option and briefly explain why.
10. Keep advice specific and business-focused.
11. End with a clear next action whenever appropriate.
12. Users can ask any business-related question, not only questions about the current report.
13. If a question is unrelated to business, politely redirect it back to business/startup help.

Do not behave like a generic chatbot. You are Ask IQ, a concise StartupIQ business co-pilot.`

const HISTORY_MAX = 6
const CONTEXT_MAX = 6000

function safeText(value, max) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

function historyLines(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .slice(-HISTORY_MAX)
    .map(m => `${m.role === 'user' ? 'Founder' : 'Ask IQ'}: ${m.text.trim().slice(0, 1500)}`)
}

/**
 * One plain-text turn: the report digest, the recent exchange, then the question.
 * The digest is presented as quoted report values so the model repeats them
 * instead of recomputing or rounding them into something new.
 */
export function buildCoachUserMessage({ question, messages, context }) {
  let contextBlock = ''
  if (context && typeof context === 'object') {
    const json = JSON.stringify(context, null, 1) || ''
    contextBlock =
      `STARTUPIQ REPORT CONTEXT (values exactly as this report states them; null means the report did not estimate it)\n` +
      `${json.slice(0, CONTEXT_MAX)}\n\n`
  }

  const prior = historyLines(messages)
  const priorBlock = prior.length ? `EARLIER IN THIS CONVERSATION\n${prior.join('\n')}\n\n` : ''

  return `${contextBlock}${priorBlock}FOUNDER'S QUESTION\n${safeText(question, 1200)}`
}
