import React, { useState, useEffect, useRef } from 'react';
import { subscribePersonal, updatePersonal } from '../../../firebase/admin';
import { useToast } from '../../../components';
import formStyles from '../AdminForms.module.css';

// Extra fields stored on portfolio/personal beyond the core Profile editor.
// `languages` is an array in Firestore; everything else is a plain string.
const FIELDS = [
  { key: 'tagline',        label: 'Tagline',          type: 'text'     },
  { key: 'description',    label: 'Description',      type: 'textarea' },
  { key: 'dateOfBirth',    label: 'Date of birth',    type: 'text'     },
  { key: 'gender',         label: 'Gender',           type: 'text'     },
  { key: 'driversLicense', label: "Driver's license", type: 'text'     },
  { key: 'languages',      label: 'Languages',        type: 'tags'     },
  { key: 'faith',          label: 'Faith',            type: 'text'     },
];

const buildForm = (d = {}) => {
  const f = {};
  FIELDS.forEach(({ key, type }) => {
    if (type === 'tags') f[key] = Array.isArray(d[key]) ? d[key].join(', ') : (d[key] ?? '');
    else                 f[key] = d[key] ?? '';
  });
  return f;
};

const PersonalDetailsSection = () => {
  const { showToast } = useToast();
  const [form, setForm]     = useState(() => buildForm({}));
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    // Don't overwrite in-progress edits when our own save echoes back.
    return subscribePersonal(
      (d) => { if (!dirtyRef.current) setForm(buildForm(d)); },
      () => showToast('error', 'Error', 'Failed to load personal details'),
    );
  }, [showToast]);

  const set = (key, value) => {
    dirtyRef.current = true;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      FIELDS.forEach(({ key, type }) => {
        payload[key] = type === 'tags'
          ? form[key].split(',').map(s => s.trim()).filter(Boolean)
          : form[key];
      });
      await updatePersonal(payload); // merge:true - leaves other personal fields intact
      dirtyRef.current = false;
      showToast('success', 'Saved', 'Personal details updated');
    } catch {
      showToast('error', 'Error', 'Failed to save personal details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={formStyles.grid}>
        {FIELDS.map(f => (
          <div key={f.key} className="input-container">
            <label htmlFor={`pd-${f.key}`}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                id={`pd-${f.key}`}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                rows={4}
              />
            ) : (
              <input
                id={`pd-${f.key}`}
                type="text"
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.type === 'tags' ? 'Comma-separated…' : undefined}
              />
            )}
          </div>
        ))}
      </div>

      <div className={formStyles.actions}>
        <button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Personal Details'}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetailsSection;
