import { Cloud, Download, HardDrive, RefreshCw, Server } from 'lucide-react';
import StatusPill from '../components/StatusPill';

function Row({ ok, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className={`truncate text-right font-medium ${ok === false ? 'text-rose-300' : ok ? 'text-emerald-300' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}

export default function Settings({ settings, setSettings, health, onRefreshHealth, history, notify }) {
  const checking = health.state === 'checking';
  const ollama = health.ollama;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'researchmate-history.json';
    a.click();
    URL.revokeObjectURL(url);
    notify('History exported');
  };

  const providers = [
    { id: 'ollama', icon: HardDrive, title: 'Ollama (local)', text: 'Private and offline. Runs llama3.2 on your computer.' },
    { id: 'gemini', icon: Cloud, title: 'Gemini API', text: 'Optional cloud model. Needs GEMINI_API_KEY in backend/.env.' },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Settings</h1>
        <p className="mt-2 text-slate-400">Choose your AI engine and manage your data.</p>
      </div>

      {/* Provider */}
      <section className="glass animate-fade-up p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Server size={18} className="text-violet-300" /> AI engine
        </h2>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
          {providers.map(({ id, icon: Icon, title, text }) => {
            const active = settings.provider === id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={active}
                onClick={() => setSettings({ ...settings, provider: id })}
                className={`rounded-2xl border p-4 text-left transition duration-200 ${
                  active ? 'border-violet-400/60 bg-violet-500/10 shadow-[0_0_30px_-10px_rgba(139,92,246,0.8)]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                <Icon size={20} className={active ? 'text-violet-300' : 'text-slate-400'} />
                <p className="mt-3 font-display font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="om" className="label">Ollama model</label>
            <input id="om" className="input-field" value={settings.ollamaModel} onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })} placeholder="llama3.2" />
          </div>
          <div>
            <label htmlFor="gm" className="label">Gemini model</label>
            <input id="gm" className="input-field" value={settings.geminiModel} onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })} placeholder="gemini-2.0-flash" />
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="glass animate-fade-up p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-white">Connection status</h2>
          <button className="btn-ghost !py-2" onClick={onRefreshHealth} disabled={checking}>
            <RefreshCw size={15} className={checking ? 'animate-spin' : ''} /> Re-check
          </button>
        </div>
        <div className="mb-3"><StatusPill health={health} settings={settings} /></div>
        {health.state === 'offline' ? (
          <p className="text-sm text-rose-300">
            Backend not reachable. Run <code className="rounded bg-white/10 px-1.5 py-0.5">uvicorn main:app --reload --port 8000</code> in the backend folder.
          </p>
        ) : (
          <div>
            <Row label="Ollama server" ok={ollama?.reachable} value={ollama?.reachable ? `Running (${ollama.url})` : 'Not running'} />
            <Row label={`Model “${settings.ollamaModel}”`} ok={ollama?.reachable ? ollama.installed_models?.some((m) => m === settings.ollamaModel || m === `${settings.ollamaModel}:latest`) : undefined} value={
              !ollama?.reachable ? 'Unknown' : ollama.installed_models?.some((m) => m === settings.ollamaModel || m === `${settings.ollamaModel}:latest`) ? 'Installed' : `Missing - run: ollama pull ${settings.ollamaModel}`
            } />
            <Row label="Installed models" value={ollama?.installed_models?.length ? ollama.installed_models.join(', ') : '-'} />
            <Row label="Gemini API key" ok={health.gemini?.configured} value={health.gemini?.configured ? 'Configured' : 'Not set (optional)'} />
          </div>
        )}
      </section>

      {/* Data */}
      <section className="glass animate-fade-up p-6">
        <h2 className="mb-1 font-display text-lg font-semibold text-white">Your data</h2>
        <p className="mb-4 text-sm text-slate-400">
          Projects are stored only in this browser (localStorage). You have {history.length} project{history.length === 1 ? '' : 's'}.
        </p>
        <button className="btn-ghost" onClick={exportData} disabled={!history.length}>
          <Download size={15} /> Export history as JSON
        </button>
      </section>
    </div>
  );
}
