import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './index';

export const getStudioSites = async () => {
  const snap = await getDocs(
    query(collection(db, 'studioSites'), orderBy('order')),
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** A repo with no resolvable url syncs fine but has nothing to show. */
export const hasLiveSite = (p) => Array.isArray(p?.sites) && p.sites.length > 0;

export const pickFeatured = (sites, limit = 3) => {
  const live  = (sites ?? []).filter(hasLiveSite);
  const flagged = live.filter(p => p.featured);
  return (flagged.length > 0 ? flagged : live).slice(0, limit);
};
