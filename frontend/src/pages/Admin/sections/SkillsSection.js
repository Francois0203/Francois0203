import React, { useState, useEffect, useRef } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { subscribeSkills, updateSkills } from '../../../firebase/admin';
import { useToast, KebabMenu } from '../../../components';
import { SortableList, DragHandle, withIds, stripIds } from './Sortable';
import TagInput from './TagInput';
import useUnsaved from './useUnsaved';
import { ListSkeleton } from './Skeletons';
import formStyles from '../AdminForms.module.css';

// Items may be plain strings or objects like {name, color, category, icon}
const itemName = (item) =>
  item !== null && typeof item === 'object' ? (item.name ?? '') : String(item ?? '');

// Keeps any extra fields on an item whose name did not change.
const fromNames = (names, existing = []) =>
  names.map(n => existing.find(it => itemName(it) === n) ?? n);

const SkillsSection = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [loaded, setLoaded]         = useState(false);
  const [dirty, setDirty]           = useState(false);
  const [newCat, setNewCat]         = useState('');
  const [newItems, setNewItems]     = useState([]);
  const dirtyRef = useRef(false);
  useUnsaved(dirty);

  useEffect(() => {
    // An incoming snapshot never overwrites edits that are not saved yet.
    return subscribeSkills(
      data => { if (!dirtyRef.current) setCategories(withIds(data.categories ?? [])); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load skills'); },
    );
  }, [toast]);

  const change = (updater) => {
    dirtyRef.current = true;
    setDirty(true);
    setCategories(updater);
  };

  const setCat = (i, patch) => change(prev => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const save = async () => {
    const blank = categories.find(c => !String(c.name ?? '').trim());
    if (blank) { toast.warning('Every group needs a name.'); return; }
    setSaving(true);
    try {
      await updateSkills(stripIds(categories.map(c => ({ ...c, name: c.name.trim() }))));
      dirtyRef.current = false;
      setDirty(false);
      toast.success('Skills updated');
    } catch {
      toast.error('Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const name = newCat.trim();
    if (!name) { toast.warning('Give the new group a name.'); return; }
    change(prev => [...prev, ...withIds([{ name, items: newItems }])]);
    setNewCat('');
    setNewItems([]);
  };

  const removeCategory = (i) => {
    if (!window.confirm('Remove this group and all its skills?')) return;
    change(prev => prev.filter((_, idx) => idx !== i));
  };

  if (!loaded) return <ListSkeleton />;

  return (
    <div>
      <SortableList
        items={categories}
        getId={c => c._id}
        onReorder={next => change(() => next)}
        itemClassName={formStyles.card}
      >
        {(cat, i, handle) => (
        <>
          <div className={formStyles.cardHeader}>
            <DragHandle {...handle} label={`Move group ${cat.name}`} />
            <input
              className={formStyles.titleInput}
              value={cat.name ?? ''}
              onChange={e => setCat(i, { name: e.target.value })}
              aria-label="Group name"
              placeholder="Group name"
            />
            <KebabMenu
              ariaLabel={`Options for ${cat.name}`}
              items={[{ label: 'Remove group', icon: <MdDeleteOutline />, danger: true, onSelect: () => removeCategory(i) }]}
            />
          </div>
          <TagInput
            id={`skills-${cat._id}`}
            value={(cat.items ?? []).map(itemName)}
            onChange={names => setCat(i, { items: fromNames(names, cat.items) })}
            placeholder="Add a skill, e.g. Docker"
            hint={i === 0}
          />
          <label className={formStyles.toggleRow} style={{ marginTop: 'var(--spacing-sm)', marginBottom: 0 }}>
            <input
              type="checkbox"
              checked={cat.showOnCv !== false}
              onChange={e => setCat(i, { showOnCv: e.target.checked })}
            />
            <span><strong>Show this group on the printed CV</strong></span>
          </label>
        </>
        )}
      </SortableList>

      <div className={formStyles.inlineAdd} style={{ display: 'block' }}>
        <p className={formStyles.cardTitle} style={{ marginBottom: 'var(--spacing-sm)' }}>Add a group</p>
        <div className="input-container">
          <label htmlFor="skills-new-name">Group name</label>
          <input
            id="skills-new-name"
            type="text"
            placeholder="e.g. Cloud"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
        </div>
        <div className="input-container">
          <label htmlFor="skills-new-items">Skills in it (optional)</label>
          <TagInput id="skills-new-items" value={newItems} onChange={setNewItems} placeholder="e.g. AWS, Terraform" hint={false} />
        </div>
        <button type="button" className="btn-primary" onClick={addCategory}><MdAdd aria-hidden="true" /> Add group</button>
      </div>

      <div className={formStyles.actions}>
        {dirty && <span className={formStyles.unsaved} role="status">Unsaved changes</span>}
        <button type="submit" className="btn-save" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save Skills'}
        </button>
      </div>
    </div>
  );
};

export default SkillsSection;
