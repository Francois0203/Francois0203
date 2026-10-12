import React, { useState, useEffect } from 'react';
import { subscribeGitHubProjects, deleteGitHubProject, reorderCollection } from '../../../firebase/admin';
import { useToast } from '../../../components';
import { SortableList, DragHandle } from './Sortable';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

const GitHubSection = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    return subscribeGitHubProjects(
      setProjects,
      () => toast.error('Failed to load GitHub projects'),
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
              <strong>{p.name}</strong>
              <span className={formStyles.meta}>{[p.language, p.stars != null ? `${p.stars} stars` : null].filter(Boolean).join(' · ')}</span>
            </div>
            <div className={formStyles.listRowActions}>
              <button type="button" className="btn-danger" onClick={() => handleDelete(p.id, p.name)}>Remove</button>
            </div>
          </>
        )}
      </SortableList>
    </div>
  );
};

export default GitHubSection;
