import { useEffect, useState } from 'react'
import { BrainCircuit, CheckCircle2 } from 'lucide-react'

const STEPS = [
  'Analyzing your project idea',
  'Crafting academic titles',
  'Writing the abstract',
  'Extracting keywords & objectives',
  'Validating structured output',
]

export default function Loader() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="glass animate-fade-in p-6 sm:p-8" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
          <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-electric-400 border-r-violet-500" />
          <span className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-600/40 to-electric-600/40 blur-md" />
          <BrainCircuit className="relative h-9 w-9 text-white" />
        </div>
        <div className="w-full">
          <p className="font-display text-lg font-semibold text-white">ResearchMate is thinking…</p>
          <ul className="mt-3 space-y-1.5">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={`flex items-center gap-2 text-sm transition-all duration-500 ${
                  i < step ? 'text-emerald-300' : i === step ? 'text-white' : 'text-slate-600'
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full ml-[5px] mr-[5px] ${i === step ? 'animate-pulse bg-electric-400' : 'bg-slate-700'}`} />
                )}
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Running locally - the first request may take longer while the model loads.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 ${i === 1 ? 'md:row-span-1' : ''}`}>
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-11/12" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
