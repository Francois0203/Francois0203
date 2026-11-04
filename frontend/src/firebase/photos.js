import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp,
  getDocs, getDoc, query, where, writeBatch,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';
import { app, db } from './index';

// Admin only. The public site reads photos through getPortfolio and never loads Storage.
const storage = getStorage(app);
const photosCol = collection(db, 'photos');

const FULL_SIDE = 2000;
const THUMB_SIDE = 720;

const encode = (canvas, quality) => new Promise((resolve) => {
  canvas.toBlob((blob) => {
    if (blob && blob.type === 'image/webp') { resolve(blob); return; }
    canvas.toBlob(resolve, 'image/jpeg', quality);
  }, 'image/webp', quality);
});

const scaled = (bitmap, side) => {
  const k = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
};

// The average colour fills the frame while the picture loads.
const tintOf = (bitmap) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
};

export const preparePhoto = async (file) => {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const full = await encode(scaled(bitmap, FULL_SIDE), 0.84);
    const thumb = await encode(scaled(bitmap, THUMB_SIDE), 0.8);
    const k = Math.min(1, FULL_SIDE / Math.max(bitmap.width, bitmap.height));
    return {
      full,
      thumb,
      w: Math.round(bitmap.width * k),
      h: Math.round(bitmap.height * k),
      tint: tintOf(bitmap),
    };
  } finally {
    bitmap.close?.();
  }
};

const put = (path, blob, onProgress) => new Promise((resolve, reject) => {
  const task = uploadBytesResumable(ref(storage, path), blob, {
    contentType: blob.type,
    cacheControl: 'public, max-age=31536000, immutable',
  });
  task.on('state_changed',
    s => onProgress?.(s.bytesTransferred / Math.max(1, s.totalBytes)),
    reject,
    () => getDownloadURL(task.snapshot.ref).then(resolve, reject));
});

const extOf = (blob) => (blob.type === 'image/webp' ? 'webp' : 'jpg');

const removeFile = (path) => (path
  ? deleteObject(ref(storage, path)).catch((e) => { if (e?.code !== 'storage/object-not-found') throw e; })
  : Promise.resolve());

// Uploads a full and a small copy. If anything fails, whatever did upload is removed again.
const uploadPair = async (prepared, stem, onProgress) => {
  const srcPath = `photos/${stem}-full.${extOf(prepared.full)}`;
  const thumbPath = `photos/${stem}-thumb.${extOf(prepared.thumb)}`;
  const total = prepared.full.size + prepared.thumb.size;
  let fullDone = 0;
  let thumbDone = 0;
  const report = () => onProgress?.((fullDone * prepared.full.size + thumbDone * prepared.thumb.size) / total);
  const results = await Promise.allSettled([
    put(srcPath, prepared.full, p => { fullDone = p; report(); }),
    put(thumbPath, prepared.thumb, p => { thumbDone = p; report(); }),
  ]);
  if (results.some(r => r.status === 'rejected')) {
    await Promise.allSettled([removeFile(srcPath), removeFile(thumbPath)]);
    throw results.find(r => r.status === 'rejected').reason;
  }
  return { src: results[0].value, thumb: results[1].value, srcPath, thumbPath };
};

// Shrinks the file in the browser, uploads both copies, then records it.
export const uploadPhoto = async (file, meta = {}, onProgress) => {
  const prepared = await preparePhoto(file);
  const id = doc(photosCol).id;
  const files = await uploadPair(prepared, id, onProgress);
  try {
    await setDoc(doc(photosCol, id), {
      ...files,
      w: prepared.w, h: prepared.h, tint: prepared.tint,
      caption: '', where: '', when: '', note: '', chapter: '',
      onHome: true,
      order: 0,
      ...meta,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    await Promise.allSettled([removeFile(files.srcPath), removeFile(files.thumbPath)]);
    throw err;
  }
  return id;
};

// Swaps the picture of an existing photo and deletes the old files once the new ones are in use.
export const replacePhotoImage = async (photo, file, onProgress) => {
  const prepared = await preparePhoto(file);
  const files = await uploadPair(prepared, `${photo.id}-${Date.now()}`, onProgress);
  try {
    await updateDoc(doc(photosCol, photo.id), {
      ...files, w: prepared.w, h: prepared.h, tint: prepared.tint, updatedAt: serverTimestamp(),
    });
  } catch (err) {
    await Promise.allSettled([removeFile(files.srcPath), removeFile(files.thumbPath)]);
    throw err;
  }
  await Promise.allSettled([removeFile(photo.srcPath), removeFile(photo.thumbPath)]);
};

export const subscribePhotos = (cb, onErr) =>
  onSnapshot(photosCol, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    cb(docs);
  }, onErr);

export const updatePhoto = (id, data) =>
  updateDoc(doc(photosCol, id), { ...data, updatedAt: serverTimestamp() });

// The entry goes first so the site never points at a missing file, then the files.
export const deletePhoto = async (photo) => {
  await deleteDoc(doc(photosCol, photo.id));
  await Promise.allSettled([removeFile(photo.srcPath), removeFile(photo.thumbPath)]);
};

// Story photos of a deleted job or degree go back to being plain photos.
export const releaseChapter = async (chapter) => {
  const snap = await getDocs(query(photosCol, where('chapter', '==', chapter)));
  if (snap.empty) return 0;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { chapter: '', updatedAt: serverTimestamp() }));
  await batch.commit();
  return snap.size;
};

const HOUR = 60 * 60 * 1000;

// Removes unused image files over an hour old, and story links to entries that are gone.
export const sweepPhotos = async () => {
  const [snap, listing] = await Promise.all([getDocs(photosCol), listAll(ref(storage, 'photos'))]);
  const used = new Set(snap.docs.flatMap(d => [d.get('srcPath'), d.get('thumbPath')]).filter(Boolean));
  let files = 0;
  for (const item of listing.items) {
    if (used.has(item.fullPath)) continue;
    const meta = await getMetadata(item).catch(() => null);
    if (meta && Date.now() - new Date(meta.timeCreated).getTime() > HOUR) {
      await removeFile(item.fullPath);
      files += 1;
    }
  }
  let links = 0;
  for (const d of snap.docs) {
    const chapter = d.get('chapter');
    const m = /^(exp|edu)-(.+)$/.exec(chapter ?? '');
    if (!m) continue;
    const owner = await getDoc(doc(db, m[1] === 'exp' ? 'experience' : 'education', m[2]));
    if (!owner.exists()) {
      await updateDoc(d.ref, { chapter: '', updatedAt: serverTimestamp() });
      links += 1;
    }
  }
  return { files, links };
};
