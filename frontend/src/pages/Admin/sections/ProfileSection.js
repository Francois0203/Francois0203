import React, { useState, useEffect, useRef } from 'react';
import { MdUpload, MdRestartAlt } from 'react-icons/md';
import {
  subscribePersonal, updatePersonal,
  subscribeContact,  updateContact,
  subscribeSocial,
} from '../../../firebase/admin';
import { useToast } from '../../../components';
import { githubAvatar } from '../../../content/avatar';
import { FormSkeleton } from './Skeletons';
import formStyles from '../AdminForms.module.css';

// Fields that live in portfolio/personal
const PERSONAL_FIELDS = [
  { key: 'name',     label: 'Name'      },
  { key: 'title',    label: 'Title'     },
  { key: 'summary',  label: 'Summary',   textarea: true },
];

// Fields that live in portfolio/contact
const CONTACT_FIELDS = [
  { key: 'email',    label: 'Email'    },
  { key: 'phone',    label: 'Phone'    },
  { key: 'location', label: 'Location' },
];

const PHOTO_SIZE = 512;

// Crops the picture to a centred square and shrinks it, so it fits in Firestore.
const toSquarePhoto = async (file) => {
  const img = await createImageBitmap(file);
  const side = Math.min(img.width, img.height);
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  img.close?.();
  let quality = 0.86;
  let data = canvas.toDataURL('image/jpeg', quality);
  while (data.length > 300000 && quality > 0.4) {
    quality -= 0.1;
    data = canvas.toDataURL('image/jpeg', quality);
  }
  return data;
};

const ProfileSection = () => {
  const { toast } = useToast();
  const [personal, setPersonal] = useState({});
  const [contact,  setContact]  = useState({});
  const [github,   setGithub]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const unsubP = subscribePersonal(
      (d) => { setPersonal(d); setLoaded(true); },
      () => { setLoaded(true); toast.error('Failed to load profile'); },
    );
    const unsubC = subscribeContact(setContact,   () => toast.error('Failed to load contact'));
    const unsubS = subscribeSocial(list => setGithub(githubAvatar(list)), () => {});
    return () => { unsubP(); unsubC(); unsubS(); };
  }, [toast]);

  const setP = (key, value) => setPersonal(prev => ({ ...prev, [key]: value }));
  const setC = (key, value) => setContact(prev  => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([updatePersonal(personal), updateContact(contact)]);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // The photo saves straight away, separate from the rest of the form.
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('That file is not an image.');
      return;
    }
    setUploading(true);
    let photoUrl;
    try {
      photoUrl = await toSquarePhoto(file);
    } catch {
      toast.error('Could not read that picture. Try a JPG or PNG.');
      setUploading(false);
      return;
    }
    try {
      await updatePersonal({ photoUrl });
      toast.success('Photo updated');
    } catch {
      toast.error('Failed to save the photo');
    } finally {
      setUploading(false);
    }
  };

  const resetPhoto = async () => {
    if (!window.confirm('Remove your photo and use your GitHub picture instead?')) return;
    try {
      await updatePersonal({ photoUrl: '' });
      toast.success('Using your GitHub picture');
    } catch {
      toast.error('Failed to remove the photo');
    }
  };

  const own = Boolean(personal.photoUrl);
  const shown = personal.photoUrl || github;

  if (!loaded) return <FormSkeleton />;

  return (
    <div>
      <div className={formStyles.photoRow}>
        <div className={formStyles.photoPreview}>
          {shown ? <img src={shown} alt="" /> : <span aria-hidden="true" />}
        </div>
        <div className={formStyles.photoText}>
          <strong>Profile photo</strong>
          <span className={formStyles.toggleHint}>
            {own ? 'Your uploaded photo. It is cropped to a square.' : 'Showing your GitHub picture. Upload a photo to use your own.'}
          </span>
          <div className={formStyles.photoActions}>
            <button type="button" className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <MdUpload aria-hidden="true" /> {uploading ? 'Uploading…' : 'Upload photo'}
            </button>
            {own && (
              <button type="button" className="btn-outline" onClick={resetPhoto} disabled={uploading}>
                <MdRestartAlt aria-hidden="true" /> Use GitHub picture
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          </div>
          <label className={formStyles.toggleRow} style={{ margin: 'var(--spacing-sm) 0 0', paddingBottom: 0 }}>
            <input
              type="checkbox"
              checked={personal.cvPhoto !== false}
              onChange={e => setP('cvPhoto', e.target.checked)}
            />
            <span><strong>Show my photo on the printed CV</strong></span>
          </label>
        </div>
      </div>

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

      <h2 className={formStyles.group}>Contact</h2>

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
        <button type="submit" className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;
