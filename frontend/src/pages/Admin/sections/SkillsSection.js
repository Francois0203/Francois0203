import React, { useState, useEffect } from 'react';
import { subscribeSkills, updateSkills } from '../../../firebase/admin';
import { useToast } from '../../../components';
import formStyles from '../AdminForms.module.css';

// Items may be plain strings or objects like {name, color, category, icon}
const itemName = (item) =>
  item !== null && typeof item === 'object' ? (item.name ?? '') : String(item ?? '');

const SkillsSection = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [newCat, setNewCat]         = useState('');

  useEffect(() => {
    return subscribeSkills(
      data => setCategories(data.categories ?? []),
      () => showToast('error', 'Error', 'Failed to load skills'),
    );
  }, [showToast]);

  const save = async (cats) => {
    setSaving(true);
    try {
      await updateSkills(cats);
      showToast('success', 'Saved', 'Skills updated');
    } catch {
      showToast('error', 'Error', 'Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const name = newCat.trim();
    if (!name) return;
    setCategories(prev => [...prev, { name, items: [] }]);
    setNewCat('');
  };

  const removeCategory = (i) => {
    if (!window.confirm('Remove this category and all its skills?')) return;
    setCategories(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateItems = (catIdx, raw) => {
    // Incoming edit is comma-separated names. Match against existing objects to
    // preserve {color, icon, category} for skills that still exist; create plain
    // strings for new ones.
    const names = raw.split(',').map(s => s.trim()).filter(Boolean);
    setCategories(prev => prev.map((cat, idx) => {
      if (idx !== catIdx) return cat;
      const existing = cat.items ?? [];
      const items = names.map(n => {
        const match = existing.find(it => itemName(it) === n);
        return match !== undefined ? match : n;
      });
      return { ...cat, items };
    }));
  };

  return (
    <div>
      {categories.map((cat, i) => (
        <div key={i} className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <strong className={formStyles.cardTitle}>{cat.name}</strong>
            <button type="button" className="btn-danger" onClick={() => removeCategory(i)}>Remove</button>
          </div>
          <div className="input-container">
            <label>Skills (comma-separated)</label>
            <input
              type="text"
              value={(cat.items ?? []).map(itemName).join(', ')}
              onChange={e => updateItems(i, e.target.value)}
            />
          </div>
          {(cat.items ?? []).length > 0 && (
            <div className={formStyles.chips}>
              {cat.items.map((item, idx) => (
                <span key={idx} className={formStyles.chip}>{itemName(item)}</span>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className={formStyles.inlineAdd}>
        <div className="input-container">
          <label>New category name</label>
          <input
            type="text"
            placeholder="e.g. Frontend"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
        </div>
        <button type="button" className="btn-outline" onClick={addCategory}>Add Category</button>
      </div>

      <div className={formStyles.actions}>
        <button type="submit" onClick={() => save(categories)} disabled={saving}>
          {saving ? 'Saving…' : 'Save Skills'}
        </button>
      </div>
    </div>
  );
};

export default SkillsSection;
