import { Bookmark } from 'lucide-react';
import ProjectList from '../components/ProjectList';

export default function SavedProjects({ items, onOpen, onToggleSave, onDelete, notify }) {
  return (
    <ProjectList
      heading="Saved Projects"
      subtitle="Your favourite research proposals, kept one click away."
      items={items}
      emptyIcon={Bookmark}
      emptyText="No saved projects yet. Press “Save project” on any generated research to keep it here."
      onOpen={onOpen}
      onToggleSave={onToggleSave}
      onDelete={onDelete}
      notify={notify}
    />
  );
}
