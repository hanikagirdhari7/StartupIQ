import { aiConfig } from '../config.js'
import { buildAnalysisPrompt } from '../prompt.js'
import { parseModelJson } from '../parseModelJson.js'
import { assertValidAnalysis } from '../schemaGuard.js'

/**
 * Ollama — free, open-source, runs the model locally on this machine.
 * No API key and no vendor account: Ollama serves an HTTP API on localhost and
 * the models themselves are open-weight (e.g. Qwen2.5, Llama 3.2, Gemma 3).
 */

async function fetchTags(baseUrl) {
  const response = await fetch(`${baseUrl}/api/tags`, {
    signal: AbortSignal.timeout(aiConfig.probeTimeoutMs),
  })
  if (!response.ok) throw new Error(`Ollama responded ${response.status}`)
  return response.json()
}

export const ollamaProvider = {
  id: 'ollama',
  label: 'Ollama (free, local open-source model)',

  async detect() {
    const { baseUrl, model } = aiConfig.ollama
    try {
      const body = await fetchTags(baseUrl)
      const installed = (body.models || []).map((m) => m.name)
      if (installed.length === 0) {
        return { ready: false, reason: 'Ollama is running but no model is installed. Run: ollama pull qwen2.5:3b' }
      }
      if (model) {
        const match = installed.find((name) => name === model || name.startsWith(model))
        return match
          ? { ready: true, model: match }
          : { ready: false, reason: `Model '${model}' not found. Installed: ${installed.join(', ')}` }
      }
      return { ready: true, model: installed[0], note: `Auto-selected installed model '${installed[0]}' (set OLLAMA_MODEL to choose).` }
    } catch (err) {
      return { ready: false, reason: `Ollama not reachable at ${baseUrl} (${err.message}). Is 'ollama serve' running?` }
    }
  },

  async analyze(idea, { model }) {
    const { baseUrl } = aiConfig.ollama
    const { system, user } = buildAnalysisPrompt(idea)

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(aiConfig.timeoutMs),
      body: JSON.stringify({
        model,
        system,
        prompt: user,
        stream: false,
        format: 'json',
        options: { temperature: 0.4 },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama generation failed (${response.status}).`)
    }

    const body = await response.json()
    return assertValidAnalysis(parseModelJson(body.response))
  },
}
