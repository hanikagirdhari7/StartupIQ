import { useMemo, useState } from 'react'
import { ClipboardCopy, ListChecks, Printer } from 'lucide-react'
import { saveLaunchKit } from '../../services/storage'
import { buildLaunchKit, buildLaunchKitText, countDone } from '../../utils/launchKit'

// The founder's plan of action, made tickable. Every line here is a string the
// analysis already returned — `nextActions`, the roadmap periods and the
// `marketingRecommendations` — so this card adds no advice of its own, only a way
// to work through it and take it away.
// Completion is saved with the report in this browser, never sent anywhere.

async function writeClipboard(content) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content)
      return true
    }
  } catch {
    // Refused by permissions or an insecure origin — fall through to the
    // selection copy below rather than failing silently.
  }
  try {
    const area = document.createElement('textarea')
    area.value = content
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand('copy')
    area.remove()
    return copied
  } catch {
    return false
  }
}

const BUTTON =
  'print-hide inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors'

export default function LaunchKitCard({ analysis, idea, analyzedAt, reportId, initialChecked }) {
  const kit = useMemo(() => buildLaunchKit(analysis), [analysis])
  const [checked, setChecked] = useState(() =>
    initialChecked && typeof initialChecked === 'object' ? initialChecked : {}
  )
  const [note, setNote] = useState(null)

  const total = kit.items.length
  const done = countDone(kit.items, checked)
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  function toggle(id) {
    const next = { ...checked }
    if (next[id] === true) delete next[id]
    else next[id] = true
    setChecked(next)
    saveLaunchKit(reportId, next)
  }

  async function copy() {
    const copied = await writeClipboard(buildLaunchKitText({ kit, checked, idea, analyzedAt }))
    setNote(
      copied
        ? { tone: 'ok', text: 'Launch Kit copied — paste it wherever you keep your plan.' }
        : { tone: 'bad', text: 'This browser blocked copying. Print the kit instead, or select the text above.' }
    )
  }

  return (
    <section
      aria-labelledby="launch-kit-heading"
      className="launch-kit surface-card p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h3 id="launch-kit-heading" className="flex items-center gap-2.5 card-title">
            <ListChecks size={18} strokeWidth={1.75} className="text-accent-600 shrink-0" aria-hidden="true" />
            Launch Kit
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Every action from this report in one checklist. Tick it off as you go — progress is saved
            on this device.
          </p>
        </div>

        {total > 0 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} className={`${BUTTON} border-slate-200 text-slate-700 hover:bg-slate-50`}>
              <ClipboardCopy size={15} strokeWidth={2} aria-hidden="true" />
              Copy Launch Kit
            </button>
            <button type="button" onClick={() => window.print()} className={`${BUTTON} border-accent-600 bg-accent-600 text-white hover:bg-accent-700`}>
              <Printer size={15} strokeWidth={2} aria-hidden="true" />
              Print Launch Kit
            </button>
          </div>
        )}
      </div>

      {total === 0 ? (
        <p className="mt-5 text-sm text-slate-500 leading-relaxed">
          The analysis returned no steps to check off, so there is nothing here yet.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">
                {done} of {total} done
              </p>
              <p className="text-sm font-semibold text-slate-500">{percent}%</p>
            </div>
            <div aria-hidden="true" className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-accent-600 transition-[width] duration-300" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="mt-7 space-y-7">
            {kit.groups.map(group => {
              const groupDone = countDone(group.items, checked)
              return (
                <div key={group.id} className="min-w-0">
                  <h4 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    {group.title}
                    {' '}
                    <span className="ml-2 normal-case tracking-normal font-semibold text-slate-400">
                      {groupDone} of {group.items.length} done
                    </span>
                  </h4>
                  <ul className="space-y-1">
                    {group.items.map(item => {
                      const isDone = checked[item.id] === true
                      return (
                        <li key={item.id}>
                          <label className="-mx-2 flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => toggle(item.id)}
                              className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 accent-accent-600"
                            />
                            <span
                              className={`leading-relaxed break-words text-pretty ${
                                isDone ? 'text-slate-400 line-through' : 'text-slate-600'
                              }`}
                            >
                              {item.text}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          {note && (
            <p
              role="status"
              className={`print-hide mt-5 text-sm leading-relaxed ${note.tone === 'ok' ? 'text-emerald-700' : 'text-rose-700'}`}
            >
              {note.text}
            </p>
          )}

          <p className="mt-6 text-xs text-slate-400 leading-relaxed">
            These steps come straight from your report — StartupIQ adds no tasks of its own.
          </p>
        </>
      )}
    </section>
  )
}
