import { useState, useEffect, useRef } from 'react';
import { subscribePersonal, updatePersonal } from '../../../../firebase/admin';
import { useToast } from '../../../../components';
import TagInput from '../../parts/TagInput';
import useUnsaved from '../../hooks/useUnsaved';
import { FormSkeleton } from '../../parts/Skeletons';
import Button from '../../../../components/Button';
import useAsyncAction from '../../../../hooks/useAsyncAction';
import SaveBar from '../../parts/SaveBar';
import formStyles from '../../AdminForms.module.css';
import styles from './PersonalDetailsSection.module.css';

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
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty]   = useState(false);
  const dirtyRef = useRef(false);
  useUnsaved(dirty);

  useEffect(() => {
    // Unsaved edits are never overwritten by an incoming snapshot.
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

  const save = useAsyncAction(async () => {
    try {
      const payload = {};
      FIELDS.forEach(({ key, type }) => {
        if (type === 'toggle') payload[key] = Boolean(form[key]);
        else if (type === 'tags') payload[key] = form[key];
        else payload[key] = form[key];
      });
      await updatePersonal(payload);
      dirtyRef.current = false;
      setDirty(false);
      toast.success('Personal details updated');
    } catch (err) {
      toast.error('Failed to save personal details');
      throw err;
    }
  });


  if (!loaded) return <FormSkeleton />;

  return (
    <div className={styles.root}>
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

      <SaveBar save={save} dirty={dirty} label="Save personal details" />
    </div>
  );
};

export default PersonalDetailsSection;
