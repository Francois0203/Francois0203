import React, { useState, useEffect } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { subscribeSkills, updateSkills } from '../../../firebase/admin';
import { useToast, KebabMenu } from '../../../components';
import { SortableList, DragHandle, withIds, stripIds } from './Sortable';
import formStyles from '../AdminForms.module.css';

// Items may be plain strings or objects like {name, color, category, icon}
const itemName = (item) =>
  item !== null && typeof item === 'object' ? (item.name ?? '') : String(item ?? '');

// The index only matters if two names match.
const itemIds = (items) => {
  const seen = new Map();
  return items.map((it) => {
    const n = itemName(it);
    const k = seen.get(n) ?? 0;
    seen.set(n, k + 1);
    return k ? `${n}#${k}` : n;
  });
};

const ChipOrder = ({ items, onReorder }) => {
  const ids = itemIds(items);
  return (
    <SortableList
      items={items}
      getId={(it, i) => ids[i]}
      onReorder={onReorder}
      layout="wrap"
      className={formStyles.chips}
      itemClassName={formStyles.chipSlot}
    >
      {(item, idx, handle) => (
        <span
          {...handle}
          className={`${formStyles.chip} ${formStyles.chipDraggable}`}
          aria-label={`Move ${itemName(item)}`}
        >
          {itemName(item)}
        </span>
      )}
    </SortableList>
  );
};

const SkillsSection = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [newCat, setNewCat]         = useState('');

  useEffect(() => {
    return subscribeSkills(
      data => setCategories(withIds(data.categories ?? [])),
      () => toast.error('Failed to load skills'),
    );
  }, [toast]);

  const save = async (cats) => {
    setSaving(true);
    try {
      await updateSkills(stripIds(cats));
      toast.success('Skills updated');
    } catch {
      toast.error('Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const name = newCat.trim();
    if (!name) return;
    setCategories(prev => [...prev, ...withIds([{ name, items: [] }])]);
    setNewCat('');
  };

  const removeCategory = (i) => {
    if (!window.confirm('Remove this category and all its skills?')) return;
    setCategories(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateItems = (catIdx, raw) => {
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

  const reorderItems = (catIdx, items) =>
    setCategories(prev => prev.map((cat, idx) => (idx === catIdx ? { ...cat, items } : cat)));

  return (
    <div>
      {categories.length > 1 && (
        <p className={formStyles.meta} style={{ marginBottom: 'var(--spacing-md)' }}>
          Drag a category or a skill to change the order, then save.
        </p>
      )}

      <SortableList
        items={categories}
        getId={c => c._id}
        onReorder={setCategories}
        itemClassName={formStyles.card}
      >
        {(cat, i, handle) => (
        <>
          <div className={formStyles.cardHeader}>
            <DragHandle {...handle} label={`Move category ${cat.name}`} />
            <strong className={formStyles.cardTitle}>{cat.name}</strong>
            <KebabMenu
              ariaLabel={`Options for ${cat.name}`}
              items={[{ label: 'Remove group', icon: <MdDeleteOutline />, danger: true, onSelect: () => removeCategory(i) }]}
            />
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
            <ChipOrder items={cat.items} onReorder={items => reorderItems(i, items)} />
          )}
          <label className={formStyles.toggleRow}>
            <input
              type="checkbox"
              checked={cat.showOnCv !== false}
              onChange={e => setCategories(prev => prev.map((c, idx) => (idx === i ? { ...c, showOnCv: e.target.checked } : c)))}
            />
            <span><strong>Show this group on the printed CV</strong></span>
          </label>
        </>
        )}
      </SortableList>

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
        <button type="button" className="btn-primary" onClick={addCategory}><MdAdd aria-hidden="true" /> Add group</button>
      </div>

      <div className={formStyles.actions}>
        <button type="submit" className="btn-save" onClick={() => save(categories)} disabled={saving}>
          {saving ? 'Saving…' : 'Save Skills'}
        </button>
      </div>
    </div>
  );
};

export default SkillsSection;
