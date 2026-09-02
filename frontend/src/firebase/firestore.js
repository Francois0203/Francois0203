import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './index';

// ─── Portfolio document reads (semi-static sections) ─────────────────────────

const portfolioDoc = (id) => getDoc(doc(db, 'portfolio', id)).then(s => s.data() ?? null);

/* Exported on its own as well as via getPortfolio: the Intro needs the name and
 * photo within a few hundred ms of load, and getPortfolio does not resolve
 * until all nine of its reads have settled. One document is a much shorter
 * wait than the slowest of nine. */
export const getPersonal = ()  => portfolioDoc('personal');
const getContact   = ()  => portfolioDoc('contact');
const getDonation  = ()  => portfolioDoc('donation');
export const getCopy      = ()  => portfolioDoc('copy').then(d => d ?? {});
const getSkills    = ()  => portfolioDoc('skills');
/* Exported alongside getPersonal for the Intro: the cover's portrait falls back
 * to the GitHub avatar derived from this document when personal.photoUrl is
 * empty, so anything that wants "the profile picture" needs both docs. */
export const getSocial = ()  => portfolioDoc('social').then(d => d?.platforms ?? []);
const getInterests = ()  => portfolioDoc('interests').then(d => d?.items ?? []);

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

const getExperience     = () => orderedCollection('experience');
const getEducation      = () => orderedCollection('education');
const getCertifications = () => orderedCollection('certifications');

// ─── Full portfolio fetch (all sections in parallel) ──────────────────────────
// Uses allSettled so one failing read never crashes the whole page.

export const getPortfolio = () =>
  Promise.allSettled([
    getPersonal(), getContact(), getSocial(), getDonation(),
    getSkills(), getInterests(), getExperience(), getEducation(),
    getCertifications(),
  ]).then(results => {
    const [personal, contact, social, donation, skills, interests, experience,
           education, certifications] =
      results.map(r => (r.status === 'fulfilled' ? r.value : null));
    return {
      personal, contact, social, donation, skills, interests, experience,
      education, certifications,
    };
  });

// ─── Contact form write ───────────────────────────────────────────────────────

export { submitContactForm } from './contact';
