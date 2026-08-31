// Frontend API client — the only place the frontend talks to the backend.
// POST /api/analyze is proxied to the Express server (see vite.config.js) in
// development, so a relative URL works everywhere.

export async function analyzeIdea(formData) {
  let response
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessIdea: formData.businessIdea.trim(),
        targetCustomer: formData.targetCustomer.trim(),
        location: formData.location.trim(),
        businessType: formData.businessType,
        budget: { amount: Number(formData.budgetPKR), currency: 'PKR' },
        additionalInformation: formData.additionalInfo.trim() || null,
      }),
    })
  } catch {
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
