import React, { useState, useEffect } from 'react';
import { subscribeGitHubProjects, updateGitHubProject, deleteGitHubProject } from '../../../firebase/admin';
import { useToast } from '../../../components';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

const GitHubSection = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [editing, setEditing]   = useState({});

  useEffect(() => {
    return subscribeGitHubProjects(
      setProjects,
      () => showToast('error', 'Error', 'Failed to load GitHub projects'),
    );
  }, [showToast]);

  const handleOrderChange = (id, val) =>
    setEditing(prev => ({ ...prev, [id]: val }));

  const saveOrder = async (id) => {
    const val = editing[id];
    if (val === undefined) return;
    try {
      await updateGitHubProject(id, { order: Number(val) });
      showToast('success', 'Saved', 'Order updated');
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch {
      showToast('error', 'Error', 'Failed to update order');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the portfolio?`)) return;
    try {
      await deleteGitHubProject(id);
      showToast('success', 'Removed', `${name} removed`);
    } catch {
      showToast('error', 'Error', 'Failed to remove project');
    }
  };

  return (
    <div>
      <p className={styles.hint}>
        These entries are synced from GitHub. Edit <code>order</code> to control display order, or remove an entry to hide it.
      </p>

      {projects.length === 0 && <p className={styles.empty}>No GitHub projects found.</p>}

      {projects.map(p => (
        <div key={p.id} className={formStyles.listRow}>
          <div className={formStyles.listRowContent}>
            <strong>{p.name}</strong>
            <span className={formStyles.meta}>{[p.language, p.stars != null ? `⭐ ${p.stars}` : null].filter(Boolean).join(' · ')}</span>
          </div>
          <div className={formStyles.listRowActions}>
            <input
              className={formStyles.orderInput}
              type="number"
              value={editing[p.id] !== undefined ? editing[p.id] : (p.order ?? '')}
              onChange={e => handleOrderChange(p.id, e.target.value)}
              placeholder="Order"
              title="Display order"
            />
            {editing[p.id] !== undefined && (
              <button type="submit" onClick={() => saveOrder(p.id)}>Save</button>
            )}
            <button type="button" className="btn-danger" onClick={() => handleDelete(p.id, p.name)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GitHubSection;
