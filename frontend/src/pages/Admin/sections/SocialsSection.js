import React, { useState, useEffect } from 'react';
import { subscribeSocial, updateSocial } from '../../../firebase/admin';
import { useToast, SearchableDropdown } from '../../../components';
import { SortableList, DragHandle, withIds, stripIds } from './Sortable';
import { PLATFORMS } from '../../../components/SocialIcon';
import formStyles from '../AdminForms.module.css';

const PLATFORM_OPTIONS = PLATFORMS.map(p => ({ value: p.key, label: p.label }));

const platformOption = (key) =>
  PLATFORM_OPTIONS.find(o => o.value === key) ?? null;

const SocialsSection = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [newKey, setNewKey]       = useState('github');
  const [newUrl, setNewUrl]       = useState('');

  useEffect(() => {
    return subscribeSocial(
      data => setPlatforms(withIds(data)),
      () => toast.error('Failed to load socials'),
    );
  }, [toast]);

  const set = (i, field, value) =>
    setPlatforms(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  // `platform` mirrors `key` (it drives the card title), so keep both in step.
  const labelOf = (key) => platformOption(key)?.label ?? key;
  const setPlatform = (i, key) =>
    setPlatforms(prev => prev.map((p, idx) => idx === i ? { ...p, key, platform: labelOf(key) } : p));

  const add = () => {
    const url = newUrl.trim();
    if (!url) return;
    setPlatforms(prev => [...prev, ...withIds([{ key: newKey, platform: labelOf(newKey), url }])]);
    setNewUrl('');
  };

  const remove = (i) => {
    if (!window.confirm('Remove this social link?')) return;
    setPlatforms(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSocial(stripIds(platforms.filter(p => p.url?.trim())));
      toast.success('Social links updated');
    } catch {
      toast.error('Failed to save socials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {platforms.length > 1 && (
        <p className={formStyles.meta} style={{ marginBottom: 'var(--spacing-md)' }}>
          Drag to change the order they appear in, then save.
        </p>
      )}

      <SortableList
        items={platforms}
        getId={p => p._id}
        onReorder={setPlatforms}
        itemClassName={formStyles.card}
      >
        {(p, i, handle) => (
        <>
          <div className={formStyles.cardHeader}>
            <DragHandle {...handle} label={`Move ${p.platform || p.key}`} />
            <strong className={formStyles.cardTitle} style={{ flex: 1 }}>{p.platform || p.key}</strong>
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
        </>
        )}
      </SortableList>

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
        <button type="submit" className="btn-success" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Socials'}
        </button>
      </div>
    </div>
  );
};

export default SocialsSection;
