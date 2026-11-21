import { useEffect, useState } from 'react';

const STEPS = [
  'Analyzing your project idea',
  'Crafting academic titles',
  'Drafting the abstract',
  'Extracting research keywords',
  'Defining measurable objectives',
  'Exploring future enhancements',
  'Validating the output',
];

export default function GeneratingPanel() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-5" role="status" aria-live="polite">
      <div className="glass flex flex-col items-center gap-6 px-6 py-10 text-center animate-fade-up">
        <div className="orb" />
        <div>
          <p key={step} className="animate-pop font-display text-xl font-semibold text-white">
            {STEPS[step]}...
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Your local model is writing. This usually takes 15–60 seconds.
          </p>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? 'w-7 bg-gradient-to-r from-violet-400 to-blue-400' : 'w-3 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="glass space-y-4 p-6">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
