import React, { useState, useEffect } from 'react';
import { subscribeInterests, updateInterests } from '../../../firebase/admin';
import { useToast } from '../../../components';
import formStyles from '../AdminForms.module.css';

const InterestsSection = () => {
  const { showToast } = useToast();
  const [items, setItems]   = useState([]);
  const [input, setInput]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return subscribeInterests(
      data => setItems(data),
      () => showToast('error', 'Error', 'Failed to load interests'),
    );
  }, [showToast]);

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
      await updateInterests(items);
      showToast('success', 'Saved', 'Interests updated');
    } catch {
      showToast('error', 'Error', 'Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={formStyles.chips}>
        {items.map(item => (
          <span key={item} className={formStyles.chipRemovable}>
            {item}
            <button onClick={() => remove(item)} aria-label={`Remove ${item}`}>×</button>
          </span>
        ))}
      </div>

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
        <button type="button" className="btn-outline" onClick={add}>Add</button>
      </div>

      <div className={formStyles.actions}>
        <button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Interests'}
        </button>
      </div>
    </div>
  );
};

export default InterestsSection;
