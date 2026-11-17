import { useMemo } from 'react';
import { useCopy } from './copy/store';

export const NAVIGATION_PAGES = [
  { label: 'Home',     to: '/',         blurb: 'The short version', tone: 'yellow' },
  { label: 'Bio',      to: '/bio',      blurb: 'The longer story, and the record', tone: 'blue' },
  { label: 'Projects', to: '/projects', blurb: 'Live sites and the repositories', tone: 'green' },
  { label: 'Connect',  to: '/connect',  blurb: 'Send a letter, or find me elsewhere', tone: 'orange' },
];

// The next page, looping back to the first.
export const nextPage = (pathname) => {
  const i = NAVIGATION_PAGES.findIndex(p => p.to === pathname);
  if (i === -1) return null;
  return NAVIGATION_PAGES[(i + 1) % NAVIGATION_PAGES.length];
};

const WORDS = { '/': 'Home', '/bio': 'Bio', '/projects': 'Projects', '/connect': 'Connect' };

// The pages with their labels and descriptions from the admin's Site-wide copy.
export const useNavPages = () => {
  const t = useCopy('site');
  return useMemo(() => NAVIGATION_PAGES.map((p) => {
    const k = `nav${WORDS[p.to]}`;
    return { ...p, label: t[k] ?? p.label, blurb: t[`${k}Blurb`] ?? p.blurb };
  }), [t]);
};
