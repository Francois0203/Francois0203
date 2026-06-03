import React, { useState, useEffect } from 'react';
import {
  subscribePersonal, updatePersonal,
  subscribeContact,  updateContact,
} from '../../../firebase/admin';
import { useToast } from '../../../components';
import formStyles from '../AdminForms.module.css';

// Fields that live in portfolio/personal
const PERSONAL_FIELDS = [
  { key: 'name',     label: 'Name'      },
  { key: 'title',    label: 'Title'     },
  { key: 'bio',      label: 'Bio',       textarea: true },
  { key: 'summary',  label: 'Summary',   textarea: true },
  { key: 'photoUrl', label: 'Photo URL' },
  { key: 'cvUrl',    label: 'CV URL'    },
];

// Fields that live in portfolio/contact
const CONTACT_FIELDS = [
  { key: 'email',    label: 'Email'    },
  { key: 'phone',    label: 'Phone'    },
  { key: 'location', label: 'Location' },
];

const ProfileSection = () => {
  const { showToast } = useToast();
  const [personal, setPersonal] = useState({});
  const [contact,  setContact]  = useState({});
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    const unsubP = subscribePersonal(setPersonal, () => showToast('error', 'Error', 'Failed to load profile'));
    const unsubC = subscribeContact(setContact,   () => showToast('error', 'Error', 'Failed to load contact'));
    return () => { unsubP(); unsubC(); };
  }, [showToast]);

  const setP = (key, value) => setPersonal(prev => ({ ...prev, [key]: value }));
  const setC = (key, value) => setContact(prev  => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([updatePersonal(personal), updateContact(contact)]);
      showToast('success', 'Saved', 'Profile updated');
    } catch {
      showToast('error', 'Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {personal.photoUrl && (
        <div className={formStyles.photoPreview}>
          <img src={personal.photoUrl} alt="Profile preview" />
        </div>
      )}

      <div className={formStyles.grid}>
        {PERSONAL_FIELDS.map(f => (
          <div key={f.key} className="input-container">
            <label htmlFor={`p-${f.key}`}>{f.label}</label>
            {f.textarea ? (
              <textarea
                id={`p-${f.key}`}
                value={personal[f.key] ?? ''}
                onChange={e => setP(f.key, e.target.value)}
                rows={4}
              />
            ) : (
              <input
                id={`p-${f.key}`}
                type="text"
                value={personal[f.key] ?? ''}
                onChange={e => setP(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <h4 style={{ marginTop: 'var(--spacing-lg)' }}>Contact info</h4>

      <div className={formStyles.grid}>
        {CONTACT_FIELDS.map(f => (
          <div key={f.key} className="input-container">
            <label htmlFor={`c-${f.key}`}>{f.label}</label>
            <input
              id={`c-${f.key}`}
              type="text"
              value={contact[f.key] ?? ''}
              onChange={e => setC(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className={formStyles.actions}>
        <button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;
