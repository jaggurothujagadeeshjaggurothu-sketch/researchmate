import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const STYLES = {
  success: { icon: CheckCircle2, cls: 'text-emerald-300' },
  error: { icon: AlertCircle, cls: 'text-rose-300' },
  info: { icon: Info, cls: 'text-sky-300' },
};

export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  const { icon: Icon, cls } = STYLES[toast.type] || STYLES.info;

  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-50 sm:right-6" aria-live="polite">
      <div
        key={toast.id}
        className="glass pointer-events-auto flex animate-slide-in items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white"
      >
        <Icon size={18} className={cls} />
        {toast.message}
      </div>
    </div>
  );
}
