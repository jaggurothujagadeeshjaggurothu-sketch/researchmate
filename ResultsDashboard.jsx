import { AlertTriangle, Bookmark, BookmarkCheck, Copy, FileDown, FileText, Hash, Rocket, Target, Type, Check } from 'lucide-react';
import ResultCard from './ResultCard';
import { downloadResearchPdf } from '../services/pdf';
import { copyText, formatDate, fullToText, sectionToText, wordCount } from '../services/utils';

export default function ResultsDashboard({ research, regenerating, onRegenerate, onToggleSave, onSelectTitle, notify }) {
  const d = research.data;
  const wc = wordCount(d.abstract);
  const wcOk = wc >= 150 && wc <= 200;

  const copySection = async (key, label) => {
    const ok = await copyText(sectionToText(research, key));
    notify(ok ? `${label} copied to clipboard` : 'Could not copy. Please copy manually.', ok ? 'success' : 'error');
    return ok;
  };

  const copyAll = async () => {
    const ok = await copyText(fullToText(research));
    notify(ok ? 'Complete research copied to clipboard' : 'Could not copy. Please copy manually.', ok ? 'success' : 'error');
  };

  const pdf = (sections) => {
    try {
      downloadResearchPdf(research, sections);
    } catch (e) {
      console.error(e);
      notify('Could not create the PDF.', 'error');
    }
  };

  const common = (key, label) => ({
    onCopy: () => copySection(key, label),
    onRegenerate: () => onRegenerate(key),
    onDownload: () => pdf([key]),
    loading: !!regenerating[key],
  });

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="glass flex animate-fade-up flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Research ready</p>
          <p className="mt-1 text-sm text-slate-400">
            {research.domain} · {research.level} · generated {formatDate(research.createdAt)}
            {research.model && <> · {research.provider === 'gemini' ? 'Gemini' : 'Ollama'} {research.model}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="btn-ghost" onClick={copyAll}>
            <Copy size={16} /> Copy all
          </button>
          <button className="btn-ghost" onClick={onToggleSave}>
            {research.saved ? <BookmarkCheck size={16} className="text-violet-300" /> : <Bookmark size={16} />}
            {research.saved ? 'Saved' : 'Save project'}
          </button>
          <button className="btn-glow !px-5 !py-2.5" onClick={() => pdf(undefined)}>
            <FileDown size={17} /> Download Complete Research
          </button>
        </div>
      </div>

      {research.warnings?.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{research.warnings.join('. ')}. Try regenerating the abstract for a better fit.</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Titles */}
        <ResultCard icon={Type} title="Research Title Options" accent="violet" delay={0} className="lg:col-span-2" {...common('titles', 'Titles')}>
          <ul className="space-y-3">
            {d.titles.map((t, i) => {
              const selected = (research.selectedTitle ?? 0) === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onSelectTitle(i)}
                    className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition duration-200 ${
                      selected
                        ? 'border-violet-400/50 bg-violet-500/10 shadow-[0_0_30px_-10px_rgba(139,92,246,0.8)]'
                        : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="num-badge">{i + 1}</span>
                    <span className="flex-1 font-display text-[1.05rem] font-medium leading-snug text-white">{t}</span>
                    {selected && (
                      <span className="chip shrink-0 !border-violet-400/40 !bg-violet-500/20 !text-violet-100">
                        <Check size={12} /> Primary
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Select a title to use it as the main heading of your PDF.</p>
        </ResultCard>

        {/* Abstract */}
        <ResultCard
          icon={FileText}
          title="Abstract"
          accent="blue"
          delay={80}
          className="lg:col-span-2"
          badge={
            <span className={`chip ${wcOk ? '!border-emerald-400/30 !text-emerald-200' : '!border-amber-400/30 !text-amber-200'}`}>
              {wc} words
            </span>
          }
          {...common('abstract', 'Abstract')}
        >
          <p className="text-[0.98rem] leading-[1.85] text-slate-200">{d.abstract}</p>
        </ResultCard>

        {/* Keywords */}
        <ResultCard icon={Hash} title="Keywords" accent="cyan" delay={160} className="lg:col-span-2" {...common('keywords', 'Keywords')}>
          <div className="flex flex-wrap gap-2.5">
            {d.keywords.map((k) => (
              <span key={k} className="keyword-chip">
                {k}
              </span>
            ))}
          </div>
        </ResultCard>

        {/* Objectives */}
        <ResultCard icon={Target} title="Research Objectives" accent="indigo" delay={240} {...common('objectives', 'Objectives')}>
          <ol className="space-y-3">
            {d.objectives.map((o, i) => (
              <li key={i} className="glass-soft flex gap-3 p-4">
                <span className="num-badge">{`O${i + 1}`}</span>
                <span className="text-[0.95rem] leading-relaxed text-slate-200">{o}</span>
              </li>
            ))}
          </ol>
        </ResultCard>

        {/* Future */}
        <ResultCard icon={Rocket} title="Future Enhancements" accent="fuchsia" delay={320} {...common('future_enhancements', 'Future enhancements')}>
          <ol className="space-y-3">
            {d.future_enhancements.map((o, i) => (
              <li key={i} className="glass-soft flex gap-3 p-4">
                <span className="num-badge !from-fuchsia-500 !to-violet-500">{i + 1}</span>
                <span className="text-[0.95rem] leading-relaxed text-slate-200">{o}</span>
              </li>
            ))}
          </ol>
        </ResultCard>
      </div>

      <p className="pb-2 text-center text-xs text-slate-500">
        AI-generated proposals. Methods and outcomes are suggestions, not completed research. Verify before submitting.
      </p>
    </div>
  );
}
