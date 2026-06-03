import React, { useState } from 'react';
import formStyles from '../AdminForms.module.css';

const RecordForm = ({ fields, initial = {}, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(() => {
    const f = {};
    fields.forEach(({ key, type }) => {
      f[key] = type === 'tags'
        ? (initial[key] ?? []).join(', ')
        : String(initial[key] ?? '');
    });
    return f;
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const missing = fields.find(f => f.required && !form[f.key]?.trim());
    if (missing) { alert(`"${missing.label}" is required.`); return; }

    const payload = {};
    fields.forEach(({ key, type }) => {
      if (type === 'tags') {
        payload[key] = form[key].split(',').map(s => s.trim()).filter(Boolean);
      } else if (type === 'number') {
        payload[key] = form[key] !== '' ? Number(form[key]) : undefined;
      } else {
        payload[key] = form[key];
      }
    });
    onSave(payload);
  };

  return (
    <div>
      <div className={formStyles.grid}>
        {fields.map(f => (
          <div key={f.key} className="input-container">
            <label htmlFor={`rf-${f.key}`}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                id={`rf-${f.key}`}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                rows={4}
              />
            ) : (
              <input
                id={`rf-${f.key}`}
                type={f.type === 'number' ? 'number' : 'text'}
                required={f.required}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.type === 'tags' ? 'Comma-separated…' : undefined}
              />
            )}
          </div>
        ))}
      </div>

      <div className={formStyles.actions}>
        <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default RecordForm;
