import React, { useState, useEffect } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { subscribeSocial, updateSocial } from '../../../firebase/admin';
import { useToast, SearchableDropdown, KebabMenu } from '../../../components';
import { SortableList, DragHandle, withIds, stripIds } from './Sortable';
import { PLATFORMS } from '../../../components/SocialIcon';
import { ListSkeleton } from './Skeletons';
import formStyles from '../AdminForms.module.css';

const PLATFORM_OPTIONS = PLATFORMS.map(p => ({ value: p.key, label: p.label }));

const platformOption = (key) =>
  PLATFORM_OPTIONS.find(o => o.value === key) ?? null;

const SocialsSection = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [newKey, setNewKey]       = useState('github');
  const [newUrl, setNewUrl]       = useState('');

  useEffect(() => {
    return subscribeSocial(
      data => { setPlatforms(withIds(data)); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load socials'); },
    );
  }, [toast]);

  const set = (i, field, value) =>
    setPlatforms(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  // Keep `platform` the same as `key`.
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

  if (!loaded) return <ListSkeleton />;

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
            <strong className={formStyles.cardTitle}>{p.platform || p.key}</strong>
            <KebabMenu
              ariaLabel={`Options for ${p.platform || p.key}`}
              items={[{ label: 'Remove', icon: <MdDeleteOutline />, danger: true, onSelect: () => remove(i) }]}
            />
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
          <label className={formStyles.toggleRow}>
            <input
              type="checkbox"
              checked={p.showOnCv !== false}
              onChange={e => set(i, 'showOnCv', e.target.checked)}
            />
            <span><strong>Show on the printed CV</strong></span>
          </label>
        </>
        )}
      </SortableList>

      <div className={formStyles.inlineAdd} style={{ display: 'block' }}>
        <p className={formStyles.cardTitle}>Add a link</p>
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
          <button type="button" className="btn-primary" onClick={add}><MdAdd aria-hidden="true" /> Add</button>
        </div>
      </div>

      <div className={formStyles.actions}>
        <button type="submit" className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Socials'}
        </button>
      </div>
    </div>
  );
};

export default SocialsSection;
