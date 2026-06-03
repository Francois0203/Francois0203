import {
  collection, doc,
  onSnapshot, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './index';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const portfolioRef  = (id) => doc(db, 'portfolio', id);
const portfolioSnap = (id, cb, onErr) =>
  onSnapshot(portfolioRef(id), snap => cb(snap.data() ?? {}), onErr);

// ─── Personal ────────────────────────────────────────────────────────────────

export const subscribePersonal = (cb, onErr) =>
  portfolioSnap('personal', cb, onErr);

export const updatePersonal = (data) =>
  setDoc(portfolioRef('personal'), { ...data, updatedAt: serverTimestamp() }, { merge: true });

// ─── Contact ─────────────────────────────────────────────────────────────────

export const subscribeContact = (cb, onErr) =>
  portfolioSnap('contact', cb, onErr);

export const updateContact = (data) =>
  setDoc(portfolioRef('contact'), { ...data, updatedAt: serverTimestamp() }, { merge: true });

// ─── Skills ──────────────────────────────────────────────────────────────────

// Normalise whatever shape is in Firestore to { categories: [{name, items}] }
// so the admin editor always has a consistent structure to work with.
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

// ─── Interests ───────────────────────────────────────────────────────────────

export const subscribeInterests = (cb, onErr) =>
  onSnapshot(portfolioRef('interests'), snap => cb(snap.data()?.items ?? []), onErr);

export const updateInterests = (items) =>
  setDoc(portfolioRef('interests'), { items: items.map(i => i.trim()).filter(Boolean), updatedAt: serverTimestamp() });

// ─── Social ──────────────────────────────────────────────────────────────────

export const subscribeSocial = (cb, onErr) =>
  onSnapshot(portfolioRef('social'), snap => cb(snap.data()?.platforms ?? []), onErr);

export const updateSocial = (platforms) =>
  setDoc(portfolioRef('social'), { platforms, updatedAt: serverTimestamp() });

// ─── Experience ───────────────────────────────────────────────────────────────

// Fetch ALL docs (no orderBy so nothing is excluded), then sort client-side.
// orderBy('order') silently drops documents that lack the field entirely.
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
  addDoc(collection(db, 'experience'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateExperience = (id, data) =>
  updateDoc(doc(db, 'experience', id), { ...data, updatedAt: serverTimestamp() });

export const deleteExperience = (id) =>
  deleteDoc(doc(db, 'experience', id));

// ─── Education ───────────────────────────────────────────────────────────────

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
  addDoc(collection(db, 'education'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateEducation = (id, data) =>
  updateDoc(doc(db, 'education', id), { ...data, updatedAt: serverTimestamp() });

export const deleteEducation = (id) =>
  deleteDoc(doc(db, 'education', id));

// ─── GitHub Projects ─────────────────────────────────────────────────────────

export const subscribeGitHubProjects = (cb, onErr) =>
  onSnapshot(
    query(collection(db, 'githubProjects'), orderBy('order')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onErr,
  );

export const updateGitHubProject = (id, data) =>
  updateDoc(doc(db, 'githubProjects', id), { ...data, updatedAt: serverTimestamp() });

export const deleteGitHubProject = (id) =>
  deleteDoc(doc(db, 'githubProjects', id));

// ─── Contact Messages ────────────────────────────────────────────────────────

export const subscribeMessages = (cb, onErr) =>
  onSnapshot(
    query(collection(db, 'contacts'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    onErr,
  );

export const deleteMessage = (id) =>
  deleteDoc(doc(db, 'contacts', id));
