// Frontend API client — the only place the frontend talks to the backend.
// POST /api/analyze is proxied to the Express server (see vite.config.js) in
// development, so a relative URL works everywhere.

// The server waits AI_TIMEOUT_MS for the provider (120000 here, and a real
// analysis has been seen to take ~85s) and answers with its own clear error when
// that runs out. This frontend cannot read server env, so it has to stay ahead of
// that number by hand: raise it together with AI_TIMEOUT_MS, or a browser will
// give up on an analysis that was about to succeed. The point of the ceiling is
// only that a hung connection cannot spin forever with no way out.
const REQUEST_TIMEOUT_MS = 150_000

export async function analyzeIdea(formData) {
  let response
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        businessIdea: formData.businessIdea.trim(),
        targetCustomer: formData.targetCustomer.trim(),
        location: formData.location.trim(),
        businessType: formData.businessType,
        budget: { amount: Number(formData.budgetPKR), currency: 'PKR' },
        additionalInformation: formData.additionalInfo.trim() || null,
      }),
    })
  } catch (err) {
    // Stopping the fetch here does not stop the request already running upstream,
    // so this wording asks for a pause rather than an instant second attempt.
    if (err && err.name === 'TimeoutError') {
      throw new Error(
        'That took longer than expected, so this page stopped waiting. The analysis may still have used one of the limited AI calls for today, so please give it a minute before trying again.'
      )
    }
    throw new Error(
      'Could not reach the StartupIQ server. Make sure it is running (npm run server) and try again.'
    )
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // fall through — handled by the status check below
  }

  if (!response.ok) {
    if (response.status === 400 && data && data.errors) {
      const error = new Error(data.message || 'Please fix the highlighted fields.')
      error.validationErrors = data.errors
      throw error
    }
    throw new Error((data && data.message) || `The request failed (${response.status}). Please try again.`)
  }

  return data
}
