import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './index';

// ─── Portfolio document reads (semi-static sections) ─────────────────────────

const portfolioDoc = (id) => getDoc(doc(db, 'portfolio', id)).then(s => s.data() ?? null);

export const getPersonal  = ()  => portfolioDoc('personal');
export const getContact   = ()  => portfolioDoc('contact');
export const getDonation  = ()  => portfolioDoc('donation');
export const getCopy      = ()  => portfolioDoc('copy').then(d => d ?? {});
export const getSkills    = ()  => portfolioDoc('skills');
export const getSocial    = ()  => portfolioDoc('social').then(d => d?.platforms ?? []);
export const getInterests = ()  => portfolioDoc('interests').then(d => d?.items ?? []);

// ─── Ordered collection reads ─────────────────────────────────────────────────

const orderedCollection = async (col) => {
  try {
    const snap = await getDocs(query(collection(db, col), orderBy('order')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    // orderBy requires an index - fall back to unordered and sort client-side
    const snap = await getDocs(collection(db, col));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }
};

export const getExperience = () => orderedCollection('experience');
export const getEducation  = () => orderedCollection('education');

// ─── Full portfolio fetch (all sections in parallel) ──────────────────────────
// Uses allSettled so one failing read never crashes the whole page.

export const getPortfolio = () =>
  Promise.allSettled([
    getPersonal(), getContact(), getSocial(), getDonation(),
    getSkills(), getInterests(), getExperience(), getEducation(),
  ]).then(results => {
    const [personal, contact, social, donation, skills, interests, experience, education] =
      results.map(r => (r.status === 'fulfilled' ? r.value : null));
    return { personal, contact, social, donation, skills, interests, experience, education };
  });

// ─── Contact form write ───────────────────────────────────────────────────────

export { submitContactForm } from './contact';
