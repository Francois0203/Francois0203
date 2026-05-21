import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './index';

export const getGitHubProjects = async () => {
  const snap = await getDocs(
    query(collection(db, 'githubProjects'), orderBy('order')),
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
