import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import FormField, { inputClasses } from '../components/FormField'
import Navbar from '../components/Navbar'
import { analyzeIdea } from '../services/api'
import { ArrowRight, LoaderCircle, Lock } from 'lucide-react'

const BUSINESS_TYPES = ['Product', 'Service', 'Ecommerce', 'Local Business', 'SaaS / App', 'Other']

function validate(data) {
  const errors = {}
  const idea = data.businessIdea.trim()
  if (!idea) {
    errors.businessIdea = 'Please describe your business idea.'
  } else if (idea.length < 20) {
    errors.businessIdea = 'Please add a bit more detail \u2014 at least 20 characters.'
  }
  const customer = data.targetCustomer.trim()
  if (!customer) {
    errors.targetCustomer = 'Tell us who your customers are.'
  } else if (customer.length < 3) {
    errors.targetCustomer = 'Please be a bit more specific about your target customer.'
  }
  if (!data.location.trim()) {
    errors.location = 'Please enter your city or target market.'
  }
  if (!data.businessType) {
    errors.businessType = 'Please select a business type.'
  }
  const raw = data.budgetPKR.toString().trim()
  if (!raw) {
    errors.budgetPKR = 'Please enter your estimated budget.'
  } else if (!Number.isFinite(Number(raw)) || Number(raw) <= 0) {
    errors.budgetPKR = 'Budget must be a number greater than 0.'
  }
  return errors
}

export default function IdeaFormPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    businessIdea: '',
    targetCustomer: '',
    location: '',
    businessType: '',
    budgetPKR: '',
    additionalInfo: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => { const next = { ...prev }; delete next[name]; return next })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError(null)
    const newErrors = validate(formData)
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setIsSubmitting(true)
    try {
      const response = await analyzeIdea(formData)
      if (!response.analysis) {
        setServerError(response.message || 'No AI analysis was returned. Please check the server configuration.')
        return
      }
      navigate('/results', {
        state: {
          analysis: response.analysis,
          idea: {
            businessIdea: formData.businessIdea.trim(),
            targetCustomer: formData.targetCustomer.trim(),
            location: formData.location.trim(),
            businessType: formData.businessType,
            budgetPKR: formData.budgetPKR,
            additionalInfo: formData.additionalInfo.trim() || null,
          },
          analyzedAt: response.receivedAt,
        },
      })
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors)
      } else {
        setServerError(err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const errorCount = Object.keys(errors).length
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20 bg-gradient-to-b from-slate-50 to-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Page header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent-50 border border-accent-200 text-accent-700 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              Step 1 of 4
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 leading-tight tracking-tight">
              Tell Us About Your Idea
            </h1>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">
              Fill in the details below and our AI will analyze your business idea,
              score its viability, and give you a clear launch plan.
            </p>
          </div>

          {/* Form card */}
          <div className="surface-card p-6 sm:p-10">
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-6">

                <FormField label="Business Idea" required error={errors.businessIdea}
                  hint="Describe your idea clearly — what will you sell or offer?">
                  <textarea
                    name="businessIdea"
                    rows={5}
                    maxLength={2000}
                    value={formData.businessIdea}
                    onChange={handleChange}
                    placeholder="Describe the business you want to start..."
                    aria-invalid={!!errors.businessIdea}
                    className={inputClasses(!!errors.businessIdea) + ' resize-none'}
                  />
                </FormField>

                <FormField label="Target Customer" required error={errors.targetCustomer}
                  hint="Who will buy your product or service?">
                  <input
                    type="text"
                    name="targetCustomer"
                    value={formData.targetCustomer}
                    onChange={handleChange}
                    placeholder="Who will buy your product or service?"
                    aria-invalid={!!errors.targetCustomer}
                    className={inputClasses(!!errors.targetCustomer)}
                  />
                </FormField>

                <FormField label="Location / Market" required error={errors.location}>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Karachi, Pakistan or Global"
                    aria-invalid={!!errors.location}
                    className={inputClasses(!!errors.location)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <FormField label="Business Type" required error={errors.businessType}>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      aria-invalid={!!errors.businessType}
                      className={inputClasses(!!errors.businessType) + ' cursor-pointer'}
                    >
                      <option value="" disabled>Select a business type</option>
                      {BUSINESS_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Estimated Budget" required error={errors.budgetPKR}
                    hint="In Pakistani Rupees (PKR)">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 pointer-events-none select-none">
                        PKR
                      </span>
                      <input
                        type="number"
                        name="budgetPKR"
                        min="0"
                        inputMode="numeric"
                        value={formData.budgetPKR}
                        onChange={handleChange}
                        placeholder="e.g. 50000"
                        aria-invalid={!!errors.budgetPKR}
                        className={inputClasses(!!errors.budgetPKR) + ' pl-14'}
                      />
                    </div>
                  </FormField>

                </div>

                <FormField label="Additional Information"
                  hint="Optional — anything else that might help us analyze your idea better.">
                  <textarea
                    name="additionalInfo"
                    rows={3}
                    maxLength={1000}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Anything else we should know?"
                    className={inputClasses(false) + ' resize-none'}
                  />
                </FormField>

              </div>

              {errorCount > 0 && (
                <div className="mt-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-5 py-4 text-sm font-medium" role="alert">
                  Please fix {errorCount} error{errorCount > 1 ? 's' : ''} above before continuing.
                </div>
              )}

              {serverError && (
                <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 text-sm font-medium" role="alert">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-accent-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={19} strokeWidth={2.25} className="animate-spin" aria-hidden="true" />
                    Analyzing your idea…
                  </>
                ) : (
                  <>
                    Analyze My Idea
                    <ArrowRight size={19} strokeWidth={2.25} aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                <Lock size={13} strokeWidth={1.75} aria-hidden="true" />
                Your idea is private. No data is shared without your consent.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
