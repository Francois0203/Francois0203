import React, { useState } from 'react';
import { useToast } from '../../../components';
import TagInput from './TagInput';
import formStyles from '../AdminForms.module.css';

const RecordForm = ({ fields, initial = {}, onSave, onCancel, saving }) => {
  const { toast } = useToast();
  const [form, setForm] = useState(() => {
    const f = {};
    fields.forEach(({ key, type, default: fallback }) => {
      if (type === 'toggle') f[key] = initial[key] ?? fallback ?? false;
      else if (type === 'tags') f[key] = (initial[key] ?? []).map(v => (typeof v === 'string' ? v : v?.name ?? '')).filter(Boolean);
      else f[key] = String(initial[key] ?? '');
    });
    return f;
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const missing = fields.find(f => f.required && !String(form[f.key] ?? '').trim());
    if (missing) {
      toast.warning(`"${missing.label}" is required.`);
      document.getElementById(`rf-${missing.key}`)?.focus();
      return;
    }

    const payload = {};
    fields.forEach(({ key, type }) => {
      if (type === 'toggle') {
        payload[key] = Boolean(form[key]);
      } else if (type === 'tags') {
        payload[key] = form[key];
      } else if (type === 'number') {
        payload[key] = form[key] !== '' ? Number(form[key]) : undefined;
      } else {
        payload[key] = form[key];
      }
    });
    onSave(payload);
  };

  return (
    <div className="admin-ui">
      <div className={formStyles.grid}>
        {fields.map(f => f.type === 'toggle' ? (
          <label key={f.key} className={formStyles.toggleRow} style={{ gridColumn: '1 / -1' }}>
            <input
              id={`rf-${f.key}`}
              type="checkbox"
              checked={Boolean(form[f.key])}
              onChange={e => set(f.key, e.target.checked)}
            />
            <span>
              <strong>{f.label}</strong>
              {f.hint && <span className={formStyles.toggleHint}>{f.hint}</span>}
            </span>
          </label>
        ) : (
          <div key={f.key} className="input-container">
            <label htmlFor={`rf-${f.key}`}>{f.label}</label>
            {f.type === 'select' ? (
              <select
                id={`rf-${f.key}`}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
              >
                <option value="">Not set</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                id={`rf-${f.key}`}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                rows={4}
              />
            ) : f.type === 'tags' ? (
              <TagInput id={`rf-${f.key}`} value={form[f.key]} onChange={v => set(f.key, v)} placeholder={f.placeholder ?? 'Add a tag, e.g. React'} hint={false} />
            ) : (
              <input
                id={`rf-${f.key}`}
                type={f.type === 'number' ? 'number' : 'text'}
                required={f.required}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className={formStyles.formActions}>
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default RecordForm;
