import React, { useState, useEffect, useRef } from 'react';
import { MdRefresh } from 'react-icons/md';
import { subscribeCopy, updateCopy } from '../../../firebase/admin';
import { useToast } from '../../../components';
import { COPY_SCHEMA } from '../../../content/copy';
import styles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';

// Build the working draft: an override value if present, otherwise the in-code
// default - so the editor always shows the text currently on the site.
const buildDraft = (saved = {}) => {
  const d = {};
  for (const group of COPY_SCHEMA) {
    d[group.key] = {};
    for (const f of group.fields) {
      const ov = saved?.[group.key]?.[f.key];
      d[group.key][f.key] = (typeof ov === 'string' && ov !== '') ? ov : f.default;
    }
  }
  return d;
};

// Only persist values that actually differ from the default, so code stays the
// single source of truth for anything untouched.
const buildOverrides = (draft) => {
  const doc = {};
  for (const group of COPY_SCHEMA) {
    const g = {};
    for (const f of group.fields) {
      const val = draft[group.key]?.[f.key] ?? '';
      if (val.trim() !== '' && val !== f.default) g[f.key] = val;
    }
    if (Object.keys(g).length) doc[group.key] = g;
  }
  return doc;
};

const SiteCopySection = () => {
  const { showToast } = useToast();
  const [activeGroup, setActiveGroup] = useState(COPY_SCHEMA[0].key);
  const [draft, setDraft] = useState(() => buildDraft({}));
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    return subscribeCopy(
      (data) => { if (!dirtyRef.current) setDraft(buildDraft(data)); },
      () => showToast('error', 'Error', 'Failed to load site copy'),
    );
  }, [showToast]);

  const set = (groupKey, fieldKey, value) => {
    dirtyRef.current = true;
    setDraft(prev => ({ ...prev, [groupKey]: { ...prev[groupKey], [fieldKey]: value } }));
  };

  const resetField = (groupKey, field) => set(groupKey, field.key, field.default);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCopy(buildOverrides(draft));
      dirtyRef.current = false;
      showToast('success', 'Saved', 'Site copy updated');
    } catch {
      showToast('error', 'Error', 'Failed to save site copy');
    } finally {
      setSaving(false);
    }
  };

  const group = COPY_SCHEMA.find(g => g.key === activeGroup) ?? COPY_SCHEMA[0];

  return (
    <div>
      <p className={styles.empty} style={{ textAlign: 'left', marginTop: 0 }}>
        Edit the headings and narrative text shown across the site. Clear a field to
        restore its original wording.
      </p>

      <nav className={styles.subTabs}>
        {COPY_SCHEMA.map(g => (
          <button
            key={g.key}
            type="button"
            className={`${styles.subTab} ${g.key === activeGroup ? styles.subTabActive : ''}`}
            onClick={() => setActiveGroup(g.key)}
          >
            {g.label}
          </button>
        ))}
      </nav>

      <div className={formStyles.grid}>
        {group.fields.map(f => {
          const value    = draft[group.key]?.[f.key] ?? '';
          const modified = value !== f.default;
          return (
            <div key={f.key} className="input-container">
              <label htmlFor={`copy-${group.key}-${f.key}`}>
                {f.label}
                {modified && (
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => resetField(group.key, f)}
                    title="Reset to original"
                  >
                    <MdRefresh aria-hidden="true" /> reset
                  </button>
                )}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  id={`copy-${group.key}-${f.key}`}
                  value={value}
                  onChange={e => set(group.key, f.key, e.target.value)}
                  rows={3}
                />
              ) : (
                <input
                  id={`copy-${group.key}-${f.key}`}
                  type="text"
                  value={value}
                  onChange={e => set(group.key, f.key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className={formStyles.actions}>
        <button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Site Copy'}
        </button>
      </div>
    </div>
  );
};

export default SiteCopySection;
