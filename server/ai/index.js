import { aiConfig } from './config.js'
import { assertValidProvider } from './providerInterface.js'
import { geminiProvider } from './providers/gemini.js'
import { ollamaProvider } from './providers/ollama.js'
import { openaiCompatibleProvider } from './providers/openaiCompatible.js'

// Provider registry. Switching or adding a model means editing this list and
// AI_PROVIDER — the route, the schema, and the frontend never change.
const providers = [geminiProvider, ollamaProvider, openaiCompatibleProvider].map(assertValidProvider)

function byId(id) {
  return providers.find((p) => p.id === id) || null
}

/**
 * Resolve the provider that should handle a request.
 *
 *   { provider, model, status: 'ready' }                      -> usable provider
 *   { provider: null, status: 'not_configured' }               -> AI deliberately off
 *   { provider: null, status: 'misconfigured' }                -> selected but incomplete
 *   { provider: null, status: 'unavailable' }                  -> selected but not reachable
 */
export async function getActiveProvider() {
  if (aiConfig.provider === 'none') {
    return { provider: null, status: 'not_configured', reason: 'AI analysis is disabled (AI_PROVIDER=none).' }
  }

  const named = byId(aiConfig.provider)
  if (!named) {
    return {
      provider: null,
      status: 'not_configured',
      reason: `Unknown AI_PROVIDER '${aiConfig.provider}'. Expected one of: ${providers.map((p) => p.id).join(', ')} or none.`,
    }
  }

  const detected = await named.detect()
  if (!detected.ready) {
    return {
      provider: null,
      status: detected.misconfigured ? 'misconfigured' : 'unavailable',
      reason: detected.reason,
      tried: named.label,
    }
  }
  return { provider: named, model: detected.model, note: detected.note, status: 'ready' }
}

/** Run the analysis with whichever provider is currently active. */
export async function analyzeIdea(idea) {
  const active = await getActiveProvider()
  if (!active.provider) {
    const error = new Error(active.reason)
    error.code = active.status === 'misconfigured' ? 'AI_MISCONFIGURED' : 'AI_NOT_CONFIGURED'
    throw error
  }
  return active.provider.analyze(idea, { model: active.model })
}

export const registeredProviderIds = providers.map((p) => p.id)
