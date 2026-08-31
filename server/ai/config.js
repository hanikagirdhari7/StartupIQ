// Runtime configuration for the AI layer.
//
// Every value comes from the environment. Nothing here embeds, defaults, or
// requests a secret, and no key value is ever logged or returned. The server
// loads the git-ignored .env via: node --env-file-if-exists=.env server/index.js
//
// Recognised variables:
//   AI_PROVIDER        'gemini' | 'ollama' | 'openai-compatible' | 'none'  (default: none)
//   GEMINI_API_KEY     required for AI_PROVIDER=gemini (see .env)
//   GEMINI_MODEL       default: gemini-3.6-flash
//   OLLAMA_BASE_URL    default: http://localhost:11434
//   OLLAMA_MODEL       optional — auto-detects an installed model
//   AI_BASE_URL        OpenAI-compatible endpoint (default: http://localhost:1234/v1)
//   AI_MODEL           model name for the OpenAI-compatible provider
//   AI_API_KEY         only if that server requires one; local servers need none
//   AI_TIMEOUT_MS      generation timeout (default: 60000)
//   AI_PROBE_TIMEOUT_MS availability probe timeout for local runtimes (default: 1500)

function numberFromEnv(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const aiConfig = {
  provider: (process.env.AI_PROVIDER || 'none').trim().toLowerCase(),
  timeoutMs: numberFromEnv(process.env.AI_TIMEOUT_MS, 60000),
  probeTimeoutMs: numberFromEnv(process.env.AI_PROBE_TIMEOUT_MS, 1500),
  gemini: {
    apiKey: (process.env.GEMINI_API_KEY || '').trim(),
    model: (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim(),
  },
  ollama: {
    baseUrl: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, ''),
    model: (process.env.OLLAMA_MODEL || '').trim(),
  },
  openaiCompatible: {
    baseUrl: (process.env.AI_BASE_URL || 'http://localhost:1234/v1').replace(/\/+$/, ''),
    model: (process.env.AI_MODEL || '').trim(),
    // Never defaulted — an absent key simply means "local server, no auth".
    apiKey: (process.env.AI_API_KEY || '').trim(),
  },
}

// Defence in depth for logging: if any SDK or dependency ever throws an error
// message that echoes a credential, it is scrubbed before reaching the console.
const SECRET_VALUES = [process.env.GEMINI_API_KEY, process.env.AI_API_KEY].filter(
  (value) => typeof value === 'string' && value.length >= 6
)

export function redactSecrets(text) {
  return SECRET_VALUES.reduce(
    (redacted, secret) => redacted.split(secret).join('[redacted]'),
    String(text ?? '')
  )
}
