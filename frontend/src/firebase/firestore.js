import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './index';

// Portfolio document reads (semi-static sections)

const portfolioDoc = (id) => getDoc(doc(db, 'portfolio', id)).then(s => s.data() ?? null);

const getPersonal  = ()  => portfolioDoc('personal');
const getContact   = ()  => portfolioDoc('contact');
const getDonation  = ()  => portfolioDoc('donation');
export const getCopy      = ()  => portfolioDoc('copy').then(d => d ?? {});
const getSkills    = ()  => portfolioDoc('skills');
const getSocial    = ()  => portfolioDoc('social').then(d => d?.platforms ?? []);
const getInterests = ()  => portfolioDoc('interests').then(d => d?.items ?? []);

// Ordered collection reads

const orderedCollection = async (col) => {
  try {
    const snap = await getDocs(query(collection(db, col), orderBy('order')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    // Without an index, sort in the browser instead
    const snap = await getDocs(collection(db, col));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }
};

const getExperience     = () => orderedCollection('experience');
const getEducation      = () => orderedCollection('education');
const getCertifications = () => orderedCollection('certifications');


export const getPortfolio = () =>
  Promise.allSettled([
    getPersonal(), getContact(), getSocial(), getDonation(),
    getSkills(), getInterests(), getExperience(), getEducation(),
    getCertifications(),
  ]).then(results => {
    const keys = ['personal', 'contact', 'social', 'donation', 'skills', 'interests', 'experience', 'education', 'certifications'];
    const data = Object.fromEntries(keys.map((k, i) => [k, results[i].status === 'fulfilled' ? results[i].value : null]));
    // Lists the parts that failed to load, so the CV can refuse to print half a record.
    data.failed = keys.filter((_, i) => results[i].status === 'rejected');
    return data;
  });

// Contact form write

export { submitContactForm } from './contact';
