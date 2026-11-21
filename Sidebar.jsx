import { Bookmark, History, LayoutDashboard, PlusCircle, Settings, Sparkles, X } from 'lucide-react';
import StatusPill from './StatusPill';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new', label: 'New Research', icon: PlusCircle },
  { id: 'history', label: 'Research History', icon: History, count: 'history' },
  { id: 'saved', label: 'Saved Projects', icon: Bookmark, count: 'saved' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.9)]">
        <Sparkles size={20} className="text-white" />
      </div>
      <div className="leading-tight">
        <p className="font-display text-lg font-bold text-white">
          Research<span className="gradient-text">Mate</span>
        </p>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-500">AI Assistant</p>
      </div>
    </div>
  );
}

export default function Sidebar({ view, onNavigate, counts, health, settings, open, onClose }) {
  return (
    <>
      {/* mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-navy-950/70 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.07] bg-navy-900/95 p-5 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:bg-navy-900/50 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <button className="icon-btn lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5" aria-label="Main">
          {NAV.map(({ id, label, icon: Icon, count }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-violet-500/25 to-blue-500/10 text-white shadow-[inset_0_0_0_1px_rgba(167,139,250,0.3)]'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute -left-5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-400 to-blue-400" />
                )}
                <Icon size={18} className={active ? 'text-violet-300' : 'group-hover:text-violet-300'} />
                <span className="flex-1">{label}</span>
                {count && counts[count] > 0 && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{counts[count]}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="glass-soft mt-4 p-4">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-slate-500">AI Engine</p>
          <StatusPill health={health} settings={settings} />
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {settings.provider === 'ollama'
              ? 'Running locally through Ollama. Your ideas never leave your machine.'
              : 'Using the Gemini API through your backend key.'}
          </p>
        </div>
      </aside>
    </>
  );
}
