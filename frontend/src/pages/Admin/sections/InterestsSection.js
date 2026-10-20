import React, { useState, useEffect, useRef } from 'react';
import { subscribeInterests, updateInterests, subscribePersonal, updatePersonal } from '../../../firebase/admin';
import { useToast } from '../../../components';
import TagInput from './TagInput';
import useUnsaved from './useUnsaved';
import { FormSkeleton } from './Skeletons';
import formStyles from '../AdminForms.module.css';

const InterestsSection = () => {
  const { toast } = useToast();
  const [items, setItems]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [onCv, setOnCv]     = useState(true);
  const [dirty, setDirty]   = useState(false);
  const dirtyRef = useRef(false);
  useUnsaved(dirty);

  useEffect(() => {
    // An incoming snapshot never overwrites edits that are not saved yet.
    const unsubI = subscribeInterests(
      data => { if (!dirtyRef.current) setItems(data); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load interests'); },
    );
    // The switch is stored with the personal details, as cvInterests.
    const unsubP = subscribePersonal(d => { if (!dirtyRef.current) setOnCv(d?.cvInterests !== false); }, () => {});
    return () => { unsubI(); unsubP(); };
  }, [toast]);

  const touch = () => { dirtyRef.current = true; setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([updateInterests(items), updatePersonal({ cvInterests: onCv })]);
      dirtyRef.current = false;
      setDirty(false);
      toast.success('Interests updated');
    } catch {
      toast.error('Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <FormSkeleton />;

  return (
    <div>
      <div className="input-container">
        <label htmlFor="interests-input">Interests</label>
        <TagInput
          id="interests-input"
          value={items}
          onChange={next => { touch(); setItems(next); }}
          placeholder="Add an interest, e.g. Photography"
        />
      </div>

      <label className={formStyles.toggleRow} style={{ marginTop: 'var(--spacing-md)' }}>
        <input type="checkbox" checked={onCv} onChange={e => { touch(); setOnCv(e.target.checked); }} />
        <span><strong>Show interests on the printed CV</strong></span>
      </label>

      <div className={formStyles.actions}>
        {dirty && <span className={formStyles.unsaved} role="status">Unsaved changes</span>}
        <button type="submit" className="btn-save" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save Interests'}
        </button>
      </div>
    </div>
  );
};

export default InterestsSection;
