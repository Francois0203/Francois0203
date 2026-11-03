import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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

// Shrinks the file in the browser, uploads a full and a small copy, then records it.
export const uploadPhoto = async (file, meta = {}, onProgress) => {
  const prepared = await preparePhoto(file);
  const id = doc(photosCol).id;
  const srcPath = `photos/${id}-full.${extOf(prepared.full)}`;
  const thumbPath = `photos/${id}-thumb.${extOf(prepared.thumb)}`;
  const total = prepared.full.size + prepared.thumb.size;
  let fullDone = 0;
  let thumbDone = 0;
  const report = () => onProgress?.((fullDone * prepared.full.size + thumbDone * prepared.thumb.size) / total);

  const [src, thumb] = await Promise.all([
    put(srcPath, prepared.full, p => { fullDone = p; report(); }),
    put(thumbPath, prepared.thumb, p => { thumbDone = p; report(); }),
  ]);

  await setDoc(doc(photosCol, id), {
    src, thumb, srcPath, thumbPath,
    w: prepared.w, h: prepared.h, tint: prepared.tint,
    caption: '', where: '', when: '', note: '', chapter: '',
    onHome: true,
    order: 0,
    ...meta,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
};

export const subscribePhotos = (cb, onErr) =>
  onSnapshot(photosCol, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    cb(docs);
  }, onErr);

export const updatePhoto = (id, data) =>
  updateDoc(doc(photosCol, id), { ...data, updatedAt: serverTimestamp() });

const removeFile = (path) => (path
  ? deleteObject(ref(storage, path)).catch((e) => { if (e?.code !== 'storage/object-not-found') throw e; })
  : Promise.resolve());

export const deletePhoto = async (photo) => {
  await Promise.all([removeFile(photo.srcPath), removeFile(photo.thumbPath)]);
  await deleteDoc(doc(photosCol, photo.id));
};
