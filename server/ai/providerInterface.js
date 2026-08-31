/**
 * Provider contract — the single rulebook every AI provider must follow.
 *
 * A provider is a plain object exposing three members. Nothing in the route,
 * the frontend, or the schema depends on which model or vendor sits behind it,
 * so a free/local model can be swapped for another later without touching
 * anything outside server/ai/providers/.
 *
 *   id            string  — unique key, e.g. 'ollama'
 *   label         string  — human-readable name used in API responses/logs
 *   detect()      async () => { ready: boolean, model?: string, reason?: string }
 *                         Cheap, side-effect-free readiness check. Must resolve
 *                         (never throw) so one dead provider cannot break the
 *                         request — it just reports ready: false.
 *   analyze(idea) async (ideaSubmission) => analysisObject
 *                         Must return an object matching ANALYSIS_RESPONSE_SCHEMA
 *                         (server/schemas/analysisResponse.js) and should run its
 *                         output through assertValidAnalysis() first. Throws when
 *                         the model is unreachable or returns unusable output.
 *
 * Hard rules for every implementation:
 *   - Credentials come from the environment only. Never hard-coded, never logged,
 *     never included in an error message or in anything sent to the client.
 *   - Never fabricate analysis. If the model did not produce it, throw.
 *   - Never return placeholder scores or invented prices, listings, or statistics.
 *   - Tag every thrown error with a code from server/routes/analyze.js SAFE_ERRORS so
 *     the route can answer with a safe status and message.
 */

export const PROVIDER_CONTRACT_KEYS = ['id', 'label', 'detect', 'analyze']

export function assertValidProvider(provider) {
  if (!provider || typeof provider !== 'object') {
    throw new Error('AI provider must be an object.')
  }
  if (typeof provider.id !== 'string' || typeof provider.label !== 'string') {
    throw new Error(`AI provider '${provider?.id ?? 'unknown'}' must define string id and label.`)
  }
  if (typeof provider.detect !== 'function' || typeof provider.analyze !== 'function') {
    throw new Error(`AI provider '${provider.id}' must implement detect() and analyze().`)
  }
  return provider
}
