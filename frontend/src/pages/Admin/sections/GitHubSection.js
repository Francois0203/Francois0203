import React, { useState, useEffect } from 'react';
import { subscribeGitHubProjects, deleteGitHubProject, reorderCollection } from '../../../firebase/admin';
import { MdDeleteOutline, MdOpenInNew } from 'react-icons/md';
import { useToast, KebabMenu } from '../../../components';
import { SortableList, DragHandle } from './Sortable';
import styles from '../Admin.module.css';
import { ListSkeleton } from './Skeletons';
import formStyles from '../AdminForms.module.css';

const GitHubSection = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    return subscribeGitHubProjects(
      (rows) => { setProjects(rows); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load GitHub projects'); },
    );
  }, [toast]);

  const handleReorder = async (next) => {
    const before = projects;
    setProjects(next);
    try {
      await reorderCollection('githubProjects', next.map(p => p.id));
    } catch {
      setProjects(before);
      toast.error('Failed to save the project order');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the portfolio?`)) return;
    try {
      await deleteGitHubProject(id);
      toast.success(`${name} removed`);
    } catch {
      toast.error('Failed to remove project');
    }
  };

  if (!loaded) return <ListSkeleton />;

  return (
    <div>
      <p className={styles.hint}>
        These entries are synced from GitHub. Drag the handle to set the display order, which saves as you drop and survives the next sync, or remove an entry to hide it.
      </p>

      {projects.length === 0 && <p className={styles.empty}>No GitHub projects found.</p>}

      <SortableList
        items={projects}
        getId={p => p.id}
        onReorder={handleReorder}
        itemClassName={formStyles.listRow}
      >
        {(p, i, handle) => (
          <>
            <DragHandle {...handle} label={`Move ${p.name}, position ${i + 1}`} />
            <div className={formStyles.listRowContent}>
              <span className={formStyles.rowTitle}>{p.name}</span>
              <span className={formStyles.rowMeta}>{[p.language, p.stars != null ? `${p.stars} stars` : null].filter(Boolean).join(' · ')}</span>
            </div>
            <KebabMenu
              ariaLabel={`Options for ${p.name}`}
              items={[
                p.url && { label: 'Open on GitHub', icon: <MdOpenInNew />, onSelect: () => window.open(p.url, '_blank', 'noopener') },
                { label: 'Remove', icon: <MdDeleteOutline />, danger: true, onSelect: () => handleDelete(p.id, p.name) },
              ].filter(Boolean)}
            />
          </>
        )}
      </SortableList>
    </div>
  );
};

export default GitHubSection;
