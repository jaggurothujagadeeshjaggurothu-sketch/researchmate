import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar, { Logo } from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import SavedProjects from './pages/SavedProjects';
import Settings from './pages/Settings';
import { api } from './services/api';
import { loadHistory, loadSettings, saveHistory, saveSettings } from './services/storage';
import { EMPTY_FORM } from './services/utils';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [history, setHistory] = useState(loadHistory);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [settings, setSettings] = useState(loadSettings);
  const [health, setHealth] = useState({ state: 'checking' });
  const [toast, setToast] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => saveHistory(history), [history]);
  useEffect(() => saveSettings(settings), [settings]);

  const notify = useCallback((message, type = 'success') => setToast({ id: Date.now(), message, type }), []);

  const refreshHealth = useCallback(async () => {
    setHealth((h) => ({ ...h, state: 'checking' }));
    try {
      const res = await api.health(settings.ollamaModel);
      setHealth({ ...res, state: 'ok' });
    } catch {
      setHealth({ state: 'offline' });
    }
  }, [settings.ollamaModel]);

  useEffect(() => {
    refreshHealth();
    const t = setInterval(refreshHealth, 30000);
    return () => clearInterval(t);
  }, [refreshHealth]);

  const current = useMemo(() => history.find((r) => r.id === currentId) || null, [history, currentId]);
  const counts = useMemo(() => ({ history: history.length, saved: history.filter((r) => r.saved).length }), [history]);

  /* ---- history operations ---- */
  const createResearch = (research) => {
    setHistory((h) => [research, ...h]);
    setCurrentId(research.id);
  };
  const updateResearch = (id, patch) => setHistory((h) => h.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const toggleSave = (id) => {
    const target = history.find((r) => r.id === id);
    if (!target) return;
    updateResearch(id, { saved: !target.saved });
    notify(target.saved ? 'Removed from saved projects' : 'Project saved');
  };
  const deleteResearch = (id) => {
    setHistory((h) => h.filter((r) => r.id !== id));
    if (currentId === id) setCurrentId(null);
    notify('Project deleted', 'info');
  };

  const clearAll = () => {
    setForm(EMPTY_FORM);
    setCurrentId(null);
    notify('Cleared', 'info');
  };

  const openProject = (id) => {
    const r = history.find((x) => x.id === id);
    if (!r) return;
    setForm({ idea: r.idea, domain: r.domain, tech: r.tech || '', level: r.level });
    setCurrentId(id);
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (id) => {
    if (id === 'new') {
      setForm(EMPTY_FORM);
      setCurrentId(null);
    }
    setView(id);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isGenerator = view === 'dashboard' || view === 'new';
  const listProps = { onOpen: openProject, onToggleSave: toggleSave, onDelete: deleteResearch, notify };

  return (
    <div className="relative flex min-h-screen">
      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <Sidebar view={view} onNavigate={navigate} counts={counts} health={health} settings={settings} open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.07] bg-navy-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Logo />
          <button className="icon-btn" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu size={19} />
          </button>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8 lg:py-12">
          {isGenerator && (
            <Dashboard
              form={form}
              setForm={setForm}
              settings={settings}
              current={current}
              onCreate={createResearch}
              onUpdate={updateResearch}
              onToggleSave={toggleSave}
              onClear={clearAll}
              notify={notify}
            />
          )}
          {view === 'history' && (
            <History items={history} {...listProps} onClearAll={() => { setHistory([]); setCurrentId(null); notify('History cleared', 'info'); }} />
          )}
          {view === 'saved' && <SavedProjects items={history.filter((r) => r.saved)} {...listProps} />}
          {view === 'settings' && (
            <Settings settings={settings} setSettings={setSettings} health={health} onRefreshHealth={refreshHealth} history={history} notify={notify} />
          )}
        </main>
      </div>

      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
