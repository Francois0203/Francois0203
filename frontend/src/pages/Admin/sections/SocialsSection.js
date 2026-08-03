import React, { useState, useEffect } from 'react';
import { subscribeSocial, updateSocial } from '../../../firebase/admin';
import { useToast, SearchableDropdown } from '../../../components';
import formStyles from '../AdminForms.module.css';

const PLATFORMS = [
  'github', 'linkedin', 'instagram', 'facebook',
  'twitter', 'behance', 'dribbble', 'youtube',
  'tiktok', 'whatsapp', 'email',
];

const PLATFORM_OPTIONS = PLATFORMS.map(pl => ({
  value: pl,
  label: pl.charAt(0).toUpperCase() + pl.slice(1),
}));

const platformOption = (key) =>
  PLATFORM_OPTIONS.find(o => o.value === key) ?? null;

const SocialsSection = () => {
  const { showToast } = useToast();
  const [platforms, setPlatforms] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [newKey, setNewKey]       = useState('github');
  const [newUrl, setNewUrl]       = useState('');

  useEffect(() => {
    return subscribeSocial(
      data => setPlatforms(data),
      () => showToast('error', 'Error', 'Failed to load socials'),
    );
  }, [showToast]);

  const set = (i, field, value) =>
    setPlatforms(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  // `platform` mirrors `key` (it drives the card title), so keep both in step.
  const setPlatform = (i, key) =>
    setPlatforms(prev => prev.map((p, idx) => idx === i ? { ...p, key, platform: key } : p));

  const add = () => {
    const url = newUrl.trim();
    if (!url) return;
    setPlatforms(prev => [...prev, { key: newKey, platform: newKey, url }]);
    setNewUrl('');
  };

  const remove = (i) => {
    if (!window.confirm('Remove this social link?')) return;
    setPlatforms(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSocial(platforms.filter(p => p.url?.trim()));
      showToast('success', 'Saved', 'Social links updated');
    } catch {
      showToast('error', 'Error', 'Failed to save socials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {platforms.map((p, i) => (
        <div key={i} className={formStyles.card}>
          <div className={formStyles.cardHeader}>
            <strong className={formStyles.cardTitle}>{p.platform || p.key}</strong>
            <button type="button" className="btn-danger" onClick={() => remove(i)}>Remove</button>
          </div>
          <div className={formStyles.row}>
            <div className="input-container">
              {/* Not a <label>: SearchableDropdown is not a labelable control. */}
              <span className="input-label">Platform</span>
              <SearchableDropdown
                options={PLATFORM_OPTIONS}
                value={platformOption(p.key)}
                onChange={opt => opt && setPlatform(i, opt.value)}
                placeholder="Platform"
                isClearable={false}
              />
            </div>
            <div className="input-container" style={{ flex: 2 }}>
              <label>URL</label>
              <input
                type="text"
                value={p.url ?? ''}
                onChange={e => set(i, 'url', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <div className={formStyles.card}>
        <p className={formStyles.cardTitle}>Add social link</p>
        <div className={formStyles.row}>
          <div className="input-container">
            {/* Not a <label>: SearchableDropdown is not a labelable control. */}
            <span className="input-label">Platform</span>
            <SearchableDropdown
              options={PLATFORM_OPTIONS}
              value={platformOption(newKey)}
              onChange={opt => opt && setNewKey(opt.value)}
              placeholder="Platform"
              isClearable={false}
            />
          </div>
          <div className="input-container" style={{ flex: 2 }}>
            <label>URL</label>
            <input
              type="text"
              placeholder="https://…"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
            />
          </div>
          <button type="button" className="btn-success" onClick={add}>Add</button>
        </div>
      </div>

      <div className={formStyles.actions}>
        <button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Socials'}
        </button>
      </div>
    </div>
  );
};

export default SocialsSection;
