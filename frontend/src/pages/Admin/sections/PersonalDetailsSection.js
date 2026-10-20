import React, { useState, useEffect, useRef } from 'react';
import { subscribePersonal, updatePersonal } from '../../../firebase/admin';
import { useToast } from '../../../components';
import TagInput from './TagInput';
import useUnsaved from './useUnsaved';
import { FormSkeleton } from './Skeletons';
import formStyles from '../AdminForms.module.css';

const FIELDS = [
  { key: 'tagline',        label: 'Tagline',          type: 'text'     },
  { key: 'description',    label: 'Description',      type: 'textarea' },
  { key: 'dateOfBirth',    label: 'Date of birth',    type: 'text'     },
  { key: 'gender',         label: 'Gender',           type: 'text'     },
  { key: 'driversLicense', label: "Driver's license", type: 'text'     },
  { key: 'faith',          label: 'Faith',            type: 'text'     },
  { key: 'languages',      label: 'Languages',        type: 'tags'     },
  { key: 'cvLanguages',    label: 'Show languages on the printed CV', type: 'toggle' },
];

// List entries may be stored as plain strings or as {name} objects.
const label = (v) => (typeof v === 'string' ? v : v?.name ?? v?.title ?? '');

const buildForm = (d = {}) => {
  const f = {};
  FIELDS.forEach(({ key, type }) => {
    if (type === 'toggle')    f[key] = d[key] !== false;
    else if (type === 'tags') f[key] = Array.isArray(d[key]) ? d[key].map(label).filter(Boolean) : String(d[key] ?? '').split(',').map(s => s.trim()).filter(Boolean);
    else                      f[key] = d[key] ?? '';
  });
  return f;
};

const PersonalDetailsSection = () => {
  const { toast } = useToast();
  const [form, setForm]     = useState(() => buildForm({}));
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty]   = useState(false);
  const dirtyRef = useRef(false);
  useUnsaved(dirty);

  useEffect(() => {
    // Don't overwrite in-progress edits when our own save echoes back.
    return subscribePersonal(
      (d) => { if (!dirtyRef.current) setForm(buildForm(d)); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load personal details'); },
    );
  }, [toast]);

  const set = (key, value) => {
    dirtyRef.current = true;
    setDirty(true);
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      FIELDS.forEach(({ key, type }) => {
        if (type === 'toggle') payload[key] = Boolean(form[key]);
        else if (type === 'tags') payload[key] = form[key];
        else payload[key] = form[key];
      });
      await updatePersonal(payload); // keeps the other fields
      dirtyRef.current = false;
      setDirty(false);
      toast.success('Personal details updated');
    } catch {
      toast.error('Failed to save personal details');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <FormSkeleton />;

  return (
    <div>
      <div className={formStyles.grid}>
        {FIELDS.map(f => f.type === 'toggle' ? (
          <label key={f.key} className={formStyles.toggleRow} style={{ gridColumn: '1 / -1' }}>
            <input
              type="checkbox"
              checked={Boolean(form[f.key])}
              onChange={e => set(f.key, e.target.checked)}
            />
            <span><strong>{f.label}</strong></span>
          </label>
        ) : (
          <div key={f.key} className="input-container">
            <label htmlFor={`pd-${f.key}`}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                id={`pd-${f.key}`}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                rows={4}
              />
            ) : f.type === 'tags' ? (
              <TagInput id={`pd-${f.key}`} value={form[f.key]} onChange={v => set(f.key, v)} placeholder="Add a language, e.g. Afrikaans" hint={false} />
            ) : (
              <input
                id={`pd-${f.key}`}
                type="text"
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className={formStyles.actions}>
        {dirty && <span className={formStyles.unsaved} role="status">Unsaved changes</span>}
        <button type="submit" className="btn-save" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save Personal Details'}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetailsSection;
