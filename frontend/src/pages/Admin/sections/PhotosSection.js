import { useEffect, useRef, useState } from 'react';
import { MdEdit, MdDeleteOutline, MdAddPhotoAlternate, MdHome, MdTimeline } from 'react-icons/md';
import { Modal, useToast, KebabMenu } from '../../../components';
import { subscribePhotos, uploadPhoto, updatePhoto, deletePhoto } from '../../../firebase/photos';
import { subscribeExperience, subscribeEducation, reorderCollection } from '../../../firebase/admin';
import { SortableList, DragHandle } from './Sortable';
import { ListSkeleton } from './Skeletons';
import adminStyles from '../Admin.module.css';
import formStyles from '../AdminForms.module.css';
import styles from './PhotosSection.module.css';

const MAX_MB = 40;

const PhotoForm = ({ photo, chapters, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(() => ({
    caption: photo.caption ?? '',
    where: photo.where ?? '',
    when: photo.when ?? '',
    note: photo.note ?? '',
    chapter: photo.chapter ?? '',
    onHome: photo.onHome !== false,
  }));
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="admin-ui">
      <figure className={styles.formPreview} style={{ '--tint': photo.tint ?? 'var(--surface-2)' }}>
        <img src={photo.thumb || photo.src} alt="" />
      </figure>

      <div className={formStyles.grid}>
        <div className="input-container" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="ph-caption">Caption</label>
          <input id="ph-caption" type="text" maxLength={80} value={form.caption} onChange={e => set('caption', e.target.value)} placeholder="e.g. First dive at Sodwana" />
        </div>
        <div className="input-container">
          <label htmlFor="ph-where">Where</label>
          <input id="ph-where" type="text" maxLength={60} value={form.where} onChange={e => set('where', e.target.value)} placeholder="e.g. Sodwana Bay" />
        </div>
        <div className="input-container">
          <label htmlFor="ph-when">When</label>
          <input id="ph-when" type="text" maxLength={30} value={form.when} onChange={e => set('when', e.target.value)} placeholder="e.g. March 2024" />
        </div>
        <div className="input-container">
          <label htmlFor="ph-note">A line about it (optional)</label>
          <textarea id="ph-note" rows={3} maxLength={280} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Shown when someone opens the photo." />
        </div>
        <div className="input-container" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="ph-chapter">Show it in the story at</label>
          <select id="ph-chapter" value={form.chapter} onChange={e => set('chapter', e.target.value)}>
            <option value="">Nowhere, it is a life photo</option>
            {chapters.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <label className={formStyles.toggleRow} style={{ gridColumn: '1 / -1' }}>
          <input type="checkbox" checked={form.onHome} onChange={e => set('onHome', e.target.checked)} />
          <span>
            <strong>Show on the home page</strong>
            <span className={formStyles.toggleHint}>
              {form.chapter
                ? 'Story photos always show in their chapter, so this one stays off the photo table.'
                : 'The photo table shows up to 7. Untick to keep it on the Bio page only.'}
            </span>
          </span>
        </label>
      </div>

      <div className={formStyles.actions}>
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="button" className="btn-save" onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving…' : 'Save Photo'}
        </button>
      </div>
    </div>
  );
};

const PhotosSection = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [over, setOver] = useState(false);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const inputRef = useRef(null);
  const countRef = useRef(0);

  useEffect(() => subscribePhotos(
    (rows) => { setPhotos(rows); countRef.current = rows.length; setLoaded(true); },
    (err) => {
      setLoaded(true);
      toast.error(err?.code === 'permission-denied'
        ? 'Firestore refused to read photos. Deploy the rules: firebase deploy --only firestore:rules'
        : 'Failed to load photos');
    },
  ), [toast]);

  useEffect(() => {
    const a = subscribeExperience(setExperience, () => {});
    const b = subscribeEducation(setEducation, () => {});
    return () => { a(); b(); };
  }, []);

  const chapters = [
    ...experience.map(e => ({ id: `exp-${e.id}`, label: `${e.company}${e.role ? `, ${e.role}` : ''}` })),
    ...education.map(e => ({ id: `edu-${e.id}`, label: `${e.institution}${e.degree ? `, ${e.degree}` : ''}` })),
  ];
  const chapterLabel = (id) => chapters.find(c => c.id === id)?.label;

  const addFiles = async (fileList) => {
    const files = [...fileList].filter(f => f.type.startsWith('image/'));
    if (!files.length) { toast.warning('Pick image files (JPEG, PNG or WebP).'); return; }
    const tooBig = files.filter(f => f.size > MAX_MB * 1024 * 1024);
    if (tooBig.length) toast.warning(`${tooBig.length} file(s) over ${MAX_MB} MB were skipped.`);
    const ok = files.filter(f => f.size <= MAX_MB * 1024 * 1024);

    const jobs = ok.map((file, i) => ({ key: `${Date.now()}-${i}`, name: file.name, preview: URL.createObjectURL(file), progress: 0, file }));
    setUploads(prev => [...prev, ...jobs]);

    let done = 0;
    for (const job of jobs) {
      const order = countRef.current + done;
      try {
        await uploadPhoto(job.file, { order }, (p) => {
          setUploads(prev => prev.map(u => (u.key === job.key ? { ...u, progress: p } : u)));
        });
        done += 1;
      } catch (err) {
        console.error(err);
        toast.error(`Could not upload ${job.name}. ${err?.code === 'storage/unauthorized' ? 'Storage refused it; check that Storage is enabled and the rules are deployed.' : err?.name === 'InvalidStateError' || err?.name === 'EncodingError' ? 'The browser cannot read that format; export it as JPEG first.' : 'Try again.'}`);
      } finally {
        URL.revokeObjectURL(job.preview);
        setUploads(prev => prev.filter(u => u.key !== job.key));
      }
    }
    if (done) toast.success(`${done} photo${done === 1 ? '' : 's'} added. Click one to give it a caption.`);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleReorder = async (next) => {
    const before = photos;
    setPhotos(next);
    try {
      await reorderCollection('photos', next.map(p => p.id));
    } catch {
      setPhotos(before);
      toast.error('Failed to save the photo order');
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await updatePhoto(editing.id, data);
      toast.success('Photo updated');
      setEditing(null);
    } catch {
      toast.error('Failed to save the photo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm('Delete this photo? It is removed from the site and from storage.')) return;
    try {
      await deletePhoto(photo);
      toast.success('Photo deleted');
    } catch {
      toast.error('Failed to delete the photo');
    }
  };

  if (!loaded) return <ListSkeleton />;

  return (
    <div>
      <div
        className={styles.drop}
        data-over={over ? '' : undefined}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <MdAddPhotoAlternate className={styles.dropIcon} aria-hidden="true" />
        <p className={styles.dropTitle}>Drop photos here</p>
        <p className={styles.dropHint}>They are resized in your browser before upload, so big phone photos are fine.</p>
        <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()}>
          Choose photos
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {uploads.length > 0 && (
        <div className={styles.uploads} aria-live="polite">
          {uploads.map(u => (
            <div key={u.key} className={styles.upload}>
              <img src={u.preview} alt="" />
              <span className={styles.uploadBar} style={{ '--p': u.progress }} />
              <span className={styles.uploadText}>{u.progress > 0 ? `${Math.round(u.progress * 100)}%` : 'Preparing…'}</span>
            </div>
          ))}
        </div>
      )}

      <div className={adminStyles.sectionHeader}>
        <p className={adminStyles.hint}>
          {photos.length > 1
            ? 'Click a photo to caption it. Drag the handle to change the order the site shows them in.'
            : `${photos.length} photo${photos.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {photos.length === 0 && uploads.length === 0 && (
        <p className={adminStyles.empty}>No photos yet. Until you add some, the photo sections stay hidden on the site.</p>
      )}

      <SortableList
        items={photos}
        getId={p => p.id}
        onReorder={handleReorder}
        layout="wrap"
        className={styles.grid}
        itemClassName={styles.tile}
      >
        {(photo, i, handle) => (
          <>
            <button
              type="button"
              className={styles.tileImage}
              style={{ '--tint': photo.tint ?? 'var(--surface-2)' }}
              onClick={() => setEditing(photo)}
              aria-label={`Edit photo ${i + 1}${photo.caption ? `: ${photo.caption}` : ''}`}
            >
              <img src={photo.thumb || photo.src} alt="" loading="lazy" />
            </button>
            <div className={styles.tileBar}>
              <DragHandle {...handle} label={`Move photo ${i + 1}`} />
              <div className={styles.tileText}>
                <span className={styles.tileCaption}>{photo.caption || <em>No caption yet</em>}</span>
                <span className={styles.tileMeta}>
                  {photo.onHome !== false && <span title="On the home page"><MdHome aria-label="On the home page" /></span>}
                  {photo.chapter && <span title={chapterLabel(photo.chapter) ?? 'In the story'}><MdTimeline aria-label="In the story" /></span>}
                  {[photo.where, photo.when].filter(Boolean).join(' · ')}
                </span>
              </div>
              <KebabMenu
                ariaLabel={`Options for photo ${i + 1}`}
                items={[
                  { label: 'Edit', icon: <MdEdit />, onSelect: () => setEditing(photo) },
                  { label: 'Delete', icon: <MdDeleteOutline />, danger: true, onSelect: () => handleDelete(photo) },
                ]}
              />
            </div>
          </>
        )}
      </SortableList>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Photo" size="lg" className="admin-modal">
        {editing && (
          <PhotoForm
            photo={editing}
            chapters={chapters}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  );
};

export default PhotosSection;
