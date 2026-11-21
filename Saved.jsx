import { Bookmark } from 'lucide-react'
import ProjectList from '../components/ProjectList'

export default function Saved({ items, onOpen, onDelete, onNew }) {
  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="font-display text-3xl font-bold text-white">Saved Projects</h1>
        <p className="mt-2 text-slate-400">Proposals you bookmarked - kept even if you clear your history.</p>
      </header>
      <ProjectList
        items={items}
        onOpen={onOpen}
        onDelete={onDelete}
        empty={{
          icon: <Bookmark className="h-6 w-6" />,
          title: 'Nothing saved yet',
          text: 'Use "Save project" on any generated result to keep it here.',
          action: <button className="btn-glow mt-2 !py-2.5 text-sm" onClick={onNew}>Start new research</button>,
        }}
      />
    </div>
  )
}
