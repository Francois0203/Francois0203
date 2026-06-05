import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './index';

const ADMIN_EMAILS = (import.meta.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email) =>
  ADMIN_EMAILS.includes((email || '').toLowerCase());

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser      = () => signOut(auth);
export const onAuthChange     = (cb) => onAuthStateChanged(auth, cb);
