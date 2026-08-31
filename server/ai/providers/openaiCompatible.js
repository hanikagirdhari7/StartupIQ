import { aiConfig } from '../config.js'
import { buildAnalysisPrompt } from '../prompt.js'
import { parseModelJson } from '../parseModelJson.js'
import { assertValidAnalysis } from '../schemaGuard.js'

/**
 * OpenAI-compatible chat endpoint — for any LOCAL free server that speaks the
 * /v1/chat/completions shape: LM Studio's local server, llama.cpp's server,
 * vLLM, LocalAI. Defaults to localhost, and a key is only sent if the operator
 * explicitly provided one. This is NOT wired to any paid hosted service.
 */

export const openaiCompatibleProvider = {
  id: 'openai-compatible',
  label: 'Local OpenAI-compatible server (LM Studio / llama.cpp / vLLM / LocalAI)',

  async detect() {
    const { baseUrl, model } = aiConfig.openaiCompatible
    if (!model) {
      return { ready: false, reason: "Set AI_MODEL to the model served at this endpoint (e.g. AI_MODEL='qwen2.5-3b-instruct')." }
    }
    try {
      const response = await fetch(`${baseUrl}/models`, {
        signal: AbortSignal.timeout(aiConfig.probeTimeoutMs),
        headers: aiConfig.openaiCompatible.apiKey
          ? { Authorization: `Bearer ${aiConfig.openaiCompatible.apiKey}` }
          : {},
      })
      if (!response.ok) throw new Error(`responded ${response.status}`)
      return { ready: true, model }
    } catch (err) {
      return { ready: false, reason: `No local model server at ${baseUrl} (${err.message}).` }
    }
  },

  async analyze(idea, { model }) {
    const { baseUrl, apiKey } = aiConfig.openaiCompatible
    const { system, user } = buildAnalysisPrompt(idea)

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      signal: AbortSignal.timeout(aiConfig.timeoutMs),
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Model server request failed (${response.status}).`)
    }

    const body = await response.json()
    const content = body.choices?.[0]?.message?.content
    return assertValidAnalysis(parseModelJson(content))
  },
}
