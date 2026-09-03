// Where the figures on a report came from.
//
// A report mixes three kinds of number, and reading an AI guess as a fact the
// founder entered is the mistake this label exists to prevent. Only three tones
// exist because only three sources exist: the founder typed it, the analysis
// estimated it, or this page worked it out from the fields above. Nothing here
// decides what is true — each card passes the label that already describes it.

const SOURCES = {
  user: {
    label: 'You entered this',
    classes: 'border-slate-300 bg-white text-slate-700',
  },
  ai: {
    label: 'AI estimate',
    classes: 'border-accent-100 bg-accent-50 text-accent-600',
  },
  calculated: {
    label: 'Calculated on this page',
    classes: 'border-slate-200 bg-slate-50 text-slate-600',
  },
}

export default function SourceTag({ source }) {
  const entry = SOURCES[source] || SOURCES.ai

  return (
    <span className={`shrink-0 border rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${entry.classes}`}>
      {entry.label}
    </span>
  )
}
