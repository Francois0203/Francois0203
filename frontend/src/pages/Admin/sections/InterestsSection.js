import React, { useState, useEffect } from 'react';
import { MdAdd } from 'react-icons/md';
import { subscribeInterests, updateInterests, subscribePersonal, updatePersonal } from '../../../firebase/admin';
import { useToast } from '../../../components';
import { SortableList } from './Sortable';
import formStyles from '../AdminForms.module.css';

const InterestsSection = () => {
  const { toast } = useToast();
  const [items, setItems]   = useState([]);
  const [input, setInput]   = useState('');
  const [saving, setSaving] = useState(false);
  const [onCv, setOnCv]     = useState(true);

  useEffect(() => {
    const unsubI = subscribeInterests(
      data => setItems(data),
      () => toast.error('Failed to load interests'),
    );
    // The switch is stored with the personal details, as cvInterests.
    const unsubP = subscribePersonal(d => setOnCv(d?.cvInterests !== false), () => {});
    return () => { unsubI(); unsubP(); };
  }, [toast]);

  const add = () => {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    setItems(prev => [...prev, v]);
    setInput('');
  };

  const remove = (item) => setItems(prev => prev.filter(i => i !== item));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([updateInterests(items), updatePersonal({ cvInterests: onCv })]);
      toast.success('Interests updated');
    } catch {
      toast.error('Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {items.length > 1 && (
        <p className={formStyles.meta} style={{ marginBottom: 'var(--spacing-sm)' }}>
          Drag to change the order, then save.
        </p>
      )}

      <SortableList
        items={items}
        getId={item => item}
        onReorder={setItems}
        layout="wrap"
        className={formStyles.chips}
        itemClassName={formStyles.chipSlot}
      >
        {(item, i, handle) => (
          <span className={formStyles.chipRemovable}>
            <span {...handle} className={formStyles.chipDraggable} aria-label={`Move ${item}`}>{item}</span>
            <button type="button" onClick={() => remove(item)} aria-label={`Remove ${item}`}>×</button>
          </span>
        )}
      </SortableList>

      <div className={formStyles.inlineAdd}>
        <div className="input-container">
          <label>New interest</label>
          <input
            type="text"
            placeholder="e.g. Photography"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
        </div>
        <button type="button" className="btn-primary" onClick={add}><MdAdd aria-hidden="true" /> Add</button>
      </div>

      <label className={formStyles.toggleRow} style={{ marginTop: 'var(--spacing-md)' }}>
        <input type="checkbox" checked={onCv} onChange={e => setOnCv(e.target.checked)} />
        <span><strong>Show interests on the printed CV</strong></span>
      </label>

      <div className={formStyles.actions}>
        <button type="submit" className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Interests'}
        </button>
      </div>
    </div>
  );
};

export default InterestsSection;
