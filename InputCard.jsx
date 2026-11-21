import { useState } from 'react';
import { ChevronDown, Cpu, Eraser, Lightbulb, Sparkles, Wand2 } from 'lucide-react';
import { DOMAINS, EXAMPLE_IDEAS, LEVELS } from '../services/utils';

export default function InputCard({ form, setForm, onSubmit, onClear, loading }) {
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const validate = () => {
    const next = {};
    const idea = form.idea.trim();
    if (!idea) next.idea = 'Please describe your project idea.';
    else if (idea.length < 15 || idea.split(/\s+/).length < 3)
      next.idea = 'Add a little more detail (a short sentence or two works best).';
    else if (idea.length > 1500) next.idea = 'Please keep your idea under 1500 characters.';
    if (!form.domain) next.domain = 'Choose a domain.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!loading && validate()) onSubmit();
  };

  return (
    <form onSubmit={submit} className="glass relative overflow-hidden p-5 sm:p-8" noValidate>
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative space-y-6">
        {/* Idea */}
        <div>
          <label htmlFor="idea" className="label">
            <Lightbulb size={14} className="text-violet-300" /> Project idea
          </label>
          <textarea
            id="idea"
            rows={4}
            value={form.idea}
            onChange={set('idea')}
            placeholder="Describe your project idea in 2–3 lines..."
            className={`input-field resize-y leading-relaxed ${errors.idea ? 'has-error' : ''}`}
            disabled={loading}
            maxLength={1500}
            aria-invalid={!!errors.idea}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className={errors.idea ? 'text-rose-300' : 'text-slate-500'}>
              {errors.idea || 'Example: Detect fake news using machine learning.'}
            </span>
            <span className="text-slate-500">{form.idea.length}/1500</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_IDEAS.map((ex) => (
              <button
                type="button"
                key={ex.text}
                disabled={loading}
                onClick={() => setForm({ ...form, idea: ex.text, domain: ex.domain })}
                className="chip transition hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white disabled:opacity-50"
              >
                <Wand2 size={12} className="text-violet-300" />
                {ex.text.length > 44 ? `${ex.text.slice(0, 44)}…` : ex.text}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Domain */}
          <div>
            <label htmlFor="domain" className="label">
              <Cpu size={14} className="text-blue-300" /> Domain
            </label>
            <div className="relative">
              <select
                id="domain"
                value={form.domain}
                onChange={set('domain')}
                disabled={loading}
                className="input-field cursor-pointer appearance-none pr-10"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d} className="bg-navy-900">
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Tech preferences */}
          <div>
            <label htmlFor="tech" className="label">
              <Sparkles size={14} className="text-cyan-300" /> Technology preferences{' '}
              <span className="normal-case tracking-normal text-slate-600">(optional)</span>
            </label>
            <input
              id="tech"
              value={form.tech}
              onChange={set('tech')}
              disabled={loading}
              maxLength={300}
              placeholder="e.g. Python, BERT, React, Raspberry Pi"
              className="input-field"
            />
          </div>
        </div>

        {/* Level */}
        <div>
          <span className="label">Research level</span>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-navy-950/50 p-1.5" role="radiogroup">
            {LEVELS.map((lvl) => {
              const active = form.level === lvl;
              return (
                <button
                  type="button"
                  key={lvl}
                  role="radio"
                  aria-checked={active}
                  disabled={loading}
                  onClick={() => setForm({ ...form, level: lvl })}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-violet-500/80 to-blue-500/80 text-white shadow-[0_6px_20px_-6px_rgba(99,102,241,0.9)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <button type="submit" disabled={loading} className={`btn-glow flex-1 sm:flex-none sm:min-w-[250px] ${loading ? 'is-loading' : ''}`}>
            {loading ? (
              <>
                <span className="spinner" /> Generating research...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Research
              </>
            )}
          </button>
          <button type="button" onClick={() => { setErrors({}); onClear(); }} disabled={loading} className="btn-ghost py-3.5">
            <Eraser size={16} /> Clear all
          </button>
        </div>
      </div>
    </form>
  );
}
