import { useRef, useState } from 'react';
import { AlertCircle, BookOpenCheck, FileDown, ListChecks, X, Zap } from 'lucide-react';
import InputCard from '../components/InputCard';
import GeneratingPanel from '../components/GeneratingPanel';
import ResultsDashboard from '../components/ResultsDashboard';
import { api } from '../services/api';
import { errorHint, uid } from '../services/utils';

const FEATURES = [
  { icon: Zap, title: 'Structured in seconds', text: 'Titles, abstract, keywords, objectives and future work from one idea.' },
  { icon: ListChecks, title: 'Validated output', text: 'Every response is checked for exact counts and abstract length.' },
  { icon: FileDown, title: 'Export-ready', text: 'Copy any section or download a formatted PDF of the full proposal.' },
];

export default function Dashboard({ form, setForm, settings, current, onCreate, onUpdate, onToggleSave, onClear, notify }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState({});
  const resultsRef = useRef(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await api.generate(form, settings);
      onCreate({
        id: uid(),
        createdAt: new Date().toISOString(),
        idea: form.idea.trim(),
        domain: form.domain,
        tech: form.tech.trim(),
        level: form.level,
        provider: meta.provider,
        model: meta.model,
        warnings: meta.warnings,
        selectedTitle: 0,
        saved: false,
        data,
      });
      notify('Research generated and added to your history');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch (e) {
      setError({ code: e.code, message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (section) => {
    if (!current) return;
    setRegenerating((r) => ({ ...r, [section]: true }));
    try {
      // Use the project's own inputs so a regenerated section stays consistent with it.
      const projectForm = { idea: current.idea, domain: current.domain, tech: current.tech || '', level: current.level };
      const { data, meta } = await api.regenerate(projectForm, settings, section, current.data);
      onUpdate(current.id, { data: { ...current.data, ...data }, warnings: meta.warnings });
      notify('Section regenerated');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setRegenerating((r) => ({ ...r, [section]: false }));
    }
  };

  const hint = error && errorHint(error.code);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-up">
        <span className="chip mb-4 !border-violet-400/30 !bg-violet-500/10 !text-violet-200">
          <BookOpenCheck size={13} /> Smart Research Assistant
        </span>
        <h1 className="font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
          Turn Your Ideas Into <span className="gradient-text">Research</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-400">Your AI-powered academic research assistant.</p>
      </header>

      <InputCard form={form} setForm={setForm} onSubmit={handleGenerate} onClear={onClear} loading={loading} />

      {error && (
        <div role="alert" className="flex animate-fade-up items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-rose-100">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-300" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{error.message}</p>
            {hint && <code className="mt-2 block overflow-x-auto rounded-lg bg-navy-950/70 px-3 py-2 text-xs text-rose-200">{hint}</code>}
          </div>
          <button className="icon-btn !h-8 !w-8" onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={15} />
          </button>
        </div>
      )}

      <div ref={resultsRef} className="scroll-mt-6">
        {loading ? (
          <GeneratingPanel />
        ) : current ? (
          <ResultsDashboard
            research={current}
            regenerating={regenerating}
            onRegenerate={handleRegenerate}
            onToggleSave={() => onToggleSave(current.id)}
            onSelectTitle={(i) => onUpdate(current.id, { selectedTitle: i })}
            notify={notify}
          />
        ) : (
          !error && (
            <div className="grid gap-4 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }, i) => (
                <div key={title} className="glass card-hover animate-fade-up p-5" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-blue-500/30">
                    <Icon size={20} className="text-violet-200" />
                  </span>
                  <h3 className="font-display font-semibold text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
