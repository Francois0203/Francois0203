import {
  collection, doc,
  onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, getDoc, runTransaction,
  query, orderBy, serverTimestamp, writeBatch, deleteField,
} from 'firebase/firestore';
import { db } from './index';
import { releaseChapter } from './photos';

// Helpers

const blank = (v) => v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0);

// Cleared fields are removed from the document instead of being stored empty.
const pruneEmpty = (data) => Object.fromEntries(Object.entries(data).map(([k, v]) => [k, blank(v) ? deleteField() : v]));

// For new documents, empty fields are simply left out.
const dropEmpty = (data) => Object.fromEntries(Object.entries(data).filter(([, v]) => !blank(v)));

const SYSTEM = ['order', 'createdAt', 'updatedAt'];

// Saves a record and removes any field the form no longer has, so old data never lingers.
const saveRecord = async (col, id, data) => {
  const ref = doc(db, col, id);
  const current = (await getDoc(ref)).data() ?? {};
  const stale = Object.keys(current).filter(k => !(k in data) && !SYSTEM.includes(k));
  await updateDoc(ref, {
    ...pruneEmpty(data),
    ...Object.fromEntries(stale.map(k => [k, deleteField()])),
    updatedAt: serverTimestamp(),
  });
};

const portfolioRef  = (id) => doc(db, 'portfolio', id);

// Saves the new order after a drag.
export const reorderCollection = (col, ids) => {
  const batch = writeBatch(db);
  ids.forEach((id, i) => batch.update(doc(db, col, id), { order: i }));
  return batch.commit();
};
const portfolioSnap = (id, cb, onErr) =>
  onSnapshot(portfolioRef(id), snap => cb(snap.data() ?? {}), onErr);

// Personal

export const subscribePersonal = (cb, onErr) =>
  portfolioSnap('personal', cb, onErr);

export const updatePersonal = (data) =>
  setDoc(portfolioRef('personal'), { ...pruneEmpty(data), updatedAt: serverTimestamp() }, { merge: true });

// Contact

export const subscribeContact = (cb, onErr) =>
  portfolioSnap('contact', cb, onErr);

export const updateContact = (data) =>
  setDoc(portfolioRef('contact'), { ...pruneEmpty(data), updatedAt: serverTimestamp() }, { merge: true });

// Donation

export const subscribeDonation = (cb, onErr) =>
  portfolioSnap('donation', cb, onErr);

export const updateDonation = (data) =>
  setDoc(portfolioRef('donation'), { ...pruneEmpty(data), updatedAt: serverTimestamp() }, { merge: true });


export const subscribeCopy = (cb, onErr) =>
  portfolioSnap('copy', cb, onErr);

export const updateCopy = (data) =>
  setDoc(portfolioRef('copy'), { ...data, updatedAt: serverTimestamp() });

// Skills

const normalizeSkills = (data) => {
  if (!data) return { categories: [] };
  if (Array.isArray(data.categories)) return data;
  // Flat items array → single "Skills" category
  if (Array.isArray(data.items)) return { categories: [{ name: 'Skills', items: data.items }] };
  // Object with array values → each key becomes a category
  const cats = Object.entries(data)
    .filter(([k, v]) => k !== 'updatedAt' && Array.isArray(v))
    .map(([name, items]) => ({ name, items }));
  return { categories: cats };
};

export const subscribeSkills = (cb, onErr) =>
  onSnapshot(portfolioRef('skills'), snap => cb(normalizeSkills(snap.data())), onErr);

export const updateSkills = (categories) =>
  setDoc(portfolioRef('skills'), { categories, updatedAt: serverTimestamp() });

// Interests

export const subscribeInterests = (cb, onErr) =>
  onSnapshot(portfolioRef('interests'), snap => cb(snap.data()?.items ?? []), onErr);

export const updateInterests = (items) =>
  setDoc(portfolioRef('interests'), { items: items.map(i => i.trim()).filter(Boolean), updatedAt: serverTimestamp() });

// Social

export const subscribeSocial = (cb, onErr) =>
  onSnapshot(portfolioRef('social'), snap => cb(snap.data()?.platforms ?? []), onErr);

export const updateSocial = (platforms) =>
  setDoc(portfolioRef('social'), { platforms, updatedAt: serverTimestamp() });

// Experience

export const subscribeExperience = (cb, onErr) =>
  onSnapshot(
    collection(db, 'experience'),
    snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      cb(docs);
    },
    onErr,
  );

export const createExperience = (data) =>
  addDoc(collection(db, 'experience'), { ...dropEmpty(data), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateExperience = (id, data) => saveRecord('experience', id, data);

export const deleteExperience = async (id) => {
  await deleteDoc(doc(db, 'experience', id));
  await releaseChapter(`exp-${id}`).catch(() => {});
};

// Education

export const subscribeEducation = (cb, onErr) =>
  onSnapshot(
    collection(db, 'education'),
    snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      cb(docs);
    },
    onErr,
  );

export const createEducation = (data) =>
  addDoc(collection(db, 'education'), { ...dropEmpty(data), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateEducation = (id, data) => saveRecord('education', id, data);

export const deleteEducation = async (id) => {
  await deleteDoc(doc(db, 'education', id));
  await releaseChapter(`edu-${id}`).catch(() => {});
};

// Certifications

export const subscribeCertifications = (cb, onErr) =>
  onSnapshot(
    collection(db, 'certifications'),
    snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      cb(docs);
    },
    onErr,
  );

export const createCertification = (data) =>
  addDoc(collection(db, 'certifications'), { ...dropEmpty(data), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateCertification = (id, data) => saveRecord('certifications', id, data);

export const deleteCertification = (id) =>
  deleteDoc(doc(db, 'certifications', id));

// GitHub Projects

export const subscribeGitHubProjects = (cb, onErr) =>
  onSnapshot(
    query(collection(db, 'githubProjects'), orderBy('order')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onErr,
  );


export const subscribeStudioSites = (cb, onErr) =>
  onSnapshot(
    query(collection(db, 'studioSites'), orderBy('order')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onErr,
  );


const repoId = (owner, repo) => `${owner}_${repo}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

// Removes the project and takes it off the sync list, so the next sync does not bring it back.
export const deleteGitHubProject = async (id) => {
  await runTransaction(db, async (tx) => {
    const configRef = portfolioRef('githubConfig');
    const config = await tx.get(configRef);
    const repos = config.data()?.repos;
    if (Array.isArray(repos)) {
      const kept = repos.filter(r => repoId(r?.owner ?? '', r?.repo ?? '') !== id);
      if (kept.length !== repos.length) tx.update(configRef, { repos: kept, updatedAt: serverTimestamp() });
    }
    tx.delete(doc(db, 'githubProjects', id));
  });
};

// Contact Messages

export const subscribeMessages = (cb, onErr) =>
  onSnapshot(
    query(collection(db, 'contacts'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onErr,
  );

export const deleteMessage = (id) =>
  deleteDoc(doc(db, 'contacts', id));
