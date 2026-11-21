import { History as HistoryIcon, Trash } from 'lucide-react';
import ProjectList from '../components/ProjectList';

export default function History({ items, onOpen, onToggleSave, onDelete, onClearAll, notify }) {
  return (
    <ProjectList
      heading="Research History"
      subtitle="Every research proposal you generate is stored here, in this browser."
      items={items}
      emptyIcon={HistoryIcon}
      emptyText="Nothing here yet. Generate your first research proposal and it will appear in your history."
      onOpen={onOpen}
      onToggleSave={onToggleSave}
      onDelete={onDelete}
      notify={notify}
      headerAction={
        items.length > 0 && (
          <button
            className="btn-danger"
            onClick={() => window.confirm('Delete your entire research history? This cannot be undone.') && onClearAll()}
          >
            <Trash size={15} /> Clear history
          </button>
        )
      }
    />
  );
}
