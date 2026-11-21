export function describeHealth(health, settings) {
  if (health.state === 'checking' && !health.ollama) return { tone: 'warn', text: 'Checking AI engine...' };
  if (health.state === 'offline') return { tone: 'bad', text: 'Backend offline' };

  if (settings.provider === 'gemini') {
    return health.gemini?.configured
      ? { tone: 'good', text: `Gemini · ${settings.geminiModel}` }
      : { tone: 'bad', text: 'Gemini key missing' };
  }
  if (!health.ollama?.reachable) return { tone: 'bad', text: 'Ollama not running' };
  const installed = [settings.ollamaModel, `${settings.ollamaModel}:latest`].some((m) =>
    health.ollama.installed_models?.includes(m)
  );
  if (!installed) return { tone: 'warn', text: `Model ${settings.ollamaModel} missing` };
  return { tone: 'good', text: `Ollama · ${settings.ollamaModel}` };
}

const TONES = {
  good: { dot: 'bg-emerald-400', ring: 'bg-emerald-400/60', text: 'text-emerald-200' },
  warn: { dot: 'bg-amber-400', ring: 'bg-amber-400/60', text: 'text-amber-200' },
  bad: { dot: 'bg-rose-400', ring: 'bg-rose-400/60', text: 'text-rose-200' },
};

export default function StatusPill({ health, settings }) {
  const { tone, text } = describeHealth(health, settings);
  const t = TONES[tone];
  return (
    <div className="flex items-center gap-2.5" role="status">
      <span className="relative flex h-2.5 w-2.5">
        {tone === 'good' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${t.ring}`} />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${t.dot}`} />
      </span>
      <span className={`truncate text-sm font-medium ${t.text}`}>{text}</span>
    </div>
  );
}
