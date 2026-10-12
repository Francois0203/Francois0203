export const NAVIGATION_PAGES = [
  { label: 'Home',     to: '/',         blurb: 'The short version', tone: 'yellow' },
  { label: 'Bio',      to: '/bio',      blurb: 'The longer story, and the record', tone: 'blue' },
  { label: 'Projects', to: '/projects', blurb: 'Live sites and the repositories', tone: 'green' },
  { label: 'Connect',  to: '/connect',  blurb: 'Send a letter, or find me elsewhere', tone: 'orange' },
];

/** CSS variables that colour a page's tab: its fill, and readable text on that fill. */
export const tabStyle = (tone = 'yellow') => ({
  '--tab': `var(--c-${tone})`,
  '--tab-deep': `var(--c-${tone}-deep)`,
  '--tab-on': tone === 'blue' ? '#ffffff' : '#1f1f1f',
});

/** The page after `pathname`, wrapping. Null on /admin and the 404. */
export const nextPage = (pathname) => {
  const i = NAVIGATION_PAGES.findIndex(p => p.to === pathname);
  if (i === -1) return null;
  return NAVIGATION_PAGES[(i + 1) % NAVIGATION_PAGES.length];
};
