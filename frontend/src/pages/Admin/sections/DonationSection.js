import React, { useState, useEffect } from 'react';
import { subscribeDonation, updateDonation } from '../../../firebase/admin';
import { useToast } from '../../../components';
import formStyles from '../AdminForms.module.css';

// portfolio/donation - the "Support" pill shown on the Connect page.
const FIELDS = [
  { key: 'title',      label: 'Title',       type: 'text',     placeholder: 'Support my work' },
  { key: 'message',    label: 'Message',     type: 'textarea', placeholder: 'A short line shown with the support link' },
  { key: 'link',       label: 'Donation link (URL)', type: 'text', placeholder: 'https://…' },
  { key: 'buttonText', label: 'Button text', type: 'text',     placeholder: 'Buy me a coffee' },
];

const DonationSection = () => {
  const { showToast } = useToast();
  const [data, setData]     = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return subscribeDonation(setData, () => showToast('error', 'Error', 'Failed to load donation settings'));
  }, [showToast]);

  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDonation({
        enabled:    !!data.enabled,
        title:      data.title ?? '',
        message:    data.message ?? '',
        link:       data.link ?? '',
        buttonText: data.buttonText ?? '',
      });
      showToast('success', 'Saved', 'Donation settings updated');
    } catch {
      showToast('error', 'Error', 'Failed to save donation settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <label className={formStyles.toggleRow}>
        <input
          type="checkbox"
          checked={!!data.enabled}
          onChange={e => set('enabled', e.target.checked)}
        />
        <span>
          <strong>Show the support link</strong>
          <span className={formStyles.toggleHint}>
            When off, the “Support” pill is hidden on the Connect page.
          </span>
        </span>
      </label>

      <div className={formStyles.grid}>
        {FIELDS.map(f => (
          <div key={f.key} className="input-container">
            <label htmlFor={`d-${f.key}`}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                id={`d-${f.key}`}
                value={data[f.key] ?? ''}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={3}
              />
            ) : (
              <input
                id={`d-${f.key}`}
                type="text"
                value={data[f.key] ?? ''}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div className={formStyles.actions}>
        <button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Donation'}
        </button>
      </div>
    </div>
  );
};

export default DonationSection;
