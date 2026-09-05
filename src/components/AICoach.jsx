import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Loader2, MessagesSquare, Sparkles, Trash2, X } from 'lucide-react'
import { askCoach } from '../services/coachApi'
import { buildCoachContext } from '../services/coachContext'

// Ask IQ — a chat panel that reads the report already on screen and answers the
// one question the founder is stuck on. It is additive by design: it receives the
// report as a read-only prop, sends a trimmed digest of it to /api/coach, and
// writes nothing back. The report, its Financial Fit figures and the Scenario
// Calculator render exactly as they did before this component existed.

const STARTERS = [
  'Is this idea worth launching?',
  'How can I reduce my biggest risk?',
  'What would you change before launch?',
]

function Bubble({ message }) {
  const fromCoach = message.role === 'assistant'
  return (
    <div className={fromCoach ? 'flex justify-start' : 'flex justify-end'}>
      <div
        className={
          fromCoach
            ? 'max-w-[88%] rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-slate-800'
            : 'max-w-[88%] rounded-2xl rounded-br-md bg-accent-600 px-3.5 py-2.5 text-sm leading-relaxed text-white'
        }
      >
        {fromCoach ? <CoachText text={message.text} /> : <p className="whitespace-pre-wrap break-words">{message.text}</p>}
      </div>
    </div>
  )
}

// Ask IQ answers in markdown. Rather than pull in a parser — or hand model output
// to innerHTML, where a quoted report line could carry markup — this handles only
// the four markers the model actually uses and leaves every other character as
// literal text.
const BOLD = /(\*\*[^*\n]+\*\*)/g
const EMPHASIS = /\*([^*\n]+)\*/g
const HEADING = /^#{1,6}\s+/
const BULLET = /^[-*+]\s+(.*)$/

function inlineNodes(text, keyBase) {
  const nodes = []
  text.split(BOLD).forEach((chunk, index) => {
    if (!chunk) return
    if (chunk.length > 4 && chunk.startsWith('**') && chunk.endsWith('**')) {
      nodes.push(<strong key={`${keyBase}-${index}`}>{chunk.slice(2, -2)}</strong>)
    } else {
      nodes.push(chunk.replace(EMPHASIS, '$1'))
    }
  })
  return nodes
}

function CoachText({ text }) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        if (HEADING.test(line)) {
          return (
            <p key={index} className="font-extrabold break-words">
              {inlineNodes(line.replace(HEADING, ''), index)}
            </p>
          )
        }
        const bullet = BULLET.exec(line)
        if (bullet) {
          return (
            <p key={index} className="flex gap-1.5 break-words">
              <span aria-hidden="true" className="shrink-0">•</span>
              <span>{inlineNodes(bullet[1], index)}</span>
            </p>
          )
        }
        return (
          <p key={index} className="break-words">
            {inlineNodes(line, index)}
          </p>
        )
      })}
    </div>
  )
}

export default function AICoach({ reportData }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [error, setError] = useState(null)
  const launcherRef = useRef(null)
  const inputRef = useRef(null)
  const logRef = useRef(null)
  const idRef = useRef(0)

  // Rebuilt only when the report object changes, so typing never re-digests it.
  const context = useMemo(() => buildCoachContext(reportData), [reportData])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else launcherRef.current?.focus()
  }, [open])

  useEffect(() => {
    const node = logRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, waiting, error])

  useEffect(() => {
    if (!open) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  async function send(rawText) {
    const question = String(rawText ?? '').trim()
    if (!question || waiting) return

    setError(null)
    setDraft('')
    setMessages(prev => [...prev, { id: (idRef.current += 1), role: 'user', text: question }])
    setWaiting(true)

    try {
      const reply = await askCoach({ question, messages, context })
      setMessages(prev => [...prev, { id: (idRef.current += 1), role: 'assistant', text: reply }])
    } catch (err) {
      // Nothing is added to the conversation for a failed question: the text goes
      // back in the box so the founder can send it again or rephrase it.
      setMessages(prev => prev.slice(0, -1))
      setDraft(question)
      setError(err?.message || 'Ask IQ could not answer right now. Please try again.')
      inputRef.current?.focus()
    } finally {
      setWaiting(false)
    }
  }

  function clearChat() {
    setMessages([])
    setError(null)
    setDraft('')
    inputRef.current?.focus()
  }

  const canSend = draft.trim().length > 0 && !waiting

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          className="print-hide fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-accent-700 py-3 pl-3 pr-5 text-white shadow-raise transition-colors hover:bg-accent-800"
        >
          <img src="/favicon.svg" alt="" width={26} height={26} className="rounded-md" />
          <span className="text-sm font-extrabold tracking-tight">Ask IQ</span>
        </button>
      )}

      {open && (
        <section
          aria-label="Ask IQ"
          className="print-hide fixed bottom-4 right-4 left-4 z-50 flex h-[min(78dvh,34rem)] flex-col overflow-hidden rounded-card border border-slate-200 bg-white shadow-raise sm:left-auto sm:w-[23rem]"
        >
          <header className="flex items-start gap-3 border-b border-slate-100 bg-accent-50/70 px-4 py-3">
            <img src="/favicon.svg" alt="" width={30} height={30} className="mt-0.5 rounded-md" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold leading-tight tracking-tight text-slate-900">Ask IQ</h2>
              <p className="text-xs text-slate-500">Your business co-pilot</p>
            </div>
            <button
              type="button"
              onClick={clearChat}
              disabled={!messages.length || waiting}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:text-accent-700 disabled:pointer-events-none disabled:opacity-40"
            >
              <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" />
              Clear Chat
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
            >
              <X size={17} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Close Ask IQ</span>
            </button>
          </header>

          <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MessagesSquare size={15} strokeWidth={1.75} className="text-accent-600" aria-hidden="true" />
                  What would you like to know?
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Ask IQ reads your report and gives practical answers in your language. Ask anything about your business—or start with a question below.
                </p>
                <div className="space-y-2 pt-1">
                  {STARTERS.map(question => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => send(question)}
                      disabled={waiting}
                      className="w-full rounded-xl border border-accent-200 bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-accent-800 transition-colors hover:bg-accent-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(message => <Bubble key={message.id} message={message} />)
            )}

            {waiting && (
              <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                Ask IQ is thinking
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mx-4 mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-800"
            >
              {error}
            </p>
          )}

          <form
            onSubmit={event => {
              event.preventDefault()
              send(draft)
            }}
            className="border-t border-slate-100 px-3 py-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    send(draft)
                  }
                }}
                maxLength={1200}
                placeholder="Ask a question…"
                aria-label="Ask IQ question"
                className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {waiting ? (
                  <Loader2 size={18} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowUp size={18} strokeWidth={2.25} aria-hidden="true" />
                )}
                <span className="sr-only">{waiting ? 'Ask IQ is thinking' : 'Send'}</span>
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] leading-relaxed text-slate-400">
              <Sparkles size={11} strokeWidth={1.75} aria-hidden="true" />
              Ask IQ is AI-generated guidance from this report. It never changes your report.
            </p>
          </form>
        </section>
      )}
    </>
  )
}
