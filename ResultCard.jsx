import { useState } from 'react';
import { Check, Copy, Download, RefreshCw } from 'lucide-react';
import IconButton from './IconButton';

const ACCENTS = {
  violet: 'from-violet-500 to-indigo-500',
  blue: 'from-blue-500 to-sky-400',
  cyan: 'from-cyan-400 to-teal-400',
  indigo: 'from-indigo-500 to-violet-500',
  fuchsia: 'from-fuchsia-500 to-violet-500',
};

export default function ResultCard({
  icon: Icon,
  title,
  badge,
  accent = 'violet',
  onCopy,
  onRegenerate,
  onDownload,
  loading = false,
  delay = 0,
  className = '',
  children,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await onCopy()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <section
      className={`glass card-hover relative animate-fade-up overflow-hidden p-5 sm:p-6 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${ACCENTS[accent]} shadow-lg shadow-indigo-900/40`}>
            <Icon size={19} className="text-white" />
          </span>
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={copied ? Check : Copy} label={`Copy ${title}`} onClick={handleCopy} active={copied} />
          {onRegenerate && (
            <IconButton icon={RefreshCw} label={`Regenerate ${title}`} onClick={onRegenerate} disabled={loading} spin={loading} />
          )}
          {onDownload && <IconButton icon={Download} label={`Download ${title} as PDF`} onClick={onDownload} />}
        </div>
      </header>

      <div className={`transition duration-300 ${loading ? 'pointer-events-none select-none opacity-30 blur-[2px]' : ''}`}>
        {children}
      </div>

      {loading && (
        <div className="absolute inset-x-6 top-20 space-y-3" aria-hidden>
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      )}
    </section>
  );
}
