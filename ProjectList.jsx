import { useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Copy, ExternalLink, FileDown, Search, Trash2 } from 'lucide-react';
import IconButton from './IconButton';
import { downloadResearchPdf } from '../services/pdf';
import { copyText, formatDate, fullToText, primaryTitle } from '../services/utils';

export default function ProjectList({ heading, subtitle, items, emptyIcon: EmptyIcon, emptyText, onOpen, onToggleSave, onDelete, notify, headerAction }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      [r.idea, r.domain, ...(r.data.titles || []), ...(r.data.keywords || [])].join(' ').toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{heading}</h1>
          <p className="mt-2 text-slate-400">{subtitle}</p>
        </div>
        {headerAction}
      </div>

      {items.length > 0 && (
        <div className="relative max-w-md animate-fade-up">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas, titles, keywords..."
            className="input-field !pl-11"
            aria-label="Search projects"
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass flex animate-fade-up flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/30 to-blue-500/30">
            <EmptyIcon size={28} className="text-violet-200" />
          </span>
          <p className="max-w-sm text-slate-400">{emptyText}</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-slate-500">No projects match “{query}”.</p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filtered.map((r, i) => (
            <li
              key={r.id}
              className="glass card-hover flex animate-fade-up flex-col gap-4 p-5"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 font-display text-lg font-semibold leading-snug text-white">{primaryTitle(r)}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-400">{r.idea}</p>
                </div>
                {r.saved && <BookmarkCheck size={18} className="mt-1 shrink-0 text-violet-300" />}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="chip">{r.domain}</span>
                <span className="chip">{r.level}</span>
                <span className="chip">{formatDate(r.createdAt)}</span>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2">
                <button className="btn-ghost !py-2" onClick={() => onOpen(r.id)}>
                  <ExternalLink size={15} /> Open
                </button>
                <IconButton
                  icon={r.saved ? BookmarkCheck : Bookmark}
                  label={r.saved ? 'Remove from saved' : 'Save project'}
                  active={r.saved}
                  onClick={() => onToggleSave(r.id)}
                />
                <IconButton
                  icon={Copy}
                  label="Copy all content"
                  onClick={async () => {
                    const ok = await copyText(fullToText(r));
                    notify(ok ? 'Research copied to clipboard' : 'Could not copy.', ok ? 'success' : 'error');
                  }}
                />
                <IconButton icon={FileDown} label="Download PDF" onClick={() => downloadResearchPdf(r)} />
                <div className="flex-1" />
                <IconButton icon={Trash2} label="Delete project" onClick={() => onDelete(r.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
